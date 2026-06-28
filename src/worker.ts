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

type StartHandlerWithContext = (
  request: Request,
  options: {
    context: {
      ctx: ExecutionContextLike
      env: WorkerEnv
      requestHeaders: [string, string][]
    }
  },
) => Promise<Response>

type SentryHandler = Parameters<typeof withSentry>[1]

const clientHintValues =
  'Sec-CH-UA-Platform, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile, Sec-CH-Prefers-Color-Scheme'

const buildDate = process.env.BUILD_DATE ?? 'development'
const commitHash = process.env.COMMIT_HASH ?? 'development'

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
  const normalized = pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
  return (
    normalized === '/dist' || normalized === '/fcd' || normalized === '/update'
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
  return (
    (request.method === 'GET' || request.method === 'HEAD') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/status') &&
    !isSocialImagePath(pathname) &&
    !isFileRequest(pathname)
  )
}

const isPagePath = (pathname: string) => {
  return (
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/status') &&
    !isProxyRootPath(pathname) &&
    !pathname.startsWith('/dist/') &&
    !pathname.startsWith('/fcd/') &&
    !pathname.startsWith('/update/') &&
    !isSocialImagePath(pathname) &&
    !isFileRequest(pathname)
  )
}

const redirectTo = (request: Request, pathname: string, status: 307 | 308) => {
  const url = new URL(request.url)
  url.pathname = pathname
  const headers = new Headers()
  if (status === 307) {
    headers.set('Cache-Control', 'no-store')
    headers.set('Vary', 'Cookie, Accept-Language')
  }
  headers.set('Content-Type', 'text/plain; charset=utf-8')
  return new Response('', {
    headers: {
      ...Object.fromEntries(headers),
      Location: url.toString(),
    },
    status,
  })
}

const handleLocaleRedirects = (request: Request) => {
  const { pathname } = new URL(request.url)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return undefined
  }

  if (!isPagePath(pathname)) {
    return undefined
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  const secondSegment = pathSegments[1]
  const knownUnprefixedPage =
    pathSegments.length === 1 &&
    (firstSegment === 'download' || firstSegment === 'explore')
  const knownDefaultPage = pathSegments.length === 0 || knownUnprefixedPage
  const localeShapedSegment =
    !!firstSegment && /^[a-z]{2}(?:-[A-Za-z]+)?$/.test(firstSegment)
  const supportedLocalizedPage =
    firstSegment &&
    isSupportedLocale(firstSegment) &&
    (pathSegments.length === 1 ||
      (pathSegments.length === 2 &&
        (secondSegment === 'download' || secondSegment === 'explore')))
  const knownLocalizedPage =
    firstSegment &&
    !knownUnprefixedPage &&
    !isSupportedLocale(firstSegment) &&
    (pathSegments.length === 1 ||
      (localeShapedSegment &&
        pathSegments.length === 2 &&
        (secondSegment === 'download' || secondSegment === 'explore')))
  if (knownLocalizedPage) {
    return new Response('', { status: 404 })
  }

  if (!knownDefaultPage && !supportedLocalizedPage) {
    return new Response('', { status: 404 })
  }

  const locale = getPathLocale(pathname)
  let canonicalPathname = pathname
  if (canonicalPathname !== '/' && canonicalPathname.endsWith('/')) {
    canonicalPathname = canonicalPathname.replace(/\/+$/, '')
  }
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

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

const withAssetHeaders = (response: Response, request: Request) => {
  const headers = new Headers(response.headers)
  const { pathname } = new URL(request.url)
  if (isHashedViteAsset(pathname)) {
    headers.set('Cache-Control', 'public,max-age=31536000,immutable')
  } else {
    headers.set('Cache-Control', 'public,max-age=3600')
  }
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
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

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContextLike) {
    const { pathname } = new URL(request.url)

    let response: Response | undefined
    if (isProxyRootPath(pathname)) {
      response = new Response('', { status: 404 })
    }

    response ??= handleLocaleRedirects(request)
    response ??= await handleAsset(request, env)

    const routedRequest = normalizeMonitoringRequest(request)
    if (!response) {
      if (isPageRequest(routedRequest)) {
        const middlewareHeaders = new Headers(routedRequest.headers)
        middlewareHeaders.delete('Sec-Fetch-Dest')
        const middlewareRequest = new Request(routedRequest, {
          headers: middlewareHeaders,
        })
        response = await paraglideMiddleware(middlewareRequest, () =>
          (startHandler.fetch as StartHandlerWithContext)(routedRequest, {
            context: { env, ctx, requestHeaders: [...request.headers] },
          }),
        )
      } else {
        response = await (startHandler.fetch as StartHandlerWithContext)(
          routedRequest,
          {
            context: { env, ctx, requestHeaders: [...request.headers] },
          },
        )
      }
    }

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
