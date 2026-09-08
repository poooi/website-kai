import { withSentry } from '@sentry/cloudflare'
import startHandler from '@tanstack/react-start/server-entry'

import { handleAsset, handleSocialImage, type AssetEnv } from '~/server/assets'
import {
  handleLocaleRedirects,
  isPageRequest,
  isProxyRootPath,
} from '~/server/request-routing'
import { withGlobalHeaders } from '~/server/response-headers'
import { sentryDsn, sentryRelease } from '~/lib/sentry'
import { paraglideMiddleware } from '~/paraglide/server'

const handleStartRequest = (request: Request) => {
  if (!isPageRequest(request)) {
    return startHandler.fetch(request)
  }

  // Locale redirects are handled above; prevent Paraglide from redirecting again.
  const headers = new Headers(request.headers)
  headers.delete('Sec-Fetch-Dest')
  // The router's rewrite handles delocalization, so forward the original request.
  return paraglideMiddleware(new Request(request, { headers }), () =>
    startHandler.fetch(request),
  )
}

export const handleWorkerRequest = async (request: Request, env: AssetEnv) => {
  const { pathname } = new URL(request.url)

  if (isProxyRootPath(pathname)) {
    return new Response('', { status: 404 })
  }

  const workerResponse =
    handleLocaleRedirects(request) ??
    (await handleSocialImage(request, env)) ??
    (await handleAsset(request, env))
  if (workerResponse) {
    return workerResponse
  }

  return handleStartRequest(request)
}

const worker = {
  async fetch(request: Request, env: AssetEnv) {
    const response = await handleWorkerRequest(request, env)
    return withGlobalHeaders(response, request)
  },
}

export default withSentry<AssetEnv>(
  () => ({
    dsn: sentryDsn,
    release: sentryRelease,
    tracesSampleRate: 0.01,
  }),
  worker,
)
