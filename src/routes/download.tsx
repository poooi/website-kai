import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

import { DownloadLinks } from '~/components/download/download-links'
import { DownloadError } from '~/components/download/download-error'
import { PlatformSelect } from '~/components/download/platform-select'
import { Transition } from '~/components/transition'
import { PageHeader } from '~/components/page-header'
import { loadRequestAwarePageData } from '~/lib/tanstack-page-data'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/download')({
  loader: ({ context }) => loadRequestAwarePageData(context),
  head: () => ({
    meta: [{ title: `poi | ${m.kanColleBrowser()} | ${m.download()}` }],
  }),
  component: DownloadPage,
  errorComponent: DownloadError,
})

function DownloadPage() {
  const data = Route.useLoaderData()
  return (
    <Transition className="w-full">
      <PageHeader title={m.download()}>
        {!data.platform.isMobile && <p>{m.downloadIntro()}</p>}
      </PageHeader>
      {data.platform.isMobile ? (
        <p className="mb-10 border-l-2 border-[var(--harbour-teal)] pl-5 leading-relaxed text-muted-foreground">
          {m.mobileHint()}
        </p>
      ) : (
        <div className="grid gap-10 border-b pb-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:gap-16">
          <PlatformSelect
            initialOS={data.platform.os}
            initialSpec={
              data.stableTargets.includes(data.platform.target)
                ? data.platform.spec
                : undefined
            }
            availableTargets={[...data.stableTargets, ...data.betaTargets]}
          />
          <div className="min-w-0">
            <DownloadLinks
              poiVersions={data.poiVersions}
              stableTargets={data.stableTargets}
              betaTargets={data.betaTargets}
            />
          </div>
        </div>
      )}
      <div className="mt-8">
        <a
          className="inline-flex items-center gap-2 text-sm text-[var(--harbour-teal)] underline decoration-current/40 underline-offset-4 hover:decoration-current"
          href="https://github.com/poooi/poi/releases"
        >
          {m.originalReleases()}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      <section className="mt-14" aria-labelledby="other-downloads">
        <h2
          id="other-downloads"
          className="mb-5 text-2xl font-semibold tracking-tight"
        >
          {m.others()}
        </h2>
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-muted-foreground">
          <a
            className="inline-flex items-center gap-2 hover:text-foreground"
            href="https://registry.npmmirror.com/binary.html?path=poi/"
            rel="noopener noreferrer"
            target="_blank"
            data-testid="old-versions"
          >
            {m.oldVersions()}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            className="inline-flex items-center gap-2 hover:text-foreground"
            href="https://nightly.poi.moe/"
            rel="noopener noreferrer"
            target="_blank"
          >
            {m.nightlyBuilds()}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            className="inline-flex items-center gap-2 hover:text-foreground"
            href="https://github.com/poooi/poi"
            rel="noopener noreferrer"
            target="_blank"
          >
            {m.sourceCode()}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </Transition>
  )
}
