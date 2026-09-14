import { isFileRequest, isProxyRoutePath } from './request-routing'

export interface AssetEnv {
  ASSETS?: { fetch(request: Request): Promise<Response> }
}

const withAssetHeaders = (response: Response, request: Request) => {
  const headers = new Headers(response.headers)
  const { pathname } = new URL(request.url)
  if (pathname.startsWith('/assets/')) {
    headers.set('Cache-Control', 'public,max-age=31536000,immutable')
  } else if (pathname.startsWith('/fonts/')) {
    headers.set('Cache-Control', 'public,max-age=604800')
  } else {
    headers.set('Cache-Control', 'public,max-age=3600')
  }
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

export const handleAsset = async (request: Request, env: AssetEnv) => {
  const { pathname } = new URL(request.url)
  // API and proxy routes own every method, so the asset binding must not
  // answer them.
  if (
    !env.ASSETS ||
    pathname.startsWith('/api/') ||
    isProxyRoutePath(pathname) ||
    !isFileRequest(pathname)
  ) {
    return undefined
  }

  const response = await env.ASSETS.fetch(request)
  if (response.status === 404) {
    return undefined
  }

  return withAssetHeaders(response, request)
}
