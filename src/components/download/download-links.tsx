'use client'

import { compare } from 'compare-versions'
import { useAtomValue } from 'jotai'

import { ChangelogDialog } from './changelog-dialog'
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
      <div className="flex flex-col gap-2">
        <Button className="h-fit flex-col" asChild disabled={!stableURL}>
          <a href={stableURL}>
            <span>
              {m.downloadWithVersion({ version: poiVersions.version })}
            </span>
            <span>{m.stableHint()}</span>
          </a>
        </Button>
        <ChangelogDialog channel="stable" version={poiVersions.version} />
      </div>
      {compare(poiVersions.version, poiVersions.betaVersion, '<') && (
        <div className="flex flex-col gap-2">
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
          <ChangelogDialog channel="beta" version={poiVersions.betaVersion} />
        </div>
      )}
    </div>
  )
}
