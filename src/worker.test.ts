import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  paraglideMiddleware:
    vi.fn<
      (
        request: Request,
        resolve: () => Promise<Response>,
      ) => Response | Promise<Response>
    >(),
  startFetch: vi.fn<(request: Request) => Promise<Response>>(),
  withSentry: vi.fn<(_options: unknown, handler: unknown) => unknown>(
    (_options, handler) => handler,
  ),
  refreshPluginReleases: vi.fn<(store: unknown) => Promise<unknown>>(),
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

vi.mock('~/lib/plugin-releases.server', () => ({
  refreshPluginReleases: mocks.refreshPluginReleases,
}))

import worker, { handleWorkerRequest } from './worker'

type AssetEnvForTest = Parameters<typeof handleWorkerRequest>[1]
type AssetsFetchForTest = NonNullable<AssetEnvForTest['ASSETS']>['fetch']

const makeRequest = (path: string, init?: RequestInit) =>
  new Request(`https://poi.moe${path}`, init)

const makeEnv = (fetch?: AssetsFetchForTest): AssetEnvForTest => ({
  ASSETS: fetch
    ? {
        fetch,
      }
    : undefined,
})

const unexpected = (what: string) => (): never => {
  throw new Error(`unexpected ${what} call`)
}

/** Throwing KV double; production bindings still come from the generated type. */
const makeKv = (): KVNamespace => ({
  get: unexpected('KV get'),
  getWithMetadata: unexpected('KV getWithMetadata'),
  list: unexpected('KV list'),
  put: unexpected('KV put'),
  delete: unexpected('KV delete'),
})

const unusedAssets: Fetcher = {
  fetch: unexpected('ASSETS.fetch'),
  connect: unexpected('ASSETS.connect'),
}

const makeScheduledEnv = (pluginReleases: KVNamespace): CloudflareEnv => ({
  ASSETS: unusedAssets,
  PLUGIN_RELEASES: pluginReleases,
})

const scheduledController: ScheduledController = {
  scheduledTime: 0,
  cron: '0 * * * *',
  noRetry: () => undefined,
}

const executionContext: ExecutionContext = {
  waitUntil: () => undefined,
  passThroughOnException: () => undefined,
  props: undefined,
  abort: () => undefined,
  get exports(): Cloudflare.Exports {
    throw new Error('unexpected ctx.exports access')
  },
  get tracing(): Tracing {
    throw new Error('unexpected ctx.tracing access')
  },
}

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
  mocks.refreshPluginReleases.mockReset()
  mocks.refreshPluginReleases.mockResolvedValue({})
})

describe('handleWorkerRequest', () => {
  it('passes server-function calls through without treating them as localized pages', async () => {
    const response = await handleWorkerRequest(
      makeRequest('/_serverFn/changelog?payload=test', {
        headers: { 'Accept-Language': 'fr' },
      }),
      makeEnv(),
    )
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('start:/_serverFn/changelog')
    expect(mocks.startFetch).toHaveBeenCalledOnce()
    expect(mocks.paraglideMiddleware).not.toHaveBeenCalled()
  })
  it.each(['/dist', '/dist/', '/fcd', '/fcd/', '/update', '/update/'])(
    'passes reserved proxy root %s to TanStack without locale redirects',
    async (path) => {
      const response = await handleWorkerRequest(
        makeRequest(path, {
          headers: {
            Cookie: 'NEXT_LOCALE=en',
          },
        }),
        makeEnv(),
      )

      expect(response.status).toBe(200)
      await expect(response.text()).resolves.toBe(`start:${path}`)
      expect(mocks.startFetch).toHaveBeenCalledOnce()
      expect(mocks.paraglideMiddleware).not.toHaveBeenCalled()
    },
  )

  it('canonicalizes localized page paths before TanStack routing', async () => {
    const response = await handleWorkerRequest(
      makeRequest('/ja/download/'),
      makeEnv(),
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
      const response = await handleWorkerRequest(makeRequest(path), makeEnv())

      expect(response.status).toBe(404)
      expect(mocks.startFetch).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['/robots.txt', 'public,max-age=3600'],
    ['/fonts/plex-sans/IBMPlexSans-Regular.css', 'public,max-age=604800'],
    ['/assets/app.abc123.js', 'public,max-age=31536000,immutable'],
  ])(
    'serves asset %s before TanStack with cache headers',
    async (path, cache) => {
      const assetFetch = vi.fn(async () => new Response('asset'))
      const response = await handleWorkerRequest(
        makeRequest(path),
        makeEnv(assetFetch),
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
    )

    expect(response.status).toBe(200)
    await expect(response.text()).resolves.toBe('start:/favicon.ico')
    expect(mocks.startFetch).toHaveBeenCalledOnce()
  })

  it.each([
    ['/api/credits/manifest.json', 'OPTIONS'],
    ['/api/credits/avatars-0.0123456789abcdef.png', 'POST'],
    ['/api/credits-sprite/avatars-0.0123456789abcdef.png', 'OPTIONS'],
  ] as const)(
    'keeps %s %s away from the asset binding',
    async (path, method) => {
      const assetFetch = vi.fn(async () => new Response('', { status: 405 }))
      const response = await handleWorkerRequest(
        makeRequest(path, { method }),
        makeEnv(assetFetch),
      )

      expect(assetFetch).not.toHaveBeenCalled()
      expect(mocks.startFetch).toHaveBeenCalledOnce()
      await expect(response.text()).resolves.toBe(`start:${path}`)
    },
  )

  it('passes social image routes to TanStack', async () => {
    const response = await handleWorkerRequest(
      makeRequest('/opengraph-image?from=unit#social'),
      makeEnv(vi.fn()),
    )

    await expect(response.text()).resolves.toBe('start:/opengraph-image')
    expect(mocks.startFetch).toHaveBeenCalledOnce()
  })

  it('keeps proxy filename routes away from the asset binding', async () => {
    const assetFetch = vi.fn(async () => new Response('asset'))
    const response = await handleWorkerRequest(
      makeRequest('/dist/file.exe'),
      makeEnv(assetFetch),
    )

    expect(assetFetch).not.toHaveBeenCalled()
    expect(mocks.startFetch).toHaveBeenCalledOnce()
    await expect(response.text()).resolves.toBe('start:/dist/file.exe')
  })

  it('passes monitoring requests and their headers to TanStack', async () => {
    await handleWorkerRequest(
      makeRequest('/api/monitoring/', {
        headers: {
          'X-Unit-Test': 'monitoring',
        },
      }),
      makeEnv(),
    )

    expect(mocks.startFetch).toHaveBeenCalledOnce()
    const [request] = mocks.startFetch.mock.calls[0]!
    expect(new URL(request.url).pathname).toBe('/api/monitoring/')
    expect(request.headers.get('X-Unit-Test')).toBe('monitoring')
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
    )

    expect(response.status).toBe(200)
    await expect(response.text()).resolves.toBe('start:/dist/en')
    expect(mocks.startFetch).toHaveBeenCalledOnce()
    expect(mocks.paraglideMiddleware).not.toHaveBeenCalled()
  })
})

describe('scheduled', () => {
  const runScheduled = (env: CloudflareEnv) => {
    const scheduled = worker.scheduled
    expect(scheduled).toBeDefined()
    if (!scheduled) throw new Error('missing scheduled handler')
    return scheduled(scheduledController, env, executionContext)
  }

  it('refreshes plugin releases from the KV binding', async () => {
    const pluginReleases = makeKv()
    await runScheduled(makeScheduledEnv(pluginReleases))
    expect(mocks.refreshPluginReleases).toHaveBeenCalledOnce()
    expect(mocks.refreshPluginReleases).toHaveBeenCalledWith(pluginReleases)
  })

  it('propagates refresh failures through the exported wrapped handler', async () => {
    mocks.refreshPluginReleases.mockRejectedValue(new Error('refresh failed'))
    await expect(runScheduled(makeScheduledEnv(makeKv()))).rejects.toThrow(
      'refresh failed',
    )
  })
})
