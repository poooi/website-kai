import {
  fetchWithTimeout,
  type FetchLike,
  InvalidUpstreamResponseError,
  UpstreamNetworkError,
  UpstreamResponseError,
  UpstreamTimeoutError,
} from '~/lib/fetch-poi-versions'

export interface HandlerContext {
  fetcher?: FetchLike
  timeoutMs?: number
}

export const notFound = () => new Response('', { status: 404 })

const badGateway = () => new Response('', { status: 502 })

const gatewayTimeout = () => new Response('', { status: 504 })

export const isSingleSegmentFilename = (
  filename: string | undefined,
): filename is string => {
  return !!filename && !filename.includes('/') && !filename.includes('\\')
}

export const mapUpstreamError = (error: unknown): Response => {
  if (error instanceof UpstreamResponseError) {
    return error.status === 404 ? notFound() : badGateway()
  }

  if (
    error instanceof UpstreamTimeoutError ||
    error instanceof UpstreamNetworkError
  ) {
    return gatewayTimeout()
  }

  if (error instanceof InvalidUpstreamResponseError) {
    return badGateway()
  }

  throw error
}

export const reverseFetch = async (
  request: Request,
  url: string,
  { fetcher = fetch, timeoutMs }: HandlerContext = {},
): Promise<Response> => {
  let resp: Response
  try {
    resp = await fetchWithTimeout(
      fetcher,
      url,
      { signal: request.signal },
      timeoutMs,
    )
  } catch (error) {
    if (!(error instanceof UpstreamTimeoutError)) {
      return mapUpstreamError(new UpstreamNetworkError(error))
    }
    return mapUpstreamError(error)
  }

  if (!resp.ok) {
    return mapUpstreamError(new UpstreamResponseError(resp.status))
  }

  const fulfilled = new Response(resp.body, resp)
  fulfilled.headers.set('X-Poi-Real-Url', url)
  if (url.endsWith('.json')) {
    fulfilled.headers.set('Content-Type', 'application/json')
  }
  return fulfilled
}
