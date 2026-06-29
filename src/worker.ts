import { withSentry } from '@sentry/cloudflare'
import startHandler from '@tanstack/react-start/server-entry'

import {
  defaultLocale,
  getPathLocale,
  isDefaultLocale,
  isSupportedLocale,
  localizePath,
  resolvePreferredLocale,
  stripLocalePrefix,
} from '~/lib/i18n-routing'
import { sentryDsn, sentryRelease } from '~/lib/sentry'
import { paraglideMiddleware } from '~/paraglide/server'

interface AssetsBinding {
  fetch(request: Request): Promise<Response>
}

interface WorkerEnv {
  ASSETS?: AssetsBinding
  TANSTACK_TEST_POI_VERSIONS?: string
}

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException?(): void
}

interface StartHandlerContext {
  ctx: ExecutionContextLike
  env: WorkerEnv
  requestHeaders: [string, string][]
}

type StartHandlerWithContext = (
  request: Request,
  options: {
    context: StartHandlerContext
  },
) => Promise<Response>

type SentryHandler = Parameters<typeof withSentry>[1]

const clientHintValues =
  'Sec-CH-UA-Platform, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile, Sec-CH-Prefers-Color-Scheme'
const localizedPageNames = new Set(['download', 'explore'])
const proxyRoots = new Set(['/dist', '/fcd', '/update'])
const proxyPrefixes = ['/dist/', '/fcd/', '/update/']

const buildDate = process.env.BUILD_DATE ?? 'development'
const commitHash = process.env.COMMIT_HASH ?? 'development'

const trimTrailingSlashes = (pathname: string) => {
  return pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
}

const isFileRequest = (pathname: string) => {
  return pathname.includes('.')
}

const isHashedViteAsset = (pathname: string) => {
  return pathname.startsWith('/assets/')
}

const isSocialImagePath = (pathname: string) => {
  const normalized = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return normalized === '/opengraph-image' || normalized === '/twitter-image'
}

const isProxyRootPath = (pathname: string) => {
  return proxyRoots.has(trimTrailingSlashes(pathname))
}

const isProxyRoutePath = (pathname: string) => {
  return (
    isProxyRootPath(pathname) ||
    proxyPrefixes.some((prefix) => pathname.startsWith(prefix))
  )
}

const isDocumentRequestMethod = (method: string) => {
  return method === 'GET' || method === 'HEAD'
}

const isDocumentPath = (pathname: string) => {
  return (
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/status') &&
    !isSocialImagePath(pathname) &&
    !isFileRequest(pathname)
  )
}

const normalizeMonitoringRequest = (request: Request) => {
  const url = new URL(request.url)
  if (url.pathname !== '/api/monitoring/') {
    return request
  }
  url.pathname = '/api/monitoring'
  return new Request(url, request)
}

const isPageRequest = (request: Request) => {
  const { pathname } = new URL(request.url)
  return isDocumentRequestMethod(request.method) && isDocumentPath(pathname)
}

const shouldHandleLocaleRedirects = (request: Request, pathname: string) => {
  return (
    isDocumentRequestMethod(request.method) &&
    isDocumentPath(pathname) &&
    !isProxyRoutePath(pathname)
  )
}

const isKnownLocalizedPagePath = (pathname: string) => {
  const [firstSegment, secondSegment, ...restSegments] = pathname
    .split('/')
    .filter(Boolean)

  if (!firstSegment) {
    return true
  }

  if (restSegments.length > 0) {
    return false
  }

  if (!secondSegment) {
    return (
      localizedPageNames.has(firstSegment) || isSupportedLocale(firstSegment)
    )
  }

  return (
    localizedPageNames.has(secondSegment) && isSupportedLocale(firstSegment)
  )
}

const redirectTo = (request: Request, pathname: string, status: 307 | 308) => {
  const url = new URL(request.url)
  url.pathname = pathname
  const headers = new Headers({
    'Content-Type': 'text/plain; charset=utf-8',
    Location: url.toString(),
  })
  if (status === 307) {
    headers.set('Cache-Control', 'no-store')
    headers.set('Vary', 'Cookie, Accept-Language')
  }
  return new Response('', { headers, status })
}

const handleLocaleRedirects = (request: Request) => {
  const { pathname } = new URL(request.url)
  if (!shouldHandleLocaleRedirects(request, pathname)) {
    return undefined
  }

  if (!isKnownLocalizedPagePath(pathname)) {
    return new Response('', { status: 404 })
  }

  const locale = getPathLocale(pathname)
  let canonicalPathname = trimTrailingSlashes(pathname)
  if (locale && isDefaultLocale(locale)) {
    canonicalPathname = stripLocalePrefix(canonicalPathname)
  }

  if (canonicalPathname !== pathname) {
    return redirectTo(request, canonicalPathname, 308)
  }

  if (!locale) {
    const preferredLocale = resolvePreferredLocale(request.headers)
    if (preferredLocale !== defaultLocale) {
      return redirectTo(request, localizePath(pathname, preferredLocale), 307)
    }
  }

  return undefined
}

const copyResponseWithHeaders = (response: Response, headers: Headers) => {
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

const appendVary = (headers: Headers, value: string) => {
  const current = headers.get('Vary')
  if (!current) {
    headers.set('Vary', value)
    return
  }
  if (current.trim() === '*') {
    return
  }

  const values = new Set(
    current
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  )
  value.split(',').forEach((entry) => {
    values.add(entry.trim())
  })
  headers.set('Vary', [...values].join(', '))
}

const withGlobalHeaders = (response: Response, request: Request) => {
  const headers = new Headers(response.headers)
  headers.set('X-Poi-Codename', 'Shiratsuyu')
  headers.set('X-Poi-Revision', commitHash)
  headers.set('X-Poi-Build-Date', buildDate)
  headers.set('X-Poi-Greetings', 'poi?')

  if (isPageRequest(request)) {
    headers.set('Accept-CH', clientHintValues)
    headers.set('Critical-CH', clientHintValues)
    appendVary(headers, clientHintValues)
    const contentType = headers.get('Content-Type')
    if (!contentType || contentType.includes('text/html')) {
      headers.set('Cache-Control', 'no-store')
    }
  }

  return copyResponseWithHeaders(response, headers)
}

const withAssetHeaders = (response: Response, request: Request) => {
  const headers = new Headers(response.headers)
  const { pathname } = new URL(request.url)
  if (isHashedViteAsset(pathname)) {
    headers.set('Cache-Control', 'public,max-age=31536000,immutable')
  } else {
    headers.set('Cache-Control', 'public,max-age=3600')
  }
  return copyResponseWithHeaders(response, headers)
}

const handleAsset = async (request: Request, env: WorkerEnv) => {
  if (!env.ASSETS || !isFileRequest(new URL(request.url).pathname)) {
    return undefined
  }

  const response = await env.ASSETS.fetch(request)
  if (response.status === 404) {
    return undefined
  }

  return withAssetHeaders(response, request)
}

const fetchStartHandler = (request: Request, context: StartHandlerContext) => {
  return (startHandler.fetch as StartHandlerWithContext)(request, { context })
}

const withParaglide = (
  request: Request,
  fetchRoute: (request: Request) => Promise<Response>,
) => {
  const headers = new Headers(request.headers)
  headers.delete('Sec-Fetch-Dest')

  return paraglideMiddleware(new Request(request, { headers }), () =>
    fetchRoute(request),
  )
}

const handleStartRequest = (request: Request, context: StartHandlerContext) => {
  const fetchRoute = (handlerRequest: Request) =>
    fetchStartHandler(handlerRequest, context)

  if (isPageRequest(request)) {
    return withParaglide(request, fetchRoute)
  }

  return fetchRoute(request)
}

export const handleWorkerRequest = async (
  request: Request,
  env: WorkerEnv,
  ctx: ExecutionContextLike,
) => {
  const { pathname } = new URL(request.url)

  if (isProxyRootPath(pathname)) {
    return new Response('', { status: 404 })
  }

  const workerResponse =
    handleLocaleRedirects(request) ?? (await handleAsset(request, env))
  if (workerResponse) {
    return workerResponse
  }

  return handleStartRequest(normalizeMonitoringRequest(request), {
    env,
    ctx,
    requestHeaders: [...request.headers],
  })
}

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContextLike) {
    const response = await handleWorkerRequest(request, env, ctx)
    return withGlobalHeaders(response, request)
  },
}

export default withSentry(
  () => ({
    dsn: sentryDsn,
    release: sentryRelease,
    tracesSampleRate: 0.01,
  }),
  worker as unknown as SentryHandler,
)
