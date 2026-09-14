import { describe, expect, it, vi } from 'vitest'

import { type CreditsSpriteCache, fetchCreditsSprite } from './credits-sprite'

const requestUrl = 'https://poi.moe/api/credits-sprite/'
const filename = 'avatars-0.0123456789abcdef.webp'
const cacheKey = `${requestUrl}${filename}`
const upstreamUrl =
  'https://raw.githubusercontent.com/poooi/contributors/master/dist/avatars/' +
  filename

const pngFilename = 'avatars-0.0123456789abcdef.png'
const pngCacheKey = `${requestUrl}${pngFilename}`
const pngUpstreamUrl =
  'https://raw.githubusercontent.com/poooi/contributors/master/dist/avatars/' +
  pngFilename

const webp = () =>
  new Response(
    new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
    ]),
    { status: 200, headers: { 'Content-Type': 'image/webp' } },
  )

const png = () =>
  new Response(
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    { status: 200, headers: { 'Content-Type': 'image/png' } },
  )

const fakeCache = (initial?: Response, key = cacheKey) => {
  const store = new Map<string, Response>()
  const matches: string[] = []
  if (initial) store.set(key, initial)
  const cache: CreditsSpriteCache = {
    match: vi.fn(async (key: string) => {
      matches.push(key)
      return store.get(key)
    }),
    put: vi.fn(async (key: string, response: Response) => {
      store.set(key, response)
    }),
  }
  return { cache, store, matches }
}

const call = (
  name: string,
  options: {
    cache?: CreditsSpriteCache
    fetcher?: typeof globalThis.fetch
  } = {},
) => fetchCreditsSprite(name, requestUrl, options)

describe('fetchCreditsSprite', () => {
  it.each([
    'avatars-0.webp',
    'avatars-0.zzzzzz.webp',
    'avatars-0.0123.png',
    'avatars-0.zzzzzz.png',
    'avatars-0.0123.gif',
    'secret.webp',
    'secret.png',
    'avatars-0.012345.webp/secret',
    'manifest.json',
  ])('returns undefined for untrusted filename %s', async (name) => {
    const { cache, store } = fakeCache()
    await expect(call(name, { cache })).resolves.toBeUndefined()
    expect(store.size).toBe(0)
  })

  it.each([
    'https://poi.moe/api/credits-sprite/',
    'https://poi.moe/api/credits/',
  ])('keys the cache by the canonical URL for %s', async (url) => {
    const { cache, matches } = fakeCache(webp())
    const fetcher = vi.fn() as unknown as typeof globalThis.fetch
    const response = await fetchCreditsSprite(filename, url, {
      cache,
      fetcher,
    })

    expect(matches).toEqual([cacheKey])
    expect(response?.status).toBe(200)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('fetches, validates and caches a webp on a miss', async () => {
    const { cache, store } = fakeCache()
    const fetcher = vi.fn(async () =>
      webp(),
    ) as unknown as typeof globalThis.fetch
    const response = await call(filename, { cache, fetcher })

    expect(fetcher).toHaveBeenCalledWith(upstreamUrl, expect.anything())
    expect(response?.status).toBe(200)
    expect(response?.headers.get('Content-Type')).toBe('image/webp')
    expect(response?.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable',
    )
    expect(store.has(cacheKey)).toBe(true)
  })

  it('serves a hash-named png sheet with the png content type', async () => {
    const { cache, store } = fakeCache(undefined, pngCacheKey)
    const fetcher = vi.fn(async () =>
      png(),
    ) as unknown as typeof globalThis.fetch
    const response = await call(pngFilename, { cache, fetcher })

    expect(fetcher).toHaveBeenCalledWith(pngUpstreamUrl, expect.anything())
    expect(response?.status).toBe(200)
    expect(response?.headers.get('Content-Type')).toBe('image/png')
    expect(store.has(pngCacheKey)).toBe(true)
  })

  it('rejects extension, content type and signature mismatches', async () => {
    const cases = [
      {
        path: pngFilename,
        key: pngCacheKey,
        body: new Uint8Array([
          0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
        ]),
        contentType: 'image/png',
      },
      {
        path: filename,
        key: cacheKey,
        body: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        contentType: 'image/webp',
      },
      {
        path: pngFilename,
        key: pngCacheKey,
        body: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        contentType: 'image/webp',
      },
    ]

    for (const { path, key, body, contentType } of cases) {
      const { cache, store } = fakeCache(undefined, key)
      const fetcher = vi.fn(
        async () =>
          new Response(body.buffer, {
            status: 200,
            headers: { 'Content-Type': contentType },
          }),
      ) as unknown as typeof globalThis.fetch

      expect((await call(path, { cache, fetcher }))?.status).toBe(502)
      expect(store.size).toBe(0)
    }
  })

  it('degrades to the upstream response when cache writes fail', async () => {
    const cache: CreditsSpriteCache = {
      match: vi.fn(async () => {
        throw new Error('cache offline')
      }),
      put: vi.fn(async () => {
        throw new Error('cache offline')
      }),
    }
    const fetcher = vi.fn(async () =>
      webp(),
    ) as unknown as typeof globalThis.fetch

    expect((await call(filename, { cache, fetcher }))?.status).toBe(200)
  })

  it('reports upstream failures without caching', async () => {
    const { cache, store } = fakeCache()
    const nonWebp = vi.fn(
      async () =>
        new Response('<html></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
    ) as unknown as typeof globalThis.fetch
    const noSignature = vi.fn(
      async () =>
        new Response('<html></html>', {
          status: 200,
          headers: { 'Content-Type': 'image/webp' },
        }),
    ) as unknown as typeof globalThis.fetch
    const empty = vi.fn(
      async () =>
        new Response(new Uint8Array(0), {
          headers: { 'Content-Type': 'image/webp' },
        }),
    ) as unknown as typeof globalThis.fetch
    const oversize = vi.fn(
      async () =>
        new Response(new Uint8Array(4 * 1024 * 1024 + 1), {
          headers: { 'Content-Type': 'image/webp' },
        }),
    ) as unknown as typeof globalThis.fetch
    const missing = vi.fn(
      async () => new Response('', { status: 404 }),
    ) as unknown as typeof globalThis.fetch
    const offline = vi.fn(async () => {
      throw new Error('offline')
    }) as unknown as typeof globalThis.fetch

    for (const fetcher of [
      nonWebp,
      noSignature,
      empty,
      oversize,
      missing,
      offline,
    ]) {
      const response = await call(filename, { cache, fetcher })
      expect(response?.status).toBe(502)
      expect(response?.headers.get('Cache-Control')).toBe('no-store')
    }
    expect(store.size).toBe(0)
  })
})
