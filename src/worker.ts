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

interface WorkerEnv extends AssetEnv {
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

const normalizeMonitoringRequest = (request: Request) => {
  const url = new URL(request.url)
  if (url.pathname !== '/api/monitoring/') {
    return request
  }
  url.pathname = '/api/monitoring'
  return new Request(url, request)
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
    handleLocaleRedirects(request) ??
    (await handleSocialImage(request, env)) ??
    (await handleAsset(request, env))
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
