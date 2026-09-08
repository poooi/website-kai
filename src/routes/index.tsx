import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowDownToLine, ArrowRight } from 'lucide-react'

import poiLogo from '~/assets/poi.png'
import { DownloadError } from '~/components/download/download-error'
import { Transition } from '~/components/transition'
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
            src={typeof poiLogo === 'string' ? poiLogo : poiLogo.src}
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
        <p className="mt-[30px] mb-[38px] max-w-[430px] text-[clamp(23px,2vw,32px)] leading-[1.6] font-medium text-pretty [word-break:auto-phrase] text-[var(--harbour-copy)] max-[700px]:mt-6 max-[700px]:mb-7 max-[700px]:text-[23px] min-[701px]:max-[1100px]:max-w-[360px] min-[701px]:max-[1100px]:text-2xl/[1.6]">
          <span className="block">{m.harbourIntro()}</span>
          <span className="block">{m.harbourTools()}</span>
        </p>
        <div className="flex flex-wrap items-center gap-6 max-[700px]:gap-5">
          {!hasDirectDownload ? (
            <Link
              className="inline-flex min-h-[62px] max-w-full items-center gap-4 rounded-lg bg-primary px-[28px] py-[17px] text-[23px] text-primary-foreground [transition:background_0.15s,translate_0.15s] hover:-translate-y-0.5 hover:bg-[#89362b] max-[700px]:min-h-[56px] max-[700px]:px-5 max-[700px]:py-[14px] max-[700px]:text-[20px] min-[701px]:max-[1100px]:px-[23px] min-[701px]:max-[1100px]:py-[15px] min-[701px]:max-[1100px]:text-[21px] dark:hover:bg-[#c15a46]"
              to="/download"
            >
              <ArrowDownToLine
                className="h-[26px] w-[26px] shrink-0"
                aria-hidden="true"
              />
              {m.download()}
            </Link>
          ) : (
            <a
              className="inline-flex min-h-[62px] max-w-full items-center gap-4 rounded-lg bg-primary px-[28px] py-[17px] text-[23px] text-primary-foreground [transition:background_0.15s,translate_0.15s] hover:-translate-y-0.5 hover:bg-[#89362b] max-[700px]:min-h-[56px] max-[700px]:px-5 max-[700px]:py-[14px] max-[700px]:text-[20px] min-[701px]:max-[1100px]:px-[23px] min-[701px]:max-[1100px]:py-[15px] min-[701px]:max-[1100px]:text-[21px] dark:hover:bg-[#c15a46]"
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
            className="inline-flex items-center gap-4 text-lg/normal font-semibold text-primary underline underline-offset-8 max-[700px]:text-base min-[701px]:max-[1100px]:text-base dark:text-[#e49a84]"
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
            <p
              id="beta-download-details"
              className="mt-3 mb-[22px] text-base text-muted-foreground max-[700px]:text-sm/normal"
            >
              {data.poiVersions.betaVersion} · {m.beta()} ·{' '}
              {getPlatformSpecLabel(data.platform.os, data.platform.spec)}
            </p>
          </div>
        )}
        {data.platform.isMobile && (
          <p className="mb-5 max-w-[430px] text-[var(--harbour-copy)]">
            {m.mobileHint()}
          </p>
        )}
        <Link
          className="self-start border-b border-[var(--harbour-teal)] pb-1.5 text-lg/normal text-[var(--harbour-teal)] max-[700px]:text-base"
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
          className="rounded bg-background/90 px-2 py-1 text-xs text-foreground underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          © OpenStreetMap contributors
        </a>
      </div>
    </Transition>
  )
}
