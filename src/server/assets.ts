import { withSocialImageHeaders } from '~/lib/social-image-constants'
import {
  isFileRequest,
  isSocialImagePath,
  isDocumentRequestMethod,
} from './request-routing'

export interface AssetEnv {
  ASSETS?: { fetch(request: Request): Promise<Response> }
}

const withAssetHeaders = (response: Response, request: Request) => {
  const headers = new Headers(response.headers)
  const { pathname } = new URL(request.url)
  if (pathname.startsWith('/assets/')) {
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

export const handleAsset = async (request: Request, env: AssetEnv) => {
  if (!env.ASSETS || !isFileRequest(new URL(request.url).pathname)) {
    return undefined
  }

  const response = await env.ASSETS.fetch(request)
  if (response.status === 404) {
    return undefined
  }

  return withAssetHeaders(response, request)
}

const fetchAssetPath = (request: Request, env: AssetEnv, pathname: string) => {
  const url = new URL(pathname, request.url)
  return env.ASSETS!.fetch(new Request(url, { method: 'GET' }))
}

export const handleSocialImage = async (request: Request, env: AssetEnv) => {
  const { pathname } = new URL(request.url)
  if (
    !env.ASSETS ||
    !isSocialImagePath(pathname) ||
    !isDocumentRequestMethod(request.method)
  ) {
    return undefined
  }

  if (request.method === 'HEAD') {
    return new Response(null, {
      headers: withSocialImageHeaders(),
    })
  }

  const { createSocialImageResponse } = await import('~/lib/social-image')
  return createSocialImageResponse((assetPath) =>
    fetchAssetPath(request, env, assetPath),
  )
}
