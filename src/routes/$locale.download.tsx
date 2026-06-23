import { createFileRoute } from '@tanstack/react-router'

import { DownloadLinks } from '~/components/download/download-links'
import { PlatformSelect } from '~/components/download/platform-select'
import { Transition } from '~/components/transition'
import { Button } from '~/components/ui/button'
import {
  loadRequestAwarePageData,
  requireSupportedLocale,
} from '~/lib/tanstack-page-data'

export const Route = createFileRoute('/$locale/download')({
  loader: ({ context, params }) =>
    loadRequestAwarePageData(requireSupportedLocale(params.locale), context),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `poi | ${loaderData?.title ?? 'KanColle Browser'} | ${
          loaderData?.download ?? 'Download'
        }`,
      },
    ],
  }),
  component: LocalizedDownloadPage,
})

function LocalizedDownloadPage() {
  const data = Route.useLoaderData()
  return (
    <Transition
      role="main"
      className="prose flex w-full max-w-none grow flex-col dark:prose-invert"
    >
      <h1 className="mb-[1em] mt-0 text-[1.5em] font-semibold leading-[1.3333333]">
        {data.download}
      </h1>
      {data.platform.isMobile ? (
        <p>{data.mobileHint}</p>
      ) : (
        <section>
          <PlatformSelect
            initialOS={data.platform.os}
            initialSpec={data.platform.spec}
            labels={{
              operatingSystem: data.operatingSystem,
              os: data.platformLabels.os,
              platform: data.platformLabel,
              spec: data.platformLabels.spec,
            }}
          />
          <DownloadLinks
            labels={{
              beta: data.betaDownloadLabel,
              betaHint: data.betaHint,
              stable: data.stableDownloadLabel,
              stableHint: data.stableHint,
            }}
            poiVersions={data.poiVersions}
          />
        </section>
      )}
      <h2>{data.others}</h2>
      <section className="flex w-fit flex-col items-center">
        <div>
          <Button variant="link" asChild>
            <a
              href="https://registry.npmmirror.com/binary.html?path=poi/"
              rel="noopener noreferrer"
              target="_blank"
              data-testid="old-versions"
            >
              {data.oldVersions}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://nightly.poi.moe/"
              rel="noopener noreferrer"
              target="_blank"
            >
              {data.nightlyBuilds}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://github.com/poooi/poi"
              rel="noopener noreferrer"
              target="_blank"
            >
              {data.sourceCode}
            </a>
          </Button>
        </div>
      </section>
    </Transition>
  )
}
