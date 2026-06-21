import startHandler from '@tanstack/react-start/server-entry'

interface AssetsBinding {
  fetch(request: Request): Promise<Response>
}

interface WorkerEnv {
  ASSETS?: AssetsBinding
}

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException?(): void
}

type StartHandlerWithContext = (
  request: Request,
  options: {
    context: {
      ctx: ExecutionContextLike
      env: WorkerEnv
    }
  },
) => Promise<Response>

const clientHintValues =
  'Sec-CH-UA-Platform, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile'

const buildDate = process.env.BUILD_DATE ?? 'development'
const commitHash = process.env.COMMIT_HASH ?? 'development'

const isFileRequest = (pathname: string) => {
  return pathname.includes('.')
}

const isHashedViteAsset = (pathname: string) => {
  return pathname.startsWith('/assets/')
}

const isSocialImagePath = (pathname: string) => {
  const normalized = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return normalized === '/opengraph-image' || normalized === '/twitter-image'
}

const isPageRequest = (request: Request) => {
  const { pathname } = new URL(request.url)
  return (
    (request.method === 'GET' || request.method === 'HEAD') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/status') &&
    !isSocialImagePath(pathname) &&
    !isFileRequest(pathname)
  )
}

const appendVary = (headers: Headers, value: string) => {
  const current = headers.get('Vary')
  if (!current) {
    headers.set('Vary', value)
    return
  }
  if (current.trim() === '*') {
    return
  }

  const values = new Set(
    current
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  )
  value.split(',').forEach((entry) => {
    values.add(entry.trim())
  })
  headers.set('Vary', [...values].join(', '))
}

const withGlobalHeaders = (response: Response, request: Request) => {
  const headers = new Headers(response.headers)
  headers.set('X-Poi-Codename', 'Shiratsuyu')
  headers.set('X-Poi-Revision', commitHash)
  headers.set('X-Poi-Build-Date', buildDate)
  headers.set('X-Poi-Greetings', 'poi?')

  if (isPageRequest(request)) {
    headers.set('Accept-CH', clientHintValues)
    headers.set('Critical-CH', clientHintValues)
    appendVary(headers, clientHintValues)
    const contentType = headers.get('Content-Type')
    if (!contentType || contentType.includes('text/html')) {
      headers.set('Cache-Control', 'no-store')
    }
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

const withAssetHeaders = (response: Response, request: Request) => {
  const headers = new Headers(response.headers)
  const { pathname } = new URL(request.url)
  if (isHashedViteAsset(pathname)) {
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

const handleMonitoringStub = (request: Request) => {
  if (request.method === 'POST') {
    return new Response('', { status: 501 })
  }
  return new Response('', {
    status: 405,
    headers: {
      Allow: 'POST',
    },
  })
}

const handleAsset = async (request: Request, env: WorkerEnv) => {
  if (!env.ASSETS || !isFileRequest(new URL(request.url).pathname)) {
    return undefined
  }

  const response = await env.ASSETS.fetch(request)
  if (response.status === 404) {
    return undefined
  }

  return withAssetHeaders(response, request)
}

const isMonitoringPath = (pathname: string) => {
  return pathname === '/api/monitoring' || pathname === '/api/monitoring/'
}

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContextLike) {
    const { pathname } = new URL(request.url)

    let response: Response | undefined
    if (isMonitoringPath(pathname)) {
      response = handleMonitoringStub(request)
    }

    response ??= await handleAsset(request, env)
    response ??= await (startHandler.fetch as StartHandlerWithContext)(
      request,
      {
        context: { env, ctx },
      },
    )

    return withGlobalHeaders(response, request)
  },
}

export default worker
