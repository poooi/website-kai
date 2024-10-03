import { compare } from 'compare-versions'
import { headers } from 'next/headers'
import Link from 'next/link'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { initTranslations } from '~/i18n'
import { fetchPoiVersions } from '~/lib/fetch-poi-versions'
import { detectTargetFromRequest, getDownloadLink } from '~/lib/target'

export const runtime = 'edge'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const { t } = await initTranslations(locale, ['common'])
  const poiVersions = await fetchPoiVersions()

  const { os, spec, target } = await detectTargetFromRequest(headers())
  const stableURL = getDownloadLink(poiVersions.version, target)
  const betaURL = getDownloadLink(poiVersions.betaVersion, target)
  return (
    <div>
      <h1>{t('name')}</h1>
      <p>{t('description')}</p>
      <Button className="h-fit flex-col" asChild>
        <a href={stableURL}>
          <span>{t('download', { version: poiVersions.version })}</span>
          <span>{t('stable-hint')}</span>
        </a>
      </Button>
      {compare(poiVersions.version, poiVersions.betaVersion, '<') && (
        <Button variant="secondary" className="h-fit flex-col" asChild>
          <a href={betaURL}>
            <span>{t('download', { version: poiVersions.betaVersion })}</span>
            <span>{t('beta-hint')}</span>
          </a>
        </Button>
      )}
      <div>
        {t('Sighted by skilled lookouts:')}
        <Badge variant="secondary">{t(os)}</Badge>
        <Badge variant="secondary">{t(spec)}</Badge>
        <Button variant="link" asChild>
          <Link href="/download">{t('Download options')}</Link>
        </Button>
      </div>
    </div>
  )
}
