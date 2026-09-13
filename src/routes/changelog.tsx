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
  const { current, history, incomplete } = Route.useLoaderData()
  return (
    <Transition>
      <PageHeader title={m.changelog()}>
        <a
          href={localizeHref('/changelog/compare')}
          className="inline-flex items-center gap-3 border-b border-[var(--harbour-teal)] pb-1 text-base font-medium text-[var(--harbour-teal)]"
        >
          {m.releaseCompare()}{' '}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </PageHeader>
      {incomplete && (
        <PageProse role="alert" className="mb-8 text-sm">
          <p>
            {current || history.length
              ? m.changelogPartialError()
              : m.releaseLoadError()}
          </p>
          <a href={localizeHref('/changelog')}>{m.reload()}</a>
        </PageProse>
      )}
      {current && (
        <PageProse
          className="mb-12"
          lang={current.language}
          dangerouslySetInnerHTML={{ __html: current.html }}
        />
      )}
      {!!history.length && (
        <div className="grid items-start gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <ReleaseNavigation entries={history} />
          <ReleaseTimeline entries={history} />
        </div>
      )}
      <a
        href="https://github.com/poooi/poi/releases"
        className="mt-14 inline-block text-sm text-muted-foreground underline underline-offset-4"
      >
        {m.originalReleases()} ↗
      </a>
    </Transition>
  )
}
