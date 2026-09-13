import { withSentry } from '@sentry/cloudflare'
import startHandler from '@tanstack/react-start/server-entry'

import { handleAsset, handleSocialImage, type AssetEnv } from '~/server/assets'
import {
  handleLocaleRedirects,
  isPageRequest,
  isProxyRootPath,
} from '~/server/request-routing'
import { withGlobalHeaders } from '~/server/response-headers'
import {
  refreshPluginReleases,
  type PluginReleaseStore,
} from '~/lib/plugin-releases.server'
import { sentryDsn, sentryRelease } from '~/lib/sentry'
import { paraglideMiddleware } from '~/paraglide/server'

type WorkerEnv = AssetEnv & {
  PLUGIN_RELEASES?: PluginReleaseStore
}

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

export const handleWorkerRequest = async (request: Request, env: WorkerEnv) => {
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
  async fetch(request: Request, env: WorkerEnv) {
    const response = await handleWorkerRequest(request, env)
    return withGlobalHeaders(response, request)
  },
  async scheduled(_controller: ScheduledController, env: WorkerEnv) {
    await refreshPluginReleases(env.PLUGIN_RELEASES)
  },
}

export default withSentry<WorkerEnv>(
  () => ({
    dsn: sentryDsn,
    release: sentryRelease,
    tracesSampleRate: 0.01,
  }),
  worker,
)
