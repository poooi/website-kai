import { type FetchLike } from '~/lib/fetch-poi-versions'

export const creditsSpritePath = '/api/credits-sprite/'

const sheetFilePattern = /^avatars-\d+\.[0-9a-f]{6,64}\.(png|webp)$/
const upstreamBase =
  'https://raw.githubusercontent.com/poooi/contributors/master/dist/avatars/'
const cacheName = 'poi-credits-sprite-v1'
const maxBytes = 4 * 1024 * 1024
const defaultTimeoutMs = 8_000
const immutableCacheControl = 'public, max-age=31536000, immutable'

export interface CreditsSpriteCache {
  match(key: string): Promise<Response | undefined>
  put(key: string, response: Response): Promise<void>
}

export interface CreditsSpriteOptions {
  fetcher?: FetchLike
  cache?: CreditsSpriteCache
  timeoutMs?: number
}

const badGateway = () =>
  new Response('Bad Gateway', {
    status: 502,
    headers: { 'Cache-Control': 'no-store' },
  })

const openCache = async (
  supplied?: CreditsSpriteCache,
): Promise<CreditsSpriteCache | undefined> => {
  if (supplied) return supplied
  try {
    return typeof caches === 'undefined'
      ? undefined
      : await caches.open(cacheName)
  } catch {
    return undefined
  }
}

const matchCache = async (
  cache: CreditsSpriteCache | undefined,
  key: string,
): Promise<Response | undefined> => {
  try {
    return await cache?.match(key)
  } catch {
    return undefined
  }
}

const putCache = async (
  cache: CreditsSpriteCache | undefined,
  key: string,
  response: Response,
): Promise<void> => {
  try {
    await cache?.put(key, response)
  } catch {
    return
  }
}

/** Reads an upstream body, bounding both the declared length and the streamed
 * bytes so a hostile or runaway sheet cannot exhaust memory. */
const readBounded = async (
  response: Response,
  limit: number,
): Promise<Uint8Array | undefined> => {
  const declared = Number(response.headers.get('Content-Length'))
  if (Number.isFinite(declared) && declared > limit) return undefined

  const reader = response.body?.getReader()
  if (!reader) {
    const buffer = new Uint8Array(await response.arrayBuffer())
    return buffer.byteLength > limit ? undefined : buffer
  }

  const chunks: Uint8Array[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > limit) {
        await reader.cancel().catch(() => undefined)
        return undefined
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

/** A sheet is only cacheable when the bytes really match the format implied by
 * its hashed extension, so a mislabeled or empty 200 never becomes a
 * long-lived broken image. */
const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const webpRiff = [0x52, 0x49, 0x46, 0x46]
const webpTag = [0x57, 0x45, 0x42, 0x50]

const matches = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, index) => bytes[offset + index] === byte)

const sheetFormats = {
  png: {
    contentType: 'image/png',
    isSignature: (bytes: Uint8Array) =>
      bytes.byteLength >= 8 && matches(bytes, pngSignature),
  },
  webp: {
    contentType: 'image/webp',
    isSignature: (bytes: Uint8Array) =>
      bytes.byteLength >= 12 &&
      matches(bytes, webpRiff) &&
      matches(bytes, webpTag, 8),
  },
} as const

type SheetExtension = keyof typeof sheetFormats

/** Fetches a hashed sheet resource (no HTTP method routing: the credits API
 * owns that). Returns undefined for an invalid filename and a no-store 502 for
 * upstream, content-type, signature or size failures. */
export async function fetchCreditsSprite(
  filename: string,
  requestUrl: string,
  options: CreditsSpriteOptions = {},
): Promise<Response | undefined> {
  let decoded: string
  try {
    decoded = decodeURIComponent(filename)
  } catch {
    return undefined
  }
  if (!sheetFilePattern.test(decoded)) return undefined
  const extension = decoded.slice(decoded.lastIndexOf('.') + 1)
  const format = sheetFormats[extension as SheetExtension]
  if (!format) return undefined

  // Cloudflare's Cache API only accepts absolute URLs as keys.
  const cacheKey = new URL(
    `${creditsSpritePath}${decoded}`,
    requestUrl,
  ).toString()
  const cache = await openCache(options.cache)
  const cached = await matchCache(cache, cacheKey)
  if (cached) return cached

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? defaultTimeoutMs,
  )
  try {
    const fixture = process.env.TANSTACK_TEST_CREDITS_SHEET
    const upstream = fixture
      ? new Response(
          Uint8Array.from(atob(fixture), (c) => c.charCodeAt(0)),
          {
            status: 200,
            headers: { 'Content-Type': format.contentType },
          },
        )
      : await (options.fetcher ?? fetch)(`${upstreamBase}${decoded}`, {
          signal: controller.signal,
        })
    if (!upstream.ok) return badGateway()

    const contentType = (
      upstream.headers.get('Content-Type') ?? ''
    ).toLowerCase()
    if (!contentType.startsWith(format.contentType)) return badGateway()

    const body = await readBounded(upstream, maxBytes)
    if (!body || !format.isSignature(body)) return badGateway()

    const response = new Response(body.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': format.contentType,
        'Cache-Control': immutableCacheControl,
        'Content-Length': String(body.byteLength),
      },
    })
    await putCache(cache, cacheKey, response.clone())
    return response
  } catch {
    return badGateway()
  } finally {
    clearTimeout(timeout)
    controller.abort()
  }
}
