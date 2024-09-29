import { languageTag } from '~/paraglide/runtime.js'
import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { Background } from '~/components/background'
import { ThemeProvider } from '~/components/theme-provider'

export const metadata: Metadata = {
  title: 'Create T3 App',
  description: 'Generated by create-t3-app',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={languageTag()}
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Background />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
