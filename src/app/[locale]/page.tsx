import { compare } from 'compare-versions'
import { headers } from 'next/headers'
import Link from 'next/link'

import { Button } from '~/components/ui/button'
import { initTranslations } from '~/i18n'
import { fetchPoiVersions } from '~/lib/fetch-poi-versions'
import { detectTarget } from '~/lib/target'

export const runtime = 'edge'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const { t } = await initTranslations(locale, ['common'])
  const poiVersions = await fetchPoiVersions()

  const headersList = headers()
  const ua = headersList.get('user-agent') ?? ''
  const target = detectTarget(ua)
  return (
    <div>
      <h1>{t('name')}</h1>
      <p>{t('description')}</p>
      <Button className="h-fit flex-col">
        <span>{t('download', { version: poiVersions.version })}</span>
        <span>{t('stable-hint')}</span>
        <span>{t(target)}</span>
      </Button>
      {compare(poiVersions.version, poiVersions.betaVersion, '<') && (
        <Button variant="secondary" className="h-fit flex-col">
          <span>{t('download', { version: poiVersions.betaVersion })}</span>
          <span>{t('beta-hint')}</span>
          <span>{t(target)}</span>
        </Button>
      )}
      <Button variant="link" asChild>
        <Link href="/downloads">{t('Choose another platform')}</Link>
      </Button>
    </div>
  )
}
