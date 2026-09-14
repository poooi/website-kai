import { withSentry } from '@sentry/cloudflare'
import startHandler from '@tanstack/react-start/server-entry'

import { handleAsset, type AssetEnv } from '~/server/assets'
import { handleLocaleRedirects, isPageRequest } from '~/server/request-routing'
import { withGlobalHeaders } from '~/server/response-headers'
import { refreshPluginReleases } from '~/lib/plugin-releases.server'
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
  const workerResponse =
    handleLocaleRedirects(request) ?? (await handleAsset(request, env))
  if (workerResponse) {
    return workerResponse
  }

  return handleStartRequest(request)
}

const worker: ExportedHandler<CloudflareEnv> = {
  async fetch(request, env) {
    const response = await handleWorkerRequest(request, env)
    return withGlobalHeaders(response, request)
  },
  async scheduled(_controller, env) {
    await refreshPluginReleases(env.PLUGIN_RELEASES)
  },
}

export default withSentry<CloudflareEnv>(
  () => ({
    dsn: sentryDsn,
    release: sentryRelease,
    tracesSampleRate: 0.01,
  }),
  worker,
)
