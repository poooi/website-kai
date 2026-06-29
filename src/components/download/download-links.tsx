'use client'

import { compare } from 'compare-versions'
import { useAtomValue } from 'jotai'

import { osAtom, specAtom } from './store'

import { Button } from '~/components/ui/button'
import { type PoiVersions } from '~/lib/fetch-poi-versions'
import { getDownloadLink, platformToTarget, type Target } from '~/lib/target'
import { cn } from '~/lib/utils'
import { m } from '~/paraglide/messages'

interface DownloadLinksProps {
  poiVersions: PoiVersions
}

export const DownloadLinks = ({ poiVersions }: DownloadLinksProps) => {
  const os = useAtomValue(osAtom)
  const spec = useAtomValue(specAtom)
  const target: Target | undefined = platformToTarget[os!]?.[spec!]

  const stableURL = target ? getDownloadLink(poiVersions.version, target) : ''
  const betaURL = target ? getDownloadLink(poiVersions.betaVersion, target) : ''

  if (!target) {
    return null
  }

  return (
    <div className={cn('not-prose my-8 flex gap-8')}>
      <Button className="h-fit flex-col" asChild disabled={!stableURL}>
        <a href={stableURL}>
          <span>{m.downloadWithVersion({ version: poiVersions.version })}</span>
          <span>{m.stableHint()}</span>
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
            <span>
              {m.downloadWithVersion({ version: poiVersions.betaVersion })}
            </span>
            <span>{m.betaHint()}</span>
          </a>
        </Button>
      )}
    </div>
  )
}
