import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowDownToLine, ArrowRight } from 'lucide-react'

import poiLogo from '~/assets/poi.png'
import { DownloadError } from '~/components/download/download-error'
import { Transition } from '~/components/transition'
import { HarbourMap } from '~/components/harbour-map'
import { getPlatformSpecLabel } from '~/lib/platform-labels'
import { loadRequestAwarePageData } from '~/lib/tanstack-page-data'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/')({
  loader: ({ context }) => loadRequestAwarePageData(context),
  head: () => ({ meta: [{ title: `poi | ${m.kanColleBrowser()}` }] }),
  component: HomePage,
  errorComponent: DownloadError,
})

function HomePage() {
  const data = Route.useLoaderData()
  const hasDirectDownload =
    !data.platform.isMobile && data.stableTargets.includes(data.platform.target)
  const hasBetaDownload =
    !data.platform.isMobile &&
    data.showBeta &&
    data.betaTargets.includes(data.platform.target)
  return (
    <Transition className="harbour-home">
      <HarbourMap />
      <section className="harbour-hero" aria-labelledby="brand">
        <div className="harbour-brand">
          <img
            src={typeof poiLogo === 'string' ? poiLogo : poiLogo.src}
            alt=""
            width="140"
            height="140"
          />
          <h1 id="brand">{m.name()}</h1>
        </div>
        <p className="harbour-description">
          <span>{m.harbourIntro()}</span>
          <span>{m.harbourTools()}</span>
        </p>
        <div className="harbour-actions">
          {!hasDirectDownload ? (
            <Link className="harbour-download" to="/download">
              <ArrowDownToLine aria-hidden="true" />
              {m.download()}
            </Link>
          ) : (
            <a
              className="harbour-download"
              href={data.stableUrl}
              aria-describedby="download-details"
            >
              <ArrowDownToLine aria-hidden="true" />
              <span>{m.download()}</span>
            </a>
          )}
          <Link className="harbour-options" to="/download">
            {m.downloadOptions()}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        {hasDirectDownload && (
          <p id="download-details" className="harbour-platforms">
            {data.poiVersions.version} · {m.stable()} ·{' '}
            {getPlatformSpecLabel(data.platform.os, data.platform.spec)}
          </p>
        )}
        {hasBetaDownload && (
          <div className="mb-2">
            <a
              className="inline-flex items-center gap-4 rounded-lg border border-current px-6 py-3 text-xl text-foreground transition-colors hover:bg-secondary"
              href={data.betaUrl}
              aria-describedby="beta-download-details"
            >
              <ArrowDownToLine aria-hidden="true" />
              {m.download()}
            </a>
            <p id="beta-download-details" className="harbour-platforms">
              {data.poiVersions.betaVersion} · {m.beta()} ·{' '}
              {getPlatformSpecLabel(data.platform.os, data.platform.spec)}
            </p>
          </div>
        )}
        {data.platform.isMobile && (
          <p className="harbour-mobile-hint">{m.mobileHint()}</p>
        )}
        <Link className="harbour-changelog" to="/changelog">
          {m.changelog()} <span aria-hidden="true">→</span>
        </Link>
      </section>
      <div className="absolute bottom-4 right-6 z-10 flex flex-col items-end gap-2 sm:bottom-8 sm:right-10">
        <span
          className="text-sm tracking-widest text-muted-foreground"
          aria-hidden="true"
        >
          MAIZURU BAY
        </span>
        <a
          href="https://www.openstreetmap.org/copyright"
          className="rounded bg-background/90 px-2 py-1 text-xs text-foreground underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          © OpenStreetMap contributors
        </a>
      </div>
    </Transition>
  )
}
