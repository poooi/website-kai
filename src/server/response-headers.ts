import { isPageRequest } from './request-routing'

const clientHintValues =
  'Sec-CH-UA-Platform, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile, Sec-CH-Prefers-Color-Scheme'
const clientHintPermissionsPolicy =
  'ch-ua-platform=(self), ch-ua-arch=(self), ch-ua-bitness=(self), ch-ua-mobile=(self), ch-prefers-color-scheme=(self)'
const buildDate = process.env.BUILD_DATE ?? 'development'
const commitHash = process.env.COMMIT_HASH ?? 'development'

const copyResponseWithHeaders = (response: Response, headers: Headers) => {
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
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

const appendDelimitedHeader = (
  headers: Headers,
  headerName: string,
  value: string,
) => {
  const values = new Set(
    (headers.get(headerName) ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  )
  value.split(',').forEach((entry) => {
    values.add(entry.trim())
  })
  headers.set(headerName, [...values].join(', '))
}

export const withGlobalHeaders = (response: Response, request: Request) => {
  const headers = new Headers(response.headers)
  headers.set('X-Poi-Codename', 'Shiratsuyu')
  headers.set('X-Poi-Revision', commitHash)
  headers.set('X-Poi-Build-Date', buildDate)
  headers.set('X-Poi-Greetings', 'poi?')

  if (isPageRequest(request)) {
    headers.set('Accept-CH', clientHintValues)
    headers.set('Critical-CH', clientHintValues)
    appendDelimitedHeader(
      headers,
      'Permissions-Policy',
      clientHintPermissionsPolicy,
    )
    appendVary(headers, clientHintValues)
    const contentType = headers.get('Content-Type')
    if (!contentType || contentType.includes('text/html')) {
      headers.set('Cache-Control', 'no-store')
    }
  }

  return copyResponseWithHeaders(response, headers)
}
