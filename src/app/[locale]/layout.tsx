/* eslint-disable @next/next/no-css-tags */
/* eslint-disable @next/next/no-page-custom-font */
import '~/styles/globals.css'

import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { DesktopBackground } from '~/components/desktop-background'
import { Footer } from '~/components/footer'
import { HeaderNext } from '~/components/header-next'
import { I18nProvider } from '~/components/i18n-provider'
import { JotaiRootProvider } from '~/components/jotai-provider'
import { ThemeRuntime } from '~/components/theme-runtime'
import { initTranslations } from '~/i18n'
import { i18nConfig } from '~/i18n-config'
import { isMobileDevice } from '~/lib/target'
import { getServerThemePreference, resolveServerTheme } from '~/lib/theme'
import { cn } from '~/lib/utils'

export const generateStaticParams = async () => {
  return i18nConfig.locales.map((locale) => ({ locale }))
}

export const generateMetadata = async (
  props: Readonly<{
    params: Promise<{
      locale: string
    }>
  }>,
): Promise<Metadata> => {
  const params = await props.params

  const { locale } = params

  const { t } = await initTranslations(locale, ['common'])
  return {
    title: `poi | ${t('KanColle Browser')}`,
    description:
      'Scalable KanColle browser and tool, for Windows, macOS and Linux. 一个可扩展的舰队Collection浏览器。拡張可能な艦隊これくしょんブラウザ。',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
    keywords: [
      'poi',
      'kancolle',
      'browser',
      '艦これ',
      '艦隊これくしょん',
      '舰队Collection',
    ],
    metadataBase: new URL('https://poi.moe'),
  }
}

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode
    params: Promise<{
      locale: string
    }>
  }>,
) {
  const params = await props.params

  const { locale } = params

  const { children } = props

  const { resources, t, i18n } = await initTranslations(locale, ['common'])

  const requestHeaders = await headers()
  const isMobile = await isMobileDevice(requestHeaders)
  const theme = resolveServerTheme(requestHeaders)
  const themePreference = getServerThemePreference(requestHeaders)

  return (
    <html
      lang={locale}
      className={cn({
        'font-ja': locale === 'ja',
        dark: theme === 'dark',
        'font-zh-hant': locale === 'zh-Hant',
        'font-zh-hans': locale === 'zh-Hans',
        'font-ko': locale === 'ko',
      })}
      suppressHydrationWarning
    >
      <head>
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
          ></link>
        )}
        {locale === 'zh-Hans' && (
          <link
            href="/fonts/plex-sans-sc/IBMPlexSansSC-Regular.css"
            rel="stylesheet"
          ></link>
        )}
        {locale === 'ko' && (
          <link
            href="/fonts/plex-sans-kr/IBMPlexSansKR-Regular.css"
            rel="stylesheet"
          ></link>
        )}
      </head>
      <body>
        <JotaiRootProvider
          initialResolvedTheme={theme ?? 'light'}
          initialTheme={themePreference}
        >
          <ThemeRuntime
            defaultTheme={themePreference}
            enableSystem
            disableTransitionOnChange
          />
          <DesktopBackground initialEnabled={!isMobile} />
          <I18nProvider
            locale={locale}
            namespaces={['common']}
            resources={resources}
          >
            <main className="relative z-0 mx-auto flex min-h-screen max-w-[960px] flex-col items-center justify-center px-4 md:px-8">
              <HeaderNext />
              {children}
              <Footer t={t} i18n={i18n} />
            </main>
          </I18nProvider>
        </JotaiRootProvider>
      </body>
    </html>
  )
}
