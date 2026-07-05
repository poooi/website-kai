import { Link, createFileRoute } from '@tanstack/react-router'

import { Transition } from '~/components/transition'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { getPlatformLabels, getPlatformSpecLabel } from '~/lib/platform-labels'
import { loadRequestAwarePageData } from '~/lib/tanstack-page-data'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/')({
  loader: ({ context }) => loadRequestAwarePageData(context),
  head: () => ({
    meta: [{ title: `poi | ${m.kanColleBrowser()}` }],
  }),
  component: HomePage,
})

function HomePage() {
  const data = Route.useLoaderData()
  const platformLabels = getPlatformLabels()
  return (
    <Transition
      role="main"
      className="flex w-full grow items-center md:pl-[45px]"
    >
      <div className="w-full">
        <h1 className="text-9xl leading-loose">{m.name()}</h1>
        <p className="text-2xl">{m.description()}</p>
        {data.platform.isMobile ? (
          <p className="mt-4">{m.mobileHint()}</p>
        ) : (
          <>
            <div className="my-8">
              <div className="flex gap-8">
                <Button className="h-fit flex-col" asChild>
                  <a href={data.stableUrl}>
                    <span>
                      {m.downloadWithVersion({
                        version: data.poiVersions.version,
                      })}
                    </span>
                    <span>{m.stableHint()}</span>
                  </a>
                </Button>
                {data.showBeta && (
                  <Button
                    variant="secondary"
                    className="h-fit flex-col"
                    asChild
                  >
                    <a href={data.betaUrl}>
                      <span>
                        {m.downloadWithVersion({
                          version: data.poiVersions.betaVersion,
                        })}
                      </span>
                      <span>{m.betaHint()}</span>
                    </a>
                  </Button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-500 text-white dark:bg-green-600"
                >
                  {m.newLabel()}
                </Badge>
                <span>{m.httpsUpdateSupported()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>{m.autoDetectedRecommendedDownload()}</span>
              <Badge variant="secondary">
                {platformLabels.os[data.platform.os]}
              </Badge>
              <Badge variant="secondary">
                {getPlatformSpecLabel(data.platform.os, data.platform.spec)}
              </Badge>
              <Button variant="link" asChild>
                <Link to="/download">{m.downloadOptions()}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </Transition>
  )
}
