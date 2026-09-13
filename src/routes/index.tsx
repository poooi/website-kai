import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowDownToLine, ArrowRight } from 'lucide-react'

import poiLogo from '~/assets/poi.svg?url'
import { DownloadError } from '~/components/download/download-error'
import { Transition } from '~/components/transition'
import { buttonVariants } from '~/components/ui/button'
import { getPlatformSpecLabel } from '~/lib/platform-labels'
import { loadRequestAwarePageData } from '~/lib/page-data'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/')({
  loader: () => loadRequestAwarePageData(),
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
    <Transition
      variant="home"
      className="harbour-home relative flex min-h-[690px] flex-1 overflow-hidden max-[700px]:min-h-[calc(100svh_-_126px)] max-[700px]:pb-[330px]"
    >
      <section
        className="relative z-[1] ml-[5.7%] flex min-h-[690px] w-[38%] max-w-[560px] flex-col justify-center pt-[55px] pb-[100px] max-[700px]:mx-[6%] max-[700px]:min-h-0 max-[700px]:w-[88%] max-[700px]:max-w-[550px] max-[700px]:pt-12 max-[700px]:pb-10 min-[701px]:max-[1100px]:w-[43%]"
        aria-labelledby="brand"
      >
        <div className="flex items-center gap-[22px] max-[700px]:gap-[18px]">
          <img
            src={poiLogo}
            alt=""
            width="140"
            height="140"
            className="h-auto w-[clamp(100px,9vw,150px)] max-[700px]:w-[95px]"
          />
          <h1
            id="brand"
            className="mb-3 text-[clamp(100px,9vw,150px)] leading-none font-extrabold tracking-[-0.06em] max-[700px]:text-[108px]"
          >
            {m.name()}
          </h1>
        </div>
        <p className="mt-[30px] mb-[38px] max-w-[430px] text-[clamp(23px,2vw,32px)] leading-[1.6] font-medium text-pretty [word-break:auto-phrase] text-copy max-[700px]:mt-6 max-[700px]:mb-7 max-[700px]:text-[23px] min-[701px]:max-[1100px]:max-w-[360px] min-[701px]:max-[1100px]:text-2xl/[1.6]">
          <span className="block">{m.harbourIntro()}</span>
          <span className="block">{m.harbourTools()}</span>
        </p>
        <div className="flex flex-wrap items-center gap-6 max-[700px]:gap-5">
          {!hasDirectDownload ? (
            <Link className={buttonVariants({ size: 'hero' })} to="/download">
              <ArrowDownToLine
                className="h-[26px] w-[26px] shrink-0"
                aria-hidden="true"
              />
              {m.download()}
            </Link>
          ) : (
            <a
              className={buttonVariants({ size: 'hero' })}
              href={data.stableUrl}
              aria-describedby="download-details"
            >
              <ArrowDownToLine
                className="h-[26px] w-[26px] shrink-0"
                aria-hidden="true"
              />
              <span>{m.download()}</span>
            </a>
          )}
          <Link
            className="text-link inline-flex items-center gap-3 text-base font-medium"
            to="/download"
          >
            {m.downloadOptions()}
            <ArrowRight className="shrink-0" aria-hidden="true" />
          </Link>
        </div>
        {hasDirectDownload && (
          <p
            id="download-details"
            className="mt-3 mb-[22px] text-base text-muted-foreground max-[700px]:text-sm/normal"
          >
            <span className="font-mono">{data.poiVersions.version}</span> ·{' '}
            {m.stable()} ·{' '}
            {getPlatformSpecLabel(data.platform.os, data.platform.spec)}
          </p>
        )}
        {hasBetaDownload && (
          <div className="mb-2">
            <a
              className={buttonVariants({ variant: 'outline', size: 'lg' })}
              href={data.betaUrl}
              aria-describedby="beta-download-details"
            >
              <ArrowDownToLine aria-hidden="true" />
              {m.download()}
            </a>
            <p
              id="beta-download-details"
              className="mt-3 mb-[22px] text-base text-muted-foreground max-[700px]:text-sm/normal"
            >
              <span className="font-mono">{data.poiVersions.betaVersion}</span>{' '}
              · {m.beta()} ·{' '}
              {getPlatformSpecLabel(data.platform.os, data.platform.spec)}
            </p>
          </div>
        )}
        {data.platform.isMobile && (
          <p className="mb-5 max-w-[430px] text-copy">{m.mobileHint()}</p>
        )}
        <Link
          className="text-link self-start text-base font-medium"
          to="/changelog"
        >
          {m.changelog()} <span aria-hidden="true">→</span>
        </Link>
      </section>
      <div className="absolute right-6 bottom-4 z-10 flex flex-col items-end gap-2 sm:right-10 sm:bottom-8">
        <span
          className="text-sm tracking-widest text-muted-foreground"
          aria-hidden="true"
        >
          MAIZURU BAY
        </span>
        <a
          href="https://www.openstreetmap.org/copyright"
          className="rounded bg-background/90 px-2 py-1 text-xs text-foreground underline-offset-4 hover:underline"
        >
          © OpenStreetMap contributors
        </a>
      </div>
    </Transition>
  )
}
