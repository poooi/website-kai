import { describe, expect, it, vi } from 'vitest'

import { type CreditsSpriteCache, handleCreditsSprite } from './credits-sprite'

const filename = 'avatars-0.0123456789abcdef.webp'
const cacheKey = `https://poi.moe/api/credits-sprite/${filename}`
const upstreamUrl =
  'https://raw.githubusercontent.com/poooi/contributors/master/dist/avatars/' +
  filename

const webp = () =>
  new Response(
    new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
    ]),
    {
      status: 200,
      headers: { 'Content-Type': 'image/webp' },
    },
  )

const fakeCache = (initial?: Response) => {
  const store = new Map<string, Response>()
  const matches: string[] = []
  if (initial) store.set(cacheKey, initial)
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

const request = (path: string, method = 'GET') =>
  new Request(`https://poi.moe/api/credits-sprite/${path}`, { method })

describe('handleCreditsSprite', () => {
  it('ignores unrelated paths', async () => {
    await expect(
      handleCreditsSprite(new Request('https://poi.moe/en/credits')),
    ).resolves.toBeUndefined()
  })

  it.each([
    'avatars-0.webp',
    'avatars-0.zzzzzz.webp',
    'avatars-0.0123.png',
    'secret.webp',
    'avatars-0.012345.webp/secret',
  ])('rejects untrusted filename %s', async (name) => {
    const { cache } = fakeCache()
    const response = await handleCreditsSprite(request(name), { cache })

    expect(response?.status).toBe(404)
    expect(response?.headers.get('Cache-Control')).toBe('no-store')
  })

  it('keys the cache by absolute URL so hits skip the upstream', async () => {
    const { cache, matches } = fakeCache(webp())
    const fetcher = vi.fn() as unknown as typeof fetch
    const response = await handleCreditsSprite(request(filename), {
      cache,
      fetcher,
    })

    expect(matches).toEqual([cacheKey])
    expect(response?.status).toBe(200)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('fetches, validates and caches a webp on a miss', async () => {
    const { cache, store } = fakeCache()
    const fetcher = vi.fn(async () => webp()) as unknown as typeof fetch
    const response = await handleCreditsSprite(request(filename), {
      cache,
      fetcher,
    })

    expect(fetcher).toHaveBeenCalledWith(upstreamUrl, expect.anything())
    expect(response?.status).toBe(200)
    expect(response?.headers.get('Content-Type')).toBe('image/webp')
    expect(response?.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable',
    )
    expect(store.has(cacheKey)).toBe(true)
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
    const fetcher = vi.fn(async () => webp()) as unknown as typeof fetch
    const response = await handleCreditsSprite(request(filename), {
      cache,
      fetcher,
    })

    expect(response?.status).toBe(200)
  })

  it('drops non-webp upstream responses without caching', async () => {
    const { cache, store } = fakeCache()
    const fetcher = vi.fn(
      async () =>
        new Response('<html></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
    ) as unknown as typeof fetch
    const response = await handleCreditsSprite(request(filename), {
      cache,
      fetcher,
    })

    expect(response?.status).toBe(502)
    expect(response?.headers.get('Cache-Control')).toBe('no-store')
    expect(store.size).toBe(0)
  })

  it('rejects a webp-labeled body without the RIFF signature', async () => {
    const { cache, store } = fakeCache()
    const fetcher = vi.fn(
      async () =>
        new Response('<html></html>', {
          status: 200,
          headers: { 'Content-Type': 'image/webp' },
        }),
    ) as unknown as typeof fetch
    const response = await handleCreditsSprite(request(filename), {
      cache,
      fetcher,
    })

    expect(response?.status).toBe(502)
    expect(store.size).toBe(0)
  })

  it('rejects empty, oversized and non-ok upstream bodies without caching', async () => {
    const { cache, store } = fakeCache()
    const empty = vi.fn(
      async () =>
        new Response(new Uint8Array(0), {
          headers: { 'Content-Type': 'image/webp' },
        }),
    ) as unknown as typeof fetch
    const oversize = vi.fn(
      async () =>
        new Response(new Uint8Array(4 * 1024 * 1024 + 1), {
          headers: { 'Content-Type': 'image/webp' },
        }),
    ) as unknown as typeof fetch
    const missing = vi.fn(
      async () => new Response('', { status: 404 }),
    ) as unknown as typeof fetch

    for (const fetcher of [empty, oversize, missing])
      expect(
        (await handleCreditsSprite(request(filename), { cache, fetcher }))
          ?.status,
      ).toBe(502)
    expect(store.size).toBe(0)
  })

  it('returns 502 without caching when the upstream throws', async () => {
    const { cache, store } = fakeCache()
    const fetcher = vi.fn(async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    const response = await handleCreditsSprite(request(filename), {
      cache,
      fetcher,
    })

    expect(response?.status).toBe(502)
    expect(store.size).toBe(0)
  })

  it('answers HEAD without a body and rejects other methods', async () => {
    const { cache } = fakeCache(webp())
    const head = await handleCreditsSprite(request(filename, 'HEAD'), {
      cache,
    })
    expect(head?.status).toBe(200)
    expect(await head?.text()).toBe('')

    const post = await handleCreditsSprite(request(filename, 'POST'), { cache })
    expect(post?.status).toBe(405)
    expect(post?.headers.get('Allow')).toBe('GET, HEAD')
  })
})
