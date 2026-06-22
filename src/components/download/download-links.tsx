'use client'

import { compare } from 'compare-versions'
import { useAtomValue } from 'jotai'

import { osAtom, specAtom } from './store'

import { Button } from '~/components/ui/button'
import { type PoiVersions } from '~/lib/fetch-poi-versions'
import { getDownloadLink, platformToTarget, type Target } from '~/lib/target'
import { cn } from '~/lib/utils'

interface DownloadLinksProps {
  labels: {
    beta: string
    betaHint: string
    stable: string
    stableHint: string
  }
  poiVersions: PoiVersions
}

export const DownloadLinks = ({ labels, poiVersions }: DownloadLinksProps) => {
  const os = useAtomValue(osAtom)
  const spec = useAtomValue(specAtom)
  const target: Target | undefined = platformToTarget[os!]?.[spec!]

  const stableURL = target ? getDownloadLink(poiVersions.version, target) : ''
  const betaURL = target ? getDownloadLink(poiVersions.betaVersion, target) : ''

  return (
    <div
      aria-hidden={!os || !spec}
      className={cn('not-prose my-8 flex gap-8', {
        'opacity-0': !os || !spec,
      })}
    >
      <Button className="h-fit flex-col" asChild disabled={!stableURL}>
        <a href={stableURL}>
          <span>{labels.stable}</span>
          <span>{labels.stableHint}</span>
        </a>
      </Button>
      {compare(poiVersions.version, poiVersions.betaVersion, '<') && (
        <Button
          variant="secondary"
          className="h-fit flex-col"
          asChild
          disabled={!betaURL}
        >
          <a href={betaURL}>
            <span>{labels.beta}</span>
            <span>{labels.betaHint}</span>
          </a>
        </Button>
      )}
    </div>
  )
}
