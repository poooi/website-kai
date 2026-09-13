import {
  fetchWithTimeout,
  type FetchLike,
  UpstreamResponseError,
} from './fetch-poi-versions'

type ReleaseCache = {
  match(key: string): Promise<Response | undefined>
  put(key: string, response: Response): Promise<void>
  delete(key: string): Promise<boolean>
}

const retentionSeconds = 7 * 24 * 60 * 60
const nextCheckHeader = 'X-Poi-Next-Check'
const savedAtHeader = 'X-Poi-Saved-At'
const pending = new Map<string, Promise<Response>>()
const upstreamControlHeader = 'X-Poi-Upstream-Cache-Control'

function cachePolicy(headers: Headers, time: number) {
  const control = headers.get('Cache-Control') ?? ''
  const maxAge =
    /(?:^|,)\s*s-maxage\s*=\s*"?(\d+)/i.exec(control) ??
    /(?:^|,)\s*max-age\s*=\s*"?(\d+)/i.exec(control)
  const date = Date.parse(headers.get('Date') ?? '')
  const expires = Date.parse(headers.get('Expires') ?? '')
  const age = Math.max(
    Number(headers.get('Age')) || 0,
    Number.isFinite(date) ? (time - date) / 1000 : 0,
  )
  const lifetime = maxAge
    ? Number(maxAge[1])
    : Number.isFinite(expires)
      ? (expires - (Number.isFinite(date) ? date : time)) / 1000
      : 300
  return {
    store: !/(?:^|,)\s*(?:no-store|private)\b/i.test(control),
    fresh: /(?:^|,)\s*no-cache\b/i.test(control)
      ? 0
      : Math.max(0, lifetime - age),
    stale:
      !/(?:^|,)\s*(?:no-cache|must-revalidate|proxy-revalidate|s-maxage)\b/i.test(
        control,
      ),
    control,
  }
}

async function edgeCache() {
  try {
    return typeof caches === 'undefined'
      ? undefined
      : await caches.open('poi-release-notes-v1')
  } catch {
    return undefined
  }
}

/** Cache public source documents, never user-specific HTML. Only validated 200s
 * and short-lived missing-language 404s are stored. A failed revalidation keeps
 * the last good document for up to seven days, with a one-minute retry backoff. */
export async function fetchCachedRelease(
  url: string,
  {
    validate,
    fetcher = fetch,
    timeoutMs = 3000,
    signal,
    cache: suppliedCache,
    now = Date.now,
  }: {
    validate: (text: string) => void
    fetcher?: FetchLike
    timeoutMs?: number
    signal?: AbortSignal
    cache?: ReleaseCache
    now?: () => number
  },
): Promise<Response> {
  const cache =
    suppliedCache ?? (fetcher === fetch ? await edgeCache() : undefined)
  const key = `https://poi.moe/__release-cache/v1?source=${encodeURIComponent(url)}`
  const cached = await cache?.match(key).catch(() => undefined)
  const time = now()
  if (cached && Number(cached.headers.get(nextCheckHeader)) > time)
    return cached

  const refresh = async () => {
    const headers = new Headers()
    const etag = cached?.headers.get('ETag')
    if (etag && cached?.ok) headers.set('If-None-Match', etag)
    const store = async (response: Response, fresh: number, savedAt = time) => {
      const copy = new Response(await response.text(), response)
      copy.headers.delete('Content-Length')
      copy.headers.delete('Content-Encoding')
      copy.headers.set(nextCheckHeader, String(time + fresh * 1000))
      copy.headers.set(savedAtHeader, String(savedAt))
      copy.headers.set(
        'Cache-Control',
        `public, max-age=${Math.max(1, Math.floor(retentionSeconds - (time - savedAt) / 1000))}`,
      )
      await cache?.put(key, copy.clone()).catch(() => undefined)
      return copy
    }
    try {
      const response = await fetchWithTimeout(
        fetcher,
        url,
        { headers, signal },
        timeoutMs,
      )
      if (response.status === 304 && cached?.ok) {
        const revalidated = new Response(await cached.clone().text(), cached)
        revalidated.headers.set(
          'Cache-Control',
          cached.headers.get(upstreamControlHeader) ?? '',
        )
        revalidated.headers.set('Date', new Date(time).toUTCString())
        revalidated.headers.delete('Age')
        response.headers.forEach((value, key) =>
          revalidated.headers.set(key, value),
        )
        const policy = cachePolicy(revalidated.headers, time)
        if (!policy.store) {
          await cache?.delete(key).catch(() => false)
          return revalidated
        }
        revalidated.headers.set(upstreamControlHeader, policy.control)
        return await store(revalidated, policy.fresh)
      }
      if (response.status === 404 && !cached?.ok) {
        const policy = cachePolicy(response.headers, time)
        const fresh = Math.min(60, policy.fresh)
        const missing = new Response('', { status: 404 })
        missing.headers.set(nextCheckHeader, String(time + fresh * 1000))
        missing.headers.set(
          'Cache-Control',
          `public, max-age=${Math.max(1, Math.floor(fresh))}`,
        )
        if (policy.store)
          await cache?.put(key, missing.clone()).catch(() => undefined)
        else await cache?.delete(key).catch(() => false)
        return missing
      }
      if (!response.ok) throw new UpstreamResponseError(response.status)
      const text = await response.text()
      validate(text)
      const policy = cachePolicy(response.headers, time)
      const validated = new Response(text, response)
      if (!policy.store) {
        await cache?.delete(key).catch(() => false)
        return validated
      }
      validated.headers.set(upstreamControlHeader, policy.control)
      return await store(validated, policy.fresh)
    } catch (error) {
      const savedAt = Number(cached?.headers.get(savedAtHeader))
      const staleAllowed = cachePolicy(
        new Headers({
          'Cache-Control': cached?.headers.get(upstreamControlHeader) ?? '',
        }),
        time,
      ).stale
      if (
        cached?.ok &&
        staleAllowed &&
        savedAt > 0 &&
        time - savedAt < retentionSeconds * 1000 &&
        !signal?.aborted
      )
        return await store(cached.clone(), 60, savedAt)
      throw error
    }
  }
  // Coalesce public-document refreshes within an isolate. Custom fetchers and
  // explicitly cancellable callers stay independent.
  if (!cache || signal || fetcher !== fetch) return refresh()
  const existing = pending.get(url)
  if (existing) return (await existing).clone()
  const request = refresh()
  pending.set(url, request)
  try {
    return (await request).clone()
  } finally {
    pending.delete(url)
  }
}
