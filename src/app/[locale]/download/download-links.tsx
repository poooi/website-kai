'use client'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'

import { osAtom, specAtom } from './store'

import { Button } from '~/components/ui/button'
import { type PoiVersions } from '~/lib/fetch-poi-versions'
import { platformToTarget, getDownloadLink, type Target } from '~/lib/target'
import { cn } from '~/lib/utils'

interface DownloadLinksProps {
  poiVersions: PoiVersions
}

export const DownloadLinks = ({ poiVersions }: DownloadLinksProps) => {
  const os = useAtomValue(osAtom)
  const spec = useAtomValue(specAtom)
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const target: Target | undefined = platformToTarget[os!]?.[spec!]

  const stableURL =
    target && poiVersions ? getDownloadLink(poiVersions.version, target) : ''
  const betaURL =
    target && poiVersions
      ? getDownloadLink(poiVersions.betaVersion, target)
      : ''

  return (
    <div
      aria-hidden={!os || !spec}
      className={cn('not-prose my-8 flex gap-8', {
        'opacity-0': !os || !spec,
      })}
    >
      <Button className="h-fit flex-col" asChild disabled={!stableURL}>
        <a href={stableURL}>
          <span>{t('download', { version: poiVersions?.version })}</span>
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
          <span>{t('download', { version: poiVersions?.betaVersion })}</span>
          <span>{t('beta-hint')}</span>
        </a>
      </Button>
    </div>
  )
}
