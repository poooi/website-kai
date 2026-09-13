import { describe, expect, it, vi } from 'vitest'
import { fetchCachedRelease } from './release-cache.server'

const url =
  'https://raw.githubusercontent.com/poooi/poi-release/main/history/stable.json'
const validate = (text: string) => {
  JSON.parse(text)
}
const createCache = () => {
  const values = new Map<string, Response>()
  return {
    values,
    match: async (key: string) => values.get(key)?.clone(),
    put: async (key: string, response: Response) => {
      values.set(key, response.clone())
    },
    delete: async (key: string) => values.delete(key),
  }
}
const response = (body = '{"ok":true}', control = 'max-age=300') =>
  new Response(body, { headers: { 'Cache-Control': control, ETag: '"one"' } })

describe('release source cache', () => {
  it('uses upstream max-age and ETag revalidation rather than fetching on every request', async () => {
    const cache = createCache(),
      fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(response())
        .mockResolvedValueOnce(new Response(null, { status: 304 }))
    let time = 1_000_000
    const options = { cache, fetcher, validate, now: () => time }
    expect(await (await fetchCachedRelease(url, options)).json()).toEqual({
      ok: true,
    })
    time += 299_000
    expect(await (await fetchCachedRelease(url, options)).json()).toEqual({
      ok: true,
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
    time += 2000
    await fetchCachedRelease(url, options)
    expect(
      new Headers(fetcher.mock.calls[1]![1]?.headers).get('If-None-Match'),
    ).toBe('"one"')
    time += 299_000
    await fetchCachedRelease(url, options)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('subtracts Age and prefers shared-cache max-age', async () => {
    const cache = createCache(),
      fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
        const result = response('{}', 'max-age=1000, s-maxage=60')
        result.headers.set('Age', '50')
        return result
      })
    let time = 1_000_000
    const options = { cache, fetcher, validate, now: () => time }
    await fetchCachedRelease(url, options)
    time += 9000
    await fetchCachedRelease(url, options)
    expect(fetcher).toHaveBeenCalledTimes(1)
    time += 2000
    await fetchCachedRelease(url, options)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('keeps validated stale data on rate limits and malformed responses, with retry backoff', async () => {
    const cache = createCache(),
      fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(response())
        .mockResolvedValueOnce(new Response('rate limit', { status: 429 }))
        .mockResolvedValueOnce(response('not JSON'))
    let time = 1_000_000
    const options = { cache, fetcher, validate, now: () => time }
    await fetchCachedRelease(url, options)
    time += 301_000
    expect(await (await fetchCachedRelease(url, options)).json()).toEqual({
      ok: true,
    })
    time += 59_000
    await fetchCachedRelease(url, options)
    expect(fetcher).toHaveBeenCalledTimes(2)
    time += 2000
    expect(await (await fetchCachedRelease(url, options)).json()).toEqual({
      ok: true,
    })
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
  it.each(['no-store', 'private'])(
    'does not store %s responses',
    async (control) => {
      const cache = createCache(),
        fetcher = vi
          .fn<typeof fetch>()
          .mockImplementation(async () => response('{}', control))
      await fetchCachedRelease(url, { cache, fetcher, validate })
      expect(cache.values.size).toBe(0)
    },
  )
  it.each(['no-cache', 'max-age=0, must-revalidate', 's-maxage=0'])(
    'requires successful revalidation for %s',
    async (control) => {
      const cache = createCache(),
        fetcher = vi
          .fn<typeof fetch>()
          .mockResolvedValueOnce(response('{}', control))
          .mockResolvedValueOnce(new Response('', { status: 503 }))
      await fetchCachedRelease(url, { cache, fetcher, validate })
      await expect(
        fetchCachedRelease(url, { cache, fetcher, validate }),
      ).rejects.toThrow('503')
    },
  )
  it('does not replace a cold cache with invalid data and recovers on the next request', async () => {
    const cache = createCache(),
      fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(response('invalid'))
        .mockResolvedValueOnce(response())
    await expect(
      fetchCachedRelease(url, { cache, fetcher, validate }),
    ).rejects.toThrow()
    expect(cache.values.size).toBe(0)
    expect(
      await (
        await fetchCachedRelease(url, { cache, fetcher, validate })
      ).json(),
    ).toEqual({ ok: true })
  })
  it('uses Expires relative to Date when max-age is absent', async () => {
    const cache = createCache()
    let time = 1_000_000
    const fetcher = vi.fn<typeof fetch>().mockImplementation(
      async () =>
        new Response('{}', {
          headers: {
            Date: new Date(990_000).toUTCString(),
            Expires: new Date(1_050_000).toUTCString(),
          },
        }),
    )
    const options = { cache, fetcher, validate, now: () => time }
    await fetchCachedRelease(url, options)
    time += 49_000
    await fetchCachedRelease(url, options)
    expect(fetcher).toHaveBeenCalledTimes(1)
    time += 2000
    await fetchCachedRelease(url, options)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('stops serving stale snapshots after seven days', async () => {
    const cache = createCache()
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response())
      .mockImplementation(async () => new Response('', { status: 503 }))
    let time = 1_000_000
    const options = { cache, fetcher, validate, now: () => time }
    await fetchCachedRelease(url, options)
    time += 7 * 24 * 60 * 60 * 1000 - 61_000
    expect((await fetchCachedRelease(url, options)).ok).toBe(true)
    time += 62_000
    await expect(fetchCachedRelease(url, options)).rejects.toThrow('503')
  })
  it('briefly caches absent language files without poisoning another language', async () => {
    const cache = createCache(),
      fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(new Response('', { status: 404 }))
        .mockResolvedValueOnce(response())
    expect(
      (await fetchCachedRelease(url, { cache, fetcher, validate })).status,
    ).toBe(404)
    expect(
      (await fetchCachedRelease(url, { cache, fetcher, validate })).status,
    ).toBe(404)
    expect(
      (
        await fetchCachedRelease(url + '?language=en', {
          cache,
          fetcher,
          validate,
        })
      ).status,
    ).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
