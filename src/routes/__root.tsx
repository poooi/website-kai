/* eslint-disable @next/next/no-css-tags */
/* eslint-disable @next/next/no-head-element */
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'

import '~/styles/globals.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'poi TanStack preview',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
        <link
          href="/fonts/plex-sans/IBMPlexSans-Regular.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
