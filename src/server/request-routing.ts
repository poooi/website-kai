import {
  defaultLocale,
  getPathLocale,
  isDefaultLocale,
  isSupportedLocale,
  localizePath,
  resolvePreferredLocale,
  stripLocalePrefix,
} from '~/lib/i18n-routing'

const localizedPageNames = new Set(['download', 'explore', 'changelog'])
const proxyRoots = new Set(['/dist', '/fcd', '/update'])
const proxyPrefixes = ['/dist/', '/fcd/', '/update/']

const trimTrailingSlashes = (pathname: string) => {
  return pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
}

export const isFileRequest = (pathname: string) => {
  return pathname.includes('.')
}

export const isSocialImagePath = (pathname: string) => {
  const normalized = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return normalized === '/opengraph-image' || normalized === '/twitter-image'
}

export const isProxyRootPath = (pathname: string) => {
  return proxyRoots.has(trimTrailingSlashes(pathname))
}

const isProxyRoutePath = (pathname: string) => {
  return (
    isProxyRootPath(pathname) ||
    proxyPrefixes.some((prefix) => pathname.startsWith(prefix))
  )
}

export const isDocumentRequestMethod = (method: string) => {
  return method === 'GET' || method === 'HEAD'
}

const isDocumentPath = (pathname: string) => {
  return (
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_serverFn/') &&
    !pathname.startsWith('/status') &&
    !isSocialImagePath(pathname) &&
    !isFileRequest(pathname)
  )
}

export const isPageRequest = (request: Request) => {
  const { pathname } = new URL(request.url)
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

export const handleLocaleRedirects = (request: Request) => {
  const { pathname } = new URL(request.url)
  if (!isPageRequest(request)) {
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
