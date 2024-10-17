import { NextResponse, type NextRequest } from 'next/server'
import { i18nRouter } from 'next-i18n-router'

import { i18nConfig } from './i18n-config'

const matcher = new RegExp('/((?!api|static|.*\\..*|_next).*)')

// FIXME: CF Pages does not always honor next.config.js headers config
// Check if this is required when miragted to worker
const poiHeaders = [
  {
    key: 'X-Poi-Codename',
    value: 'Shiratsuyu',
  },
  {
    key: 'X-Poi-Revision',
    value: process.env.COMMIT_HASH!,
  },
  {
    key: 'X-Poi-Build-Date',
    value: process.env.BUILD_DATE!,
  },
  {
    key: 'X-Poi-Greetings',
    value: 'poi?',
  },
]

export function middleware(request: NextRequest) {
  let resp: NextResponse
  if (matcher.test(request.nextUrl.pathname)) {
    resp = i18nRouter(request, i18nConfig)
  } else {
    resp = NextResponse.next()
  }

  poiHeaders.forEach((header) => {
    resp.headers.set(header.key, header.value)
  })
  return resp
}
