import { NextResponse, type NextRequest } from 'next/server'
import { i18nRouter } from 'next-i18n-router'

import { i18nConfig } from './i18n-config'

const shouldLocalize = (pathname: string): boolean => {
  // Skip if it's a file (contains extension)
  if (pathname.includes('.')) {
    return false
  }

  // Skip excluded paths
  const excludedPaths = [
    '/api/',
    '/static/',
    '/monitoring/',
    '/_next/',
    '/status',
  ]
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return false
  }

  return true
}

// FIXME: CF Pages does not always honor next.config.js headers config
// Check if this is required when miragted to worker
const clientHintHeaders = [
  {
    key: 'Accept-CH',
    value: 'Sec-CH-UA-Platform, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile',
  },
  {
    key: 'Critical-CH',
    value: 'Sec-CH-UA-Platform, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile',
  },
  {
    key: 'Vary',
    value: 'Sec-CH-UA-Platform, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile',
  },
]

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

const clientHintValues =
  'Sec-CH-UA-Platform, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile'

export function middleware(request: NextRequest) {
  const localize = shouldLocalize(request.nextUrl.pathname)
  let resp: NextResponse
  if (localize) {
    resp = i18nRouter(request, i18nConfig)
  } else {
    resp = NextResponse.next()
  }

  poiHeaders.forEach((header) => {
    resp.headers.set(header.key, header.value)
  })

  if (localize) {
    resp.headers.set('Accept-CH', clientHintValues)
    resp.headers.set('Critical-CH', clientHintValues)
    resp.headers.set('Vary', clientHintValues)
  }

  return resp
}
