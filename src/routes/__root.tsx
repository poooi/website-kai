/* eslint-disable @next/next/no-css-tags */
/* eslint-disable @next/next/no-head-element */
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { createServerOnlyFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import type { Resource } from 'i18next'

import '~/styles/globals.css'
import { DesktopBackground } from '~/components/desktop-background'
import { FooterClient } from '~/components/footer-client'
import { Header } from '~/components/header'
import { I18nProvider } from '~/components/i18n-provider'
import { JotaiRootProvider } from '~/components/jotai-provider'
import { ThemeProvider } from '~/components/theme-provider'
import { defaultLocale, isSupportedLocale } from '~/lib/i18n-routing'
import { isMobileDevice } from '~/lib/target'
import { getServerThemePreference, resolveServerTheme } from '~/lib/theme'
import { cn } from '~/lib/utils'
import enCommon from '~/locales/en/common.json'
import frCommon from '~/locales/fr/common.json'
import jaCommon from '~/locales/ja/common.json'
import koCommon from '~/locales/ko/common.json'
import zhHansCommon from '~/locales/zh-Hans/common.json'
import zhHantCommon from '~/locales/zh-Hant/common.json'

const resources = {
  en: { common: enCommon },
  fr: { common: frCommon },
  ja: { common: jaCommon },
  ko: { common: koCommon },
  'zh-Hans': { common: zhHansCommon },
  'zh-Hant': { common: zhHantCommon },
} satisfies Resource

const getCurrentRequestHeaders = createServerOnlyFn(
  () => new Headers(getRequestHeaders()),
)

const getCurrentRequestHeadersForRoot = (context: TanStackRouterContext) => {
  const requestHeaders =
    context.serverContext?.requestHeaders ?? context.requestHeaders
  if (requestHeaders) {
    return new Headers(requestHeaders)
  }
  return typeof document === 'undefined'
    ? getCurrentRequestHeaders()
    : new Headers()
}

export interface TanStackRouterContext {
  env?: {
    TANSTACK_TEST_POI_VERSIONS?: string
  }
  requestHeaders?: [string, string][]
  serverContext?: {
    env?: {
      TANSTACK_TEST_POI_VERSIONS?: string
    }
    requestHeaders?: [string, string][]
  }
}

export const Route = createRootRouteWithContext<TanStackRouterContext>()({
  loader: async ({ context }) => {
    const headers = getCurrentRequestHeadersForRoot(context)
    return {
      isMobile: await isMobileDevice(headers),
      theme: resolveServerTheme(headers),
      themePreference: getServerThemePreference(headers),
    }
  },
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
    links: [{ rel: 'icon', href: '/favicon.ico' }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { isMobile, theme, themePreference } = Route.useLoaderData()
  const locale = useRouterState({
    select: (state) => {
      const routeLocale = state.matches
        .map((match) => {
          return 'locale' in match.params ? match.params.locale : undefined
        })
        .find(
          (param): param is string =>
            typeof param === 'string' && isSupportedLocale(param),
        )
      return routeLocale ?? defaultLocale
    },
  })

  return (
    <html
      lang={locale}
      className={cn({
        'font-ja': locale === 'ja',
        'font-zh-hant': locale === 'zh-Hant',
        'font-zh-hans': locale === 'zh-Hans',
        'font-ko': locale === 'ko',
      })}
      suppressHydrationWarning
    >
      <head>
        {theme === 'dark' && (
          <script
            dangerouslySetInnerHTML={{
              __html:
                "document.documentElement.classList.add('dark');document.currentScript.remove();",
            }}
          />
        )}
        <link
          href="/fonts/plex-sans/IBMPlexSans-Regular.css"
          rel="stylesheet"
        />
        {locale === 'ja' && (
          <link
            href="/fonts/plex-sans-jp/IBMPlexSansJP-Regular.css"
            rel="stylesheet"
          />
        )}
        {locale === 'zh-Hant' && (
          <link
            href="/fonts/plex-sans-tc/IBMPlexSansTC-Regular.css"
            rel="stylesheet"
          />
        )}
        {locale === 'zh-Hans' && (
          <link
            href="/fonts/plex-sans-sc/IBMPlexSansSC-Regular.css"
            rel="stylesheet"
          />
        )}
        {locale === 'ko' && (
          <link
            href="/fonts/plex-sans-kr/IBMPlexSansKR-Regular.css"
            rel="stylesheet"
          />
        )}
        <HeadContent />
      </head>
      <body>
        <JotaiRootProvider
          initialResolvedTheme={theme ?? 'light'}
          initialTheme={themePreference}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme={themePreference}
            enableSystem
            disableTransitionOnChange
          >
            <DesktopBackground initialEnabled={!isMobile} />
            <I18nProvider
              locale={locale}
              namespaces={['common']}
              resources={resources}
            >
              <div className="relative z-0 mx-auto flex min-h-screen max-w-[960px] flex-col items-center justify-center px-4 md:px-8">
                <Header />
                {children}
                <FooterClient />
              </div>
            </I18nProvider>
          </ThemeProvider>
        </JotaiRootProvider>
        <Scripts />
      </body>
    </html>
  )
}
