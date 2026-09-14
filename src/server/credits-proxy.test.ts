import { readFileSync } from 'node:fs'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { creditsProxyPath, handleCreditsProxy } from './credits-proxy'

vi.mock('./credits-sprite', () => ({
  creditsSpritePath: '/api/credits-sprite/',
  handleCreditsSprite: vi.fn(),
}))

import { creditsSpritePath, handleCreditsSprite } from './credits-sprite'

const manifestFixture = readFileSync(
  'tests/fixtures/credits-manifest.json',
  'utf8',
)
const parsedManifest: unknown = JSON.parse(manifestFixture)
const sheetName =
  (parsedManifest as { sheets: { url: string }[] }).sheets[0]?.url ?? ''
const manifestUrl = `https://poi.moe${creditsProxyPath}manifest.json`

const jsonFetcher = (body: string, init?: ResponseInit) =>
  vi.fn(async () => new Response(body, init))

describe('handleCreditsProxy', () => {
  beforeEach(() => {
    vi.mocked(handleCreditsSprite).mockReset()
  })

  afterEach(() => {
    delete process.env.TANSTACK_TEST_CREDITS_MANIFEST
  })

  it('ignores unrelated paths', async () => {
    await expect(
      handleCreditsProxy(new Request('https://poi.moe/credits')),
    ).resolves.toBeUndefined()
  })

  it('returns the raw upstream manifest body unchanged', async () => {
    process.env.TANSTACK_TEST_CREDITS_MANIFEST = manifestFixture
    const response = await handleCreditsProxy(
      new Request(manifestUrl, { headers: { Origin: 'null' } }),
    )

    expect(response?.status).toBe(200)
    expect(response?.headers.get('Content-Type')).toContain('application/json')
    expect(response?.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response?.headers.get('Cache-Control')).toBe('public, max-age=300')
    expect(await response?.text()).toBe(manifestFixture)
  })

  it('does not leak the internal cache headers or long retention', async () => {
    const upstream = new Response(manifestFixture, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=604800',
        'X-Poi-Next-Check': String(Date.now() + 60000),
        'X-Poi-Saved-At': String(Date.now()),
        'X-Poi-Upstream-Cache-Control': 'public, max-age=300',
      },
    })
    const response = await handleCreditsProxy(new Request(manifestUrl), {
      fetcher: vi.fn(async () => upstream),
    })

    expect(response?.status).toBe(200)
    expect(response?.headers.get('Cache-Control')).toBe('public, max-age=300')
    expect(response?.headers.get('X-Poi-Next-Check')).toBeNull()
    expect(response?.headers.get('X-Poi-Saved-At')).toBeNull()
    expect(response?.headers.get('X-Poi-Upstream-Cache-Control')).toBeNull()
  })

  it('answers HEAD with an empty body', async () => {
    process.env.TANSTACK_TEST_CREDITS_MANIFEST = manifestFixture
    const response = await handleCreditsProxy(
      new Request(manifestUrl, { method: 'HEAD' }),
    )

    expect(response?.status).toBe(200)
    expect(await response?.text()).toBe('')
    expect(response?.headers.get('Cache-Control')).toBe('public, max-age=300')
  })

  it('reports malformed or failed upstreams as a no-store 502', async () => {
    const malformed = await handleCreditsProxy(new Request(manifestUrl), {
      fetcher: jsonFetcher('not json'),
    })
    expect(malformed?.status).toBe(502)
    expect(malformed?.headers.get('Cache-Control')).toBe('no-store')
    expect(malformed?.headers.get('Access-Control-Allow-Origin')).toBe('*')

    const failed = await handleCreditsProxy(new Request(manifestUrl), {
      fetcher: vi.fn(async () => new Response('', { status: 500 })),
    })
    expect(failed?.status).toBe(502)

    const head = await handleCreditsProxy(
      new Request(manifestUrl, { method: 'HEAD' }),
      { fetcher: jsonFetcher('not json') },
    )
    expect(head?.status).toBe(502)
    expect(await head?.text()).toBe('')
  })

  it('answers OPTIONS with 204 and rejects unsupported methods with 405', async () => {
    const preflight = await handleCreditsProxy(
      new Request(manifestUrl, { method: 'OPTIONS' }),
    )
    expect(preflight?.status).toBe(204)
    expect(preflight?.headers.get('Allow')).toBe('GET, HEAD, OPTIONS')
    expect(preflight?.headers.get('Access-Control-Allow-Methods')).toBe(
      'GET, HEAD, OPTIONS',
    )

    const post = await handleCreditsProxy(
      new Request(manifestUrl, { method: 'POST' }),
    )
    expect(post?.status).toBe(405)
    expect(post?.headers.get('Allow')).toBe('GET, HEAD, OPTIONS')
    expect(post?.headers.get('Cache-Control')).toBe('no-store')
  })

  it('delegates hashed sheets to the canonical sprite handler', async () => {
    const sprite = vi.mocked(handleCreditsSprite)
    sprite.mockResolvedValue(
      new Response('image-bytes', {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }),
    )

    const response = await handleCreditsProxy(
      new Request(`https://poi.moe${creditsProxyPath}${sheetName}`),
    )

    expect(sprite).toHaveBeenCalledTimes(1)
    const delegated = sprite.mock.calls[0]?.[0]
    expect(delegated).toBeInstanceOf(Request)
    // The manifest's relative filename resolves to the canonical sprite path,
    // so both public routes share the same cache key.
    expect(new URL(delegated!.url).pathname).toBe(
      `${creditsSpritePath}${sheetName}`,
    )
    expect(response?.status).toBe(200)
    expect(response?.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response?.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable',
    )

    await handleCreditsProxy(
      new Request(`https://poi.moe${creditsProxyPath}${sheetName}`, {
        method: 'HEAD',
      }),
    )
    expect(sprite.mock.calls[1]?.[0].method).toBe('HEAD')
  })

  it('strips the body on HEAD even for proxied sheet errors', async () => {
    vi.mocked(handleCreditsSprite).mockResolvedValue(
      new Response('Bad Gateway', {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      }),
    )

    const head = await handleCreditsProxy(
      new Request(`https://poi.moe${creditsProxyPath}${sheetName}`, {
        method: 'HEAD',
      }),
    )
    expect(head?.status).toBe(502)
    expect(await head?.text()).toBe('')
    expect(head?.headers.get('Access-Control-Allow-Origin')).toBe('*')

    const get = await handleCreditsProxy(
      new Request(`https://poi.moe${creditsProxyPath}${sheetName}`),
    )
    expect(get?.status).toBe(502)
    expect(await get?.text()).toBe('Bad Gateway')
  })

  it('preserves the sprite handler 404 for unknown sheets', async () => {
    vi.mocked(handleCreditsSprite).mockResolvedValue(
      new Response('Not Found', { status: 404 }),
    )
    const response = await handleCreditsProxy(
      new Request(`https://poi.moe${creditsProxyPath}not-a-sheet.txt`),
    )

    expect(response?.status).toBe(404)
    expect(response?.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})
