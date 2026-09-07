'use client'

import { compare } from 'compare-versions'
import { Link } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { ArrowDownToLine, ArrowRight } from 'lucide-react'

import { osAtom, specAtom } from './store'
import { Button } from '~/components/ui/button'
import { type PoiVersions } from '~/lib/fetch-poi-versions'
import { getDownloadTargetLabel } from '~/lib/platform-labels'
import { getDownloadLink, platformToTarget, type Target } from '~/lib/target'
import { m } from '~/paraglide/messages'

interface DownloadLinksProps {
  poiVersions: PoiVersions
  stableTargets: Target[]
  betaTargets: Target[]
}

export const DownloadLinks = ({
  poiVersions,
  stableTargets,
  betaTargets,
}: DownloadLinksProps) => {
  const os = useAtomValue(osAtom)
  const spec = useAtomValue(specAtom)
  const target = os && spec ? platformToTarget[os][spec] : undefined

  if (!target || !os || !spec) {
    return (
      <p role="status" className="py-4 leading-relaxed text-muted-foreground">
        {m.selectDownloadPlatform()}
      </p>
    )
  }

  const releases = [
    {
      channel: 'stable',
      version: poiVersions.version,
      label: m.stable(),
      hint: m.stableHint(),
      available: stableTargets.includes(target),
    },
    {
      channel: 'beta',
      version: poiVersions.betaVersion,
      label: m.beta(),
      hint: m.betaHint(),
      available:
        betaTargets.includes(target) &&
        compare(poiVersions.version, poiVersions.betaVersion, '<'),
    },
  ].filter((release) => release.available)

  if (releases.length === 0) {
    return (
      <p role="status" className="py-4 leading-relaxed text-muted-foreground">
        {m.releaseLoadError()}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {releases.map(({ channel, version, label, hint }) => {
        const url = getDownloadLink(version, target)
        const detailsId = channel + '-download-details'
        return (
          <section
            key={channel}
            className="flex flex-col items-start gap-4 [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-8"
            aria-labelledby={channel + '-version'}
          >
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--harbour-teal)]">
                {label}
              </p>
              <h2
                id={channel + '-version'}
                className="break-all text-3xl font-semibold tracking-tight"
              >
                {version}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {hint}
              </p>
            </div>
            <Button
              variant={channel === 'stable' ? 'default' : 'outline'}
              className="mt-2 h-auto gap-3 px-7 py-3.5 text-lg shadow-none"
              asChild
            >
              <a
                href={url}
                aria-describedby={channel + '-version ' + detailsId}
              >
                <ArrowDownToLine className="h-5 w-5" aria-hidden="true" />
                {m.download()}
              </a>
            </Button>
            <p id={detailsId} className="text-sm text-muted-foreground">
              {getDownloadTargetLabel(os, spec)} ·{' '}
              {url.split('.').pop()?.toUpperCase()}
            </p>
          </section>
        )
      })}
      <Link
        to="/changelog"
        className="decoration-current/40 inline-flex w-fit items-center gap-2 text-sm text-[var(--harbour-teal)] underline underline-offset-4 hover:decoration-current"
      >
        {m.changelog()}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
