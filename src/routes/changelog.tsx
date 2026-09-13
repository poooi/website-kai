import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ArrowRight } from 'lucide-react'
import { z } from 'zod'
import { ReleaseTimeline } from '~/components/changelog/release-timeline'
import { Transition } from '~/components/transition'
import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'
import { fetchChangelogPage } from '~/lib/release-history.server'
import { releaseYear } from '~/lib/release-range'
import { m } from '~/paraglide/messages'
import { getLocale, locales, localizeHref } from '~/paraglide/runtime'

const loadChangelog = createServerFn({ method: 'GET' })
  .validator(z.enum(locales))
  .handler(async ({ data: locale }) => fetchChangelogPage(locale))

export const Route = createFileRoute('/changelog')({
  validateSearch: z.object({
    year: z
      .union([z.number().int().min(1000).max(9999), z.enum(['all', 'undated'])])
      .optional()
      .catch(undefined),
  }),
  loaderDeps: () => ({ locale: getLocale() }),
  loader: ({ deps }) => loadChangelog({ data: deps.locale }),
  staleTime: 5 * 60 * 1000,
  head: () => ({ meta: [{ title: `poi | ${m.changelog()}` }] }),
  component: ChangelogPage,
})

function ChangelogPage() {
  const { current, history, incomplete } = Route.useLoaderData()
  const search = Route.useSearch()
  const counts = new Map<string, number>()
  for (const entry of history) {
    const year = releaseYear(entry)
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  const years = [...counts.keys()].sort((a, b) =>
    a === 'undated' ? 1 : b === 'undated' ? -1 : b.localeCompare(a),
  )
  const selectedYear = String(search.year ?? years[0] ?? 'all')
  const visible =
    selectedYear === 'all'
      ? history
      : history.filter((e) => releaseYear(e) === selectedYear)
  const href = (year: string) => `${localizeHref('/changelog')}?year=${year}`
  return (
    <Transition>
      <PageHeader title={m.changelog()}>
        <p>{m.releaseHistoryIntro()}</p>
        <a
          href={localizeHref('/changelog/compare')}
          className="mt-5 inline-flex items-center gap-3 border-b border-[var(--harbour-teal)] pb-1 text-base font-medium text-[var(--harbour-teal)]"
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
          <a href={`${localizeHref('/changelog')}?year=${selectedYear}`}>
            {m.reload()}
          </a>
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
        <>
          <nav
            aria-label={m.releaseYears()}
            className="mb-10 flex gap-1 overflow-x-auto border-b pb-3"
          >
            {['all', ...years].map((year) => (
              <a
                key={year}
                href={href(year)}
                aria-current={year === selectedYear ? 'page' : undefined}
                className="group flex min-w-20 shrink-0 flex-col gap-2 border-t-2 border-transparent px-4 py-3 text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-[var(--harbour-teal)] aria-[current=page]:text-[var(--harbour-teal)] motion-reduce:transition-none"
              >
                <span
                  className={
                    year === 'all' || year === 'undated'
                      ? 'text-sm font-medium'
                      : 'font-mono text-lg'
                  }
                >
                  {year === 'all'
                    ? m.releaseAll()
                    : year === 'undated'
                      ? m.releaseUndated()
                      : year}
                </span>
                <span className="text-xs">
                  {m.releaseCount({
                    count: year === 'all' ? history.length : counts.get(year)!,
                  })}
                </span>
              </a>
            ))}
          </nav>
          <div className="grid items-start gap-10 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-14">
            <aside className="min-w-0 lg:sticky lg:top-8">
              <nav aria-label={m.releaseVersions()}>
                <h2 className="mb-4 text-xs font-medium tracking-wide text-muted-foreground">
                  {m.releaseVersions()}
                </h2>
                <ul className="flex max-h-72 flex-wrap gap-x-5 gap-y-2 overflow-y-auto lg:max-h-[70vh] lg:flex-col lg:flex-nowrap">
                  {visible.map((entry) => (
                    <li key={entry.version}>
                      <a
                        href={`#release-${entry.version}`}
                        className="inline-block py-1 font-mono text-sm text-muted-foreground hover:text-[var(--harbour-teal)]"
                      >
                        {entry.version}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
            {visible.length ? (
              <ReleaseTimeline entries={visible} />
            ) : (
              <p>
                {m.releaseEmpty()}{' '}
                <a className="underline" href={href('all')}>
                  {m.releaseClear()}
                </a>
              </p>
            )}
          </div>
        </>
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
