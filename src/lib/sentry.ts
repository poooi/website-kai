export const sentryDsn =
  'https://cada89d337c4fa8d92e1e1b2ddc1fdfc@o171991.ingest.us.sentry.io/4508112237101056'
export const sentryRelease =
  process.env.SENTRY_RELEASE ?? process.env.COMMIT_HASH ?? 'development'

const sentryDsnUrl = new URL(sentryDsn)
const sentryPublicKey = sentryDsnUrl.username
const sentryProjectId = sentryDsnUrl.pathname.replace(/^\//, '')
const sentryEnvelopeUrl = `https://${sentryDsnUrl.host}/api/${sentryProjectId}/envelope/?sentry_key=${sentryPublicKey}`

export interface SentryTunnelOptions {
  fetcher?: typeof fetch
}

const createNoStoreHeaders = (headers?: Record<string, string>) => {
  return {
    'Cache-Control': 'no-store',
    ...headers,
  }
}

const emptyResponse = (status: number, headers = createNoStoreHeaders()) =>
  new Response('', { headers, status })

const textDecoder = new TextDecoder()

const getEnvelopeHeaderLine = (body: ArrayBuffer) => {
  const bytes = new Uint8Array(body)
  let lineEnd = bytes.indexOf(0x0a)
  if (lineEnd === -1) {
    lineEnd = bytes.length
  }
  if (lineEnd > 0 && bytes[lineEnd - 1] === 0x0d) {
    lineEnd -= 1
  }
  if (lineEnd === 0) {
    return undefined
  }
  return textDecoder.decode(bytes.subarray(0, lineEnd))
}

const isValidEnvelope = (body: ArrayBuffer) => {
  const headerLine = getEnvelopeHeaderLine(body)
  if (!headerLine) {
    return false
  }

  let header: { dsn?: unknown }
  try {
    header = JSON.parse(headerLine) as { dsn?: unknown }
  } catch {
    return false
  }

  if (typeof header.dsn !== 'string') {
    return false
  }

  try {
    const envelopeDsn = new URL(header.dsn)
    return (
      envelopeDsn.protocol === sentryDsnUrl.protocol &&
      envelopeDsn.host === sentryDsnUrl.host &&
      envelopeDsn.username === sentryPublicKey &&
      envelopeDsn.pathname.replace(/^\//, '') === sentryProjectId
    )
  } catch {
    return false
  }
}

export const handleSentryTunnel = async (
  request: Request,
  { fetcher = fetch }: SentryTunnelOptions = {},
) => {
  if (request.method !== 'POST') {
    return emptyResponse(405, createNoStoreHeaders({ Allow: 'POST' }))
  }

  const body = await request.arrayBuffer()
  if (!isValidEnvelope(body)) {
    return emptyResponse(400)
  }

  const upstreamHeaders: Record<string, string> = {
    'Content-Type':
      request.headers.get('Content-Type') ?? 'application/x-sentry-envelope',
  }
  const contentEncoding = request.headers.get('Content-Encoding')
  if (contentEncoding) {
    upstreamHeaders['Content-Encoding'] = contentEncoding
  }

  let upstream: Response
  try {
    upstream = await fetcher(sentryEnvelopeUrl, {
      body,
      headers: upstreamHeaders,
      method: 'POST',
    })
  } catch {
    return emptyResponse(502)
  }

  return emptyResponse(upstream.ok ? 200 : 502)
}
