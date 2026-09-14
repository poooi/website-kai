import { readFileSync } from 'node:fs'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  manifestResponse,
  methodNotAllowedResponse,
  preflightResponse,
  spriteResponse,
} from './credits-proxy'

const manifestFixture = readFileSync(
  'tests/fixtures/credits-manifest.json',
  'utf8',
)
const parsedManifest: unknown = JSON.parse(manifestFixture)
const sheetName =
  (parsedManifest as { sheets: { url: string }[] }).sheets[0]?.url ?? ''

const sheet = () =>
  new Response(
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    { status: 200, headers: { 'Content-Type': 'image/png' } },
  )

const jsonFetcher = (body: string, init?: ResponseInit) =>
  vi.fn(async () => new Response(body, init))

describe('credits API responses', () => {
  afterEach(() => {
    delete process.env.TANSTACK_TEST_CREDITS_MANIFEST
  })

  it('returns the raw upstream manifest with short caching and CORS', async () => {
    process.env.TANSTACK_TEST_CREDITS_MANIFEST = manifestFixture
    const response = await manifestResponse()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(await response.text()).toBe(manifestFixture)
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
    const response = await manifestResponse(vi.fn(async () => upstream))

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300')
    expect(response.headers.get('X-Poi-Next-Check')).toBeNull()
    expect(response.headers.get('X-Poi-Saved-At')).toBeNull()
    expect(response.headers.get('X-Poi-Upstream-Cache-Control')).toBeNull()
  })

  it('reports malformed or failed manifests as a no-store 502', async () => {
    const malformed = await manifestResponse(jsonFetcher('not json'))
    expect(malformed.status).toBe(502)
    expect(malformed.headers.get('Cache-Control')).toBe('no-store')
    expect(malformed.headers.get('Access-Control-Allow-Origin')).toBe('*')

    const failed = await manifestResponse(
      vi.fn(async () => new Response('', { status: 500 })),
    )
    expect(failed.status).toBe(502)
  })

  it('serves hashed sheets from both prefixes through the shared resource', async () => {
    const fetcher = vi.fn(async () => sheet())

    for (const url of [
      'https://poi.moe/api/credits/',
      'https://poi.moe/api/credits-sprite/',
    ]) {
      const response = await spriteResponse(sheetName, url, fetcher)
      expect(response.status, url).toBe(200)
      expect(response.headers.get('Content-Type'), url).toBe('image/png')
      expect(response.headers.get('Cache-Control'), url).toBe(
        'public, max-age=31536000, immutable',
      )
      expect(response.headers.get('Access-Control-Allow-Origin'), url).toBe('*')
    }
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('404s unknown sheet filenames with CORS', async () => {
    const response = await spriteResponse(
      'not-a-sheet.txt',
      'https://poi.moe/api/credits/',
    )

    expect(response.status).toBe(404)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('reflects preflight request headers and Vary', () => {
    const preflight = preflightResponse(
      new Request('https://poi.moe/api/credits/manifest.json', {
        method: 'OPTIONS',
        headers: {
          Origin: 'null',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type,x-poi-client',
        },
      }),
    )
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(preflight.headers.get('Allow')).toBe('GET, HEAD, OPTIONS')
    expect(preflight.headers.get('Access-Control-Allow-Methods')).toBe(
      'GET, HEAD, OPTIONS',
    )
    expect(preflight.headers.get('Access-Control-Allow-Headers')).toBe(
      'content-type,x-poi-client',
    )
    expect(preflight.headers.get('Vary')).toBe('Access-Control-Request-Headers')

    const bare = preflightResponse(
      new Request('https://poi.moe/api/credits/manifest.json', {
        method: 'OPTIONS',
      }),
    )
    expect(bare.headers.get('Access-Control-Allow-Headers')).toBe('')
  })

  it('answers other methods with an Allow header', () => {
    const response = methodNotAllowedResponse()

    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe('GET, HEAD, OPTIONS')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})
