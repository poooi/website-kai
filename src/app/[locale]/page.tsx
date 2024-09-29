import { ThemeChooser } from '~/components/theme-chooser'
import { I18nProvider } from '~/components/i18n-provider'
import { initTranslations } from '~/i18n'
import { LanguageChooser } from '~/components/language-chooser'

export const runtime = 'edge'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const { resources } = await initTranslations(locale, ['common'])
  return (
    <I18nProvider locale={locale} namespaces={['common']} resources={resources}>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <ThemeChooser />
        <LanguageChooser />
      </main>
    </I18nProvider>
  )
}
