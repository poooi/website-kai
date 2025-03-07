import { compare } from 'compare-versions'
import { headers } from 'next/headers'
import Link from 'next/link'

import { Transition } from '~/components/transition'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { initTranslations } from '~/i18n'
import { fetchPoiVersions } from '~/lib/fetch-poi-versions'
import {
  detectTargetFromRequest,
  getDownloadLink,
  isMobileDevice,
} from '~/lib/target'

export const runtime = 'edge'

export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const { locale } = params

  const { t } = await initTranslations(locale, ['common'])
  const poiVersions = await fetchPoiVersions()

  const { os, spec, target } = await detectTargetFromRequest(await headers())
  const isMobile = await isMobileDevice(await headers())
  const stableURL = getDownloadLink(poiVersions.version, target)
  const betaURL = getDownloadLink(poiVersions.betaVersion, target)
  return (
    <Transition className="flex w-full grow items-center md:pl-[45px]">
      <div className="w-full">
        <h1 className="text-9xl leading-loose">{t('name')}</h1>
        <p className="text-2xl">{t('description')}</p>
        {isMobile ? (
          <p className="mt-4">{t('mobile-hint')}</p>
        ) : (
          <>
            <div className="my-8 flex gap-8">
              <Button className="h-fit flex-col" asChild>
                <a href={stableURL}>
                  <span>{t('download', { version: poiVersions.version })}</span>
                  <span>{t('stable-hint')}</span>
                </a>
              </Button>
              {compare(poiVersions.version, poiVersions.betaVersion, '<') && (
                <Button variant="secondary" className="h-fit flex-col" asChild>
                  <a href={betaURL}>
                    <span>
                      {t('download', { version: poiVersions.betaVersion })}
                    </span>
                    <span>{t('beta-hint')}</span>
                  </a>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>{t('Sighted by skilled lookouts:')}</span>
              <Badge variant="secondary">{t(os)}</Badge>
              <Badge variant="secondary">{t(spec)}</Badge>
              <Button variant="link" asChild>
                <Link href="/download">{t('Download options')}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </Transition>
  )
}
