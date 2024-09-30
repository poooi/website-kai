import { Header } from '~/components/header'
import { I18nProvider } from '~/components/i18n-provider'
import { initTranslations } from '~/i18n'

export const runtime = 'edge'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const { resources } = await initTranslations(locale, ['common'])
  return (
    <I18nProvider locale={locale} namespaces={['common']} resources={resources}>
      <main className="relative z-0 flex min-h-screen flex-col items-center justify-center">
        <Header />
      </main>
    </I18nProvider>
  )
}
