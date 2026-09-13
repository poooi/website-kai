import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ArrowRight } from 'lucide-react'
import { z } from 'zod'
import { ReleaseTimeline } from '~/components/changelog/release-timeline'
import { Transition } from '~/components/transition'
import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'
import { fetchChangelogPage } from '~/lib/release-history.server'
import { ReleaseNavigation } from '~/components/changelog/release-navigation'
import { m } from '~/paraglide/messages'
import { getLocale, locales, localizeHref } from '~/paraglide/runtime'

const loadChangelog = createServerFn({ method: 'GET' })
  .validator(z.enum(locales))
  .handler(async ({ data: locale }) => fetchChangelogPage(locale))

export const Route = createFileRoute('/changelog')({
  loaderDeps: () => ({ locale: getLocale() }),
  loader: ({ deps }) => loadChangelog({ data: deps.locale }),
  staleTime: 5 * 60 * 1000,
  head: () => ({ meta: [{ title: `poi | ${m.changelog()}` }] }),
  component: ChangelogPage,
})

function ChangelogPage() {
  const { history, available } = Route.useLoaderData()
  return (
    <Transition>
      <PageHeader title={m.changelog()}>
        <a
          href={localizeHref('/changelog/compare')}
          className="text-link inline-flex items-center gap-2 text-base font-medium"
        >
          {m.releaseCompare()}{' '}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </PageHeader>
      {!available && (
        <PageProse role="alert" className="mb-8 text-sm">
          <p>{m.releaseLoadError()}</p>
          <a href={localizeHref('/changelog')} className="text-link">
            {m.reload()}
          </a>
        </PageProse>
      )}
      {!!history.length && (
        <div className="grid items-start gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <ReleaseNavigation entries={history} />
          <ReleaseTimeline entries={history} />
        </div>
      )}
      <a
        href="https://github.com/poooi/poi/releases"
        className="text-link mt-14 inline-block text-sm"
      >
        {m.originalReleases()} ↗
      </a>
    </Transition>
  )
}
