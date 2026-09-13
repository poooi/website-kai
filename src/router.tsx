import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { deLocalizeUrl, localizeUrl } from '~/paraglide/runtime'

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadDelay: 120,
    defaultPreloadStaleTime: 5 * 60_000,
    defaultPreloadGcTime: 10 * 60_000,
    scrollRestoration: true,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
