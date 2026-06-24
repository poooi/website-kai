/* eslint-disable @next/next/no-html-link-for-pages */
import { Link, createFileRoute } from '@tanstack/react-router'

import { Transition } from '~/components/transition'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  loadRequestAwarePageData,
  requireSupportedLocale,
} from '~/lib/tanstack-page-data'

export const Route = createFileRoute('/$locale/')({
  loader: ({ context, params }) =>
    loadRequestAwarePageData(requireSupportedLocale(params.locale), context),
  head: ({ loaderData }) => ({
    meta: [{ title: `poi | ${loaderData?.title ?? 'KanColle Browser'}` }],
  }),
  component: LocalizedHomePage,
})

function LocalizedHomePage() {
  const data = Route.useLoaderData()
  const { locale } = Route.useParams()
  return (
    <Transition
      role="main"
      className="flex w-full grow items-center md:pl-[45px]"
    >
      <div className="w-full">
        <h1 className="text-9xl leading-loose">{data.name}</h1>
        <p className="text-2xl">{data.description}</p>
        {data.platform.isMobile ? (
          <p className="mt-4">{data.mobileHint}</p>
        ) : (
          <>
            <div className="my-8">
              <div className="flex gap-8">
                <Button className="h-fit flex-col" asChild>
                  <a href={data.stableUrl}>
                    <span>{data.stableDownloadLabel}</span>
                    <span>{data.stableHint}</span>
                  </a>
                </Button>
                {data.showBeta && (
                  <Button
                    variant="secondary"
                    className="h-fit flex-col"
                    asChild
                  >
                    <a href={data.betaUrl}>
                      <span>{data.betaDownloadLabel}</span>
                      <span>{data.betaHint}</span>
                    </a>
                  </Button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-500 text-white dark:bg-green-600"
                >
                  {data.newLabel}
                </Badge>
                <span>{data.httpsUpdateSupported}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>{data.sightedBySkilledLookouts}</span>
              <Badge variant="secondary">
                {data.platformLabels.os[data.platform.os]}
              </Badge>
              <Badge variant="secondary">
                {data.platformLabels.spec[data.platform.spec]}
              </Badge>
              <Button variant="link" asChild>
                <Link to="/$locale/download" params={{ locale }}>
                  {data.downloadOptions}
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </Transition>
  )
}
