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

const isValidEnvelope = (body: string) => {
  const [headerLine] = body.split(/\r?\n/, 1)
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

  const body = await request.text()
  if (!isValidEnvelope(body)) {
    return emptyResponse(400)
  }

  const upstream = await fetcher(sentryEnvelopeUrl, {
    body,
    headers: {
      'Content-Type':
        request.headers.get('Content-Type') ?? 'application/x-sentry-envelope',
    },
    method: 'POST',
  })

  return emptyResponse(upstream.ok ? 200 : 502)
}
