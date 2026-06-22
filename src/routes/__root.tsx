/* eslint-disable @next/next/no-css-tags */
/* eslint-disable @next/next/no-head-element */
import {
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'

import '~/styles/globals.css'
import { defaultLocale, isSupportedLocale } from '~/lib/i18n-routing'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'poi',
      },
      {
        name: 'description',
        content:
          'Scalable KanColle browser and tool, for Windows, macOS and Linux. 一个可扩展的舰队Collectionブラウザ。拡張可能な艦隊これくしょんブラウザ。',
      },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: '/fonts/plex-sans/IBMPlexSans-Regular.css' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const locale = useRouterState({
    select: (state) => {
      return (
        state.matches
          .flatMap((match) => Object.values(match.params))
          .find(
            (param): param is string =>
              typeof param === 'string' && isSupportedLocale(param),
          ) ?? defaultLocale
      )
    },
  })

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
