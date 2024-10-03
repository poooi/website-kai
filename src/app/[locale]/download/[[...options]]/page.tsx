import { notFound } from 'next/navigation'

import { PlatformSelect } from './platform-select'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { initTranslations } from '~/i18n'
import { fetchPoiVersions } from '~/lib/fetch-poi-versions'
import {
  getDownloadLink,
  platformToTarget,
  type Target,
  type OS,
  type PlatformSpec,
} from '~/lib/target'
import { cn } from '~/lib/utils'

export const runtime = 'edge'

export default async function DownloadPage({
  params: { locale, options = [] },
}: {
  params: {
    locale: string
    options?: [OS?, PlatformSpec?]
  }
}) {
  const { t } = await initTranslations(locale, ['common'])
  const [os, spec] = options
  console.log(os, spec)

  const poiVersions = await fetchPoiVersions()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const target: Target | undefined = platformToTarget[os!]?.[spec!]

  if (os && spec && !target) {
    notFound()
  }

  const stableURL = target ? getDownloadLink(poiVersions.version, target) : ''
  const betaURL = target ? getDownloadLink(poiVersions.betaVersion, target) : ''

  return (
    <div className="flex w-full grow flex-col items-center">
      <h2>{t('Download')}</h2>
      <section className="mb-32 mt-16">
        <PlatformSelect os={os} spec={spec} />

        <div
          aria-hidden={!os || !spec}
          className={cn('my-8 flex gap-8', { 'opacity-0': !os || !spec })}
        >
          <Button className="h-fit flex-col" asChild disabled={!stableURL}>
            <a href={stableURL}>
              <span>{t('download', { version: poiVersions.version })}</span>
              <span>{t('stable-hint')}</span>
            </a>
          </Button>
          <Button
            variant="secondary"
            className="h-fit flex-col"
            asChild
            disabled={!betaURL}
          >
            <a href={betaURL}>
              <span>{t('download', { version: poiVersions.betaVersion })}</span>
              <span>{t('beta-hint')}</span>
            </a>
          </Button>
        </div>
      </section>
      <h2>{t('Others')}</h2>
      <section className="mt-4 flex w-fit flex-col items-center">
        <div>
          <Button variant="link" asChild>
            <a
              href="https://registry.npmmirror.com/binary.html?path=poi/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="old-versions"
            >
              {t('Old versions')}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://ci.appveyor.com/project/KochiyaOcean/poi"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Windows nightlies')}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://nightly.poi.moe/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Linux and macOS nightlies')}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://github.com/poooi/poi"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Source code')}
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
