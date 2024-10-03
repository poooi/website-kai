import { initTranslations } from '~/i18n'

export const runtime = 'edge'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const { t } = await initTranslations(locale, ['common'])
  return <div className="w-full grow">{t('Explore')}</div>
}
