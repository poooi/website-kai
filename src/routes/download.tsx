import { createFileRoute } from '@tanstack/react-router'

import { DownloadLinks } from '~/components/download/download-links'
import { PlatformSelect } from '~/components/download/platform-select'
import { Transition } from '~/components/transition'
import { Button } from '~/components/ui/button'
import { loadRequestAwarePageData } from '~/lib/tanstack-page-data'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/download')({
  loader: ({ context }) => loadRequestAwarePageData(context),
  head: () => ({
    meta: [
      {
        title: `poi | ${m.kanColleBrowser()} | ${m.download()}`,
      },
    ],
  }),
  component: DownloadPage,
})

function DownloadPage() {
  const data = Route.useLoaderData()
  return (
    <Transition
      role="main"
      className="prose dark:prose-invert flex w-full max-w-none grow flex-col"
    >
      <h1 className="mt-0 mb-[1em] text-[1.5em] leading-[1.3333333] font-semibold">
        {m.download()}
      </h1>
      {data.platform.isMobile ? (
        <p>{m.mobileHint()}</p>
      ) : (
        <section>
          <PlatformSelect
            initialOS={data.platform.os}
            initialSpec={data.platform.spec}
          />
          <DownloadLinks poiVersions={data.poiVersions} />
        </section>
      )}
      <h2>{m.others()}</h2>
      <section className="flex w-fit flex-col items-center">
        <div>
          <Button variant="link" asChild>
            <a
              href="https://registry.npmmirror.com/binary.html?path=poi/"
              rel="noopener noreferrer"
              target="_blank"
              data-testid="old-versions"
            >
              {m.oldVersions()}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://nightly.poi.moe/"
              rel="noopener noreferrer"
              target="_blank"
            >
              {m.nightlyBuilds()}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://github.com/poooi/poi"
              rel="noopener noreferrer"
              target="_blank"
            >
              {m.sourceCode()}
            </a>
          </Button>
        </div>
      </section>
    </Transition>
  )
}
