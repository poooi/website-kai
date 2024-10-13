/* eslint-disable @next/next/no-page-custom-font */
import '~/styles/globals.css'

import { type Metadata } from 'next'
import { headers } from 'next/headers'
import ReactDOM from 'react-dom'

import { Background } from '~/components/background'
import { Footer } from '~/components/footer'
import { Header } from '~/components/header'
import { I18nProvider } from '~/components/i18n-provider'
import { ThemeProvider } from '~/components/theme-provider'
import { initTranslations } from '~/i18n'
import { i18nConfig } from '~/i18n-config'
import { parseUA } from '~/lib/target'
import { cn } from '~/lib/utils'

export const generateStaticParams = async () => {
  return i18nConfig.locales.map((locale) => ({ locale }))
}

export const generateMetadata = async ({
  params: { locale },
}: Readonly<{
  params: {
    locale: string
  }
}>): Promise<Metadata> => {
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

ReactDOM.preconnect('https://fonts.googleapis.com')
ReactDOM.preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' })

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: {
    locale: string
  }
}>) {
  const { resources, t, i18n } = await initTranslations(locale, ['common'])

  const ua = await parseUA(headers())

  const isMobile = ['mobile', 'tablet'].includes(ua.device.type!)

  return (
    <html
      lang={locale}
      className={cn({
        'font-ja': locale === 'ja',
        'font-zh-hant': locale === 'zh-Hant',
        'font-sh-hans': locale === 'zh-Hans',
        'font-ko': locale === 'ko',
      })}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100..900&display=swap"
          rel="stylesheet"
        />
        {locale === 'ja' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap"
            rel="stylesheet"
          />
        )}
        {locale === 'zh-Hant' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&display=swap"
            rel="stylesheet"
          ></link>
        )}
        {locale === 'zh-Hans' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&display=swap"
            rel="stylesheet"
          ></link>
        )}
        {locale === 'ko' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap"
            rel="stylesheet"
          ></link>
        )}
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {!isMobile && <Background />}
          <I18nProvider
            locale={locale}
            namespaces={['common']}
            resources={resources}
          >
            <main className="relative z-0 mx-auto flex min-h-screen max-w-[960px] flex-col items-center justify-center">
              <Header />
              {children}
              <Footer t={t} i18n={i18n} />
            </main>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
