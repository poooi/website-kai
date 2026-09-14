import { readFileSync } from 'node:fs'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { creditsProxyPath, handleCreditsProxy } from './credits-proxy'

const manifestFixture = readFileSync(
  'tests/fixtures/credits-manifest.json',
  'utf8',
)
const parsedManifest: unknown = JSON.parse(manifestFixture)
const sheetName =
  (parsedManifest as { sheets: { url: string }[] }).sheets[0]?.url ?? ''
const manifestUrl = `https://poi.moe${creditsProxyPath}manifest.json`

const sheet = () =>
  new Response(
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    { status: 200, headers: { 'Content-Type': 'image/png' } },
  )

const jsonFetcher = (body: string, init?: ResponseInit) =>
  vi.fn(async () => new Response(body, init))

describe('handleCreditsProxy', () => {
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
    const response = await handleCreditsProxy(new Request(manifestUrl))

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

  it('answers OPTIONS with reflected headers and rejects unsupported methods', async () => {
    const preflight = await handleCreditsProxy(
      new Request(manifestUrl, {
        method: 'OPTIONS',
        headers: {
          Origin: 'null',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type,x-poi-client',
        },
      }),
    )
    expect(preflight?.status).toBe(204)
    expect(preflight?.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(preflight?.headers.get('Allow')).toBe('GET, HEAD, OPTIONS')
    expect(preflight?.headers.get('Access-Control-Allow-Methods')).toBe(
      'GET, HEAD, OPTIONS',
    )
    expect(preflight?.headers.get('Access-Control-Allow-Headers')).toBe(
      'content-type,x-poi-client',
    )
    expect(preflight?.headers.get('Vary')).toBe(
      'Access-Control-Request-Headers',
    )

    const barePreflight = await handleCreditsProxy(
      new Request(manifestUrl, { method: 'OPTIONS' }),
    )
    expect(barePreflight?.status).toBe(204)
    expect(barePreflight?.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(barePreflight?.headers.get('Access-Control-Allow-Headers')).toBe('')

    const post = await handleCreditsProxy(
      new Request(manifestUrl, { method: 'POST' }),
    )
    expect(post?.status).toBe(405)
    expect(post?.headers.get('Allow')).toBe('GET, HEAD, OPTIONS')
    expect(post?.headers.get('Cache-Control')).toBe('no-store')
  })

  it('serves hashed sheets on the public and legacy prefixes from one resource', async () => {
    const fetcher = vi.fn(async () => sheet())

    for (const path of [
      `${creditsProxyPath}${sheetName}`,
      `/api/credits-sprite/${sheetName}`,
    ]) {
      const response = await handleCreditsProxy(
        new Request(`https://poi.moe${path}`),
        { fetcher },
      )
      expect(response?.status, path).toBe(200)
      expect(response?.headers.get('Content-Type'), path).toBe('image/png')
      expect(response?.headers.get('Cache-Control'), path).toBe(
        'public, max-age=31536000, immutable',
      )
      expect(response?.headers.get('Access-Control-Allow-Origin'), path).toBe(
        '*',
      )
    }
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('keeps the legacy prefix sprite-only and 404s unknown sheets', async () => {
    const legacyManifest = await handleCreditsProxy(
      new Request('https://poi.moe/api/credits-sprite/manifest.json'),
    )
    expect(legacyManifest?.status).toBe(404)

    const unknown = await handleCreditsProxy(
      new Request('https://poi.moe/api/credits/not-a-sheet.txt'),
    )
    expect(unknown?.status).toBe(404)
    expect(unknown?.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('strips the body on HEAD for proxy errors', async () => {
    const fetcher = vi.fn(async () => new Response('', { status: 500 }))

    const head = await handleCreditsProxy(
      new Request(`https://poi.moe${creditsProxyPath}${sheetName}`, {
        method: 'HEAD',
      }),
      { fetcher },
    )
    expect(head?.status).toBe(502)
    expect(await head?.text()).toBe('')

    const get = await handleCreditsProxy(
      new Request(`https://poi.moe${creditsProxyPath}${sheetName}`),
      { fetcher },
    )
    expect(get?.status).toBe(502)
    expect(await get?.text()).toBe('Bad Gateway')
  })
})
