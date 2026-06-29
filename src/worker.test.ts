import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  paraglideMiddleware:
    vi.fn<
      (
        request: Request,
        resolve: () => Promise<Response>,
      ) => Response | Promise<Response>
    >(),
  startFetch:
    vi.fn<
      (
        request: Request,
        options: { context: { requestHeaders: [string, string][] } },
      ) => Promise<Response>
    >(),
  createSocialImageResponse:
    vi.fn<
      (fetchAsset: (pathname: string) => Promise<Response>) => Promise<Response>
    >(),
  withSentry: vi.fn<(_options: unknown, handler: unknown) => unknown>(
    (_options, handler) => handler,
  ),
}))

vi.mock('@sentry/cloudflare', () => ({
  withSentry: mocks.withSentry,
}))

vi.mock('@tanstack/react-start/server-entry', () => ({
  default: {
    fetch: mocks.startFetch,
  },
}))

vi.mock('~/paraglide/server', () => ({
  paraglideMiddleware: mocks.paraglideMiddleware,
}))

vi.mock('~/lib/social-image', () => ({
  createSocialImageResponse: mocks.createSocialImageResponse,
  withSocialImageHeaders: (headers = new Headers()) => {
    const socialImageHeaders = new Headers(headers)
    socialImageHeaders.set('Cache-Control', 'public,max-age=3600')
    socialImageHeaders.set('Content-Type', 'image/png')
    return socialImageHeaders
  },
}))

import { handleWorkerRequest } from './worker'

type WorkerEnvForTest = Parameters<typeof handleWorkerRequest>[1]
type AssetsFetchForTest = NonNullable<WorkerEnvForTest['ASSETS']>['fetch']

const makeRequest = (path: string, init?: RequestInit) =>
  new Request(`https://poi.moe${path}`, init)

const makeCtx = () => ({
  waitUntil: vi.fn(),
})

const makeEnv = (fetch?: AssetsFetchForTest): WorkerEnvForTest => ({
  ASSETS: fetch
    ? {
        fetch,
      }
    : undefined,
})

beforeEach(() => {
  mocks.paraglideMiddleware.mockReset()
  mocks.paraglideMiddleware.mockImplementation((_request, resolve) => resolve())
  mocks.startFetch.mockReset()
  mocks.startFetch.mockImplementation(async (request) => {
    return new Response(`start:${new URL(request.url).pathname}`, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  })
  mocks.createSocialImageResponse.mockReset()
  mocks.createSocialImageResponse.mockImplementation(async (fetchAsset) => {
    await Promise.all(
      ['/social/IBMPlexSans-SemiBold.woff', '/social/poi.png'].map(fetchAsset),
    )
    return new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), {
      headers: {
        'Cache-Control': 'public,max-age=3600',
        'Content-Type': 'image/png',
      },
    })
  })
})

describe('handleWorkerRequest', () => {
  it.each(['/dist', '/dist/', '/fcd', '/fcd/', '/update', '/update/'])(
    'short-circuits reserved proxy root %s before locale routing',
    async (path) => {
      const response = await handleWorkerRequest(
        makeRequest(path, {
          headers: {
            Cookie: 'NEXT_LOCALE=en',
          },
        }),
        makeEnv(),
        makeCtx(),
      )

      expect(response.status).toBe(404)
      expect(mocks.startFetch).not.toHaveBeenCalled()
      expect(mocks.paraglideMiddleware).not.toHaveBeenCalled()
    },
  )

  it('canonicalizes localized page paths before TanStack routing', async () => {
    const response = await handleWorkerRequest(
      makeRequest('/ja/download/'),
      makeEnv(),
      makeCtx(),
    )

    expect(response.status).toBe(308)
    expect(response.headers.get('Location')).toBe('https://poi.moe/download')
    expect(mocks.startFetch).not.toHaveBeenCalled()
  })

  it('redirects unprefixed pages to the preferred non-default locale', async () => {
    const response = await handleWorkerRequest(
      makeRequest('/download?from=unit', {
        headers: {
          'Accept-Language': 'fr',
        },
      }),
      makeEnv(),
      makeCtx(),
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('Location')).toBe(
      'https://poi.moe/fr/download?from=unit',
    )
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Vary')).toBe('Cookie, Accept-Language')
    expect(mocks.startFetch).not.toHaveBeenCalled()
  })

  it.each(['/missing', '/en/missing', '/xx/download', '/fr/download/extra'])(
    'returns 404 for unknown localized page path %s',
    async (path) => {
      const response = await handleWorkerRequest(
        makeRequest(path),
        makeEnv(),
        makeCtx(),
      )

      expect(response.status).toBe(404)
      expect(mocks.startFetch).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['/robots.txt', 'public,max-age=3600'],
    ['/assets/app.abc123.js', 'public,max-age=31536000,immutable'],
  ])(
    'serves asset %s before TanStack with cache headers',
    async (path, cache) => {
      const assetFetch = vi.fn(async () => new Response('asset'))
      const response = await handleWorkerRequest(
        makeRequest(path),
        makeEnv(assetFetch),
        makeCtx(),
      )

      expect(response.status).toBe(200)
      await expect(response.text()).resolves.toBe('asset')
      expect(response.headers.get('Cache-Control')).toBe(cache)
      expect(assetFetch).toHaveBeenCalledOnce()
      expect(mocks.startFetch).not.toHaveBeenCalled()
    },
  )

  it('falls back to TanStack when an asset binding misses', async () => {
    const response = await handleWorkerRequest(
      makeRequest('/favicon.ico'),
      makeEnv(async () => new Response('', { status: 404 })),
      makeCtx(),
    )

    expect(response.status).toBe(200)
    await expect(response.text()).resolves.toBe('start:/favicon.ico')
    expect(mocks.startFetch).toHaveBeenCalledOnce()
  })

  it('serves social image HEAD requests before TanStack', async () => {
    const response = await handleWorkerRequest(
      makeRequest('/opengraph-image', { method: 'HEAD' }),
      makeEnv(vi.fn()),
      makeCtx(),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public,max-age=3600')
    expect(response.headers.get('Content-Type')).toBe('image/png')
    await expect(response.arrayBuffer()).resolves.toHaveProperty(
      'byteLength',
      0,
    )
    expect(mocks.startFetch).not.toHaveBeenCalled()
  })

  it.each(['/opengraph-image', '/opengraph-image/', '/twitter-image'])(
    'generates social image route %s before TanStack',
    async (path) => {
      const assetFetch = vi.fn(async (request: Request) => {
        const { pathname } = new URL(request.url)
        if (pathname === '/social/poi.png') {
          return new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), {
            headers: {
              'Content-Type': 'image/png',
            },
          })
        }
        return new Response(new ArrayBuffer(8))
      })
      const response = await handleWorkerRequest(
        makeRequest(path),
        makeEnv(assetFetch),
        makeCtx(),
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toBe('public,max-age=3600')
      expect(response.headers.get('Content-Type')).toBe('image/png')
      expect(assetFetch).toHaveBeenCalledTimes(2)
      expect(mocks.createSocialImageResponse).toHaveBeenCalledOnce()
      expect(mocks.startFetch).not.toHaveBeenCalled()
    },
  )

  it('normalizes monitoring slash routes before calling TanStack', async () => {
    await handleWorkerRequest(
      makeRequest('/api/monitoring/', {
        headers: {
          'X-Unit-Test': 'monitoring',
        },
      }),
      makeEnv(),
      makeCtx(),
    )

    expect(mocks.startFetch).toHaveBeenCalledOnce()
    const [request, options] = mocks.startFetch.mock.calls[0]!
    expect(new URL(request.url).pathname).toBe('/api/monitoring')
    expect(options.context.requestHeaders).toContainEqual([
      'x-unit-test',
      'monitoring',
    ])
    expect(mocks.paraglideMiddleware).not.toHaveBeenCalled()
  })

  it('wraps page requests with Paraglide without forwarding Sec-Fetch-Dest', async () => {
    let middlewareRequest: Request | undefined
    mocks.paraglideMiddleware.mockImplementation(async (request, resolve) => {
      middlewareRequest = request
      return await resolve()
    })

    await handleWorkerRequest(
      makeRequest('/en', {
        headers: {
          'Sec-Fetch-Dest': 'document',
        },
      }),
      makeEnv(),
      makeCtx(),
    )

    expect(middlewareRequest?.headers.get('Sec-Fetch-Dest')).toBeNull()
    expect(mocks.startFetch).toHaveBeenCalledOnce()
    expect(
      mocks.startFetch.mock.calls[0]![0].headers.get('Sec-Fetch-Dest'),
    ).toBe('document')
  })

  it('does not wrap proxy subroutes with Paraglide', async () => {
    const response = await handleWorkerRequest(
      makeRequest('/dist/en', {
        headers: {
          Cookie: 'NEXT_LOCALE=fr',
          'Sec-Fetch-Dest': 'document',
        },
      }),
      makeEnv(),
      makeCtx(),
    )

    expect(response.status).toBe(200)
    await expect(response.text()).resolves.toBe('start:/dist/en')
    expect(mocks.startFetch).toHaveBeenCalledOnce()
    expect(mocks.paraglideMiddleware).not.toHaveBeenCalled()
  })
})
