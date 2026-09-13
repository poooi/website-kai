import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ReleaseTimeline } from '~/components/changelog/release-timeline'
import { PageHeader } from '~/components/page-header'
import { Transition } from '~/components/transition'
import { fetchChangelogPage } from '~/lib/release-history.server'
import { releaseRange } from '~/lib/release-range'
import { m } from '~/paraglide/messages'
import { getLocale, locales, localizeHref } from '~/paraglide/runtime'

const loadComparison = createServerFn({ method: 'GET' })
  .validator(z.enum(locales))
  .handler(async ({ data }) => fetchChangelogPage(data))

export const Route = createFileRoute('/changelog_/compare')({
  validateSearch: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
  loaderDeps: () => ({ locale: getLocale() }),
  loader: ({ deps }) => loadComparison({ data: deps.locale }),
  staleTime: 5 * 60 * 1000,
  head: () => ({ meta: [{ title: `poi | ${m.releaseCompare()}` }] }),
  component: ComparePage,
})

function ComparePage() {
  const { history, incomplete, archiveAvailable } = Route.useLoaderData()
  const search = Route.useSearch()
  const from = search.from ?? history[1]?.version ?? history[0]?.version ?? ''
  const to = search.to ?? history[0]?.version ?? ''
  const range = releaseRange(history, from, to)
  const selectClass =
    'mt-2 block w-full rounded-none border border-[var(--harbour-teal)]/40 bg-background px-3 py-3 font-mono text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--harbour-teal)]'
  return (
    <Transition>
      <a
        href={localizeHref('/changelog')}
        className="mb-7 inline-block text-sm text-muted-foreground underline underline-offset-4"
      >
        ← {m.releaseBack()}
      </a>
      <PageHeader title={m.releaseCompare()} />
      <form
        method="get"
        action={localizeHref('/changelog/compare')}
        className="mb-12 border-y border-[var(--harbour-teal)]/30 py-7"
      >
        <div className="grid items-end gap-5 sm:grid-cols-[1fr_1fr_auto]">
          {(
            [
              ['from', from, m.releaseFrom()],
              ['to', to, m.releaseTo()],
            ] as const
          ).map(([name, value, label]) => (
            <label key={name} className="min-w-0 text-sm font-medium">
              {label}
              <select
                key={`${name}-${value}`}
                name={name}
                defaultValue={value}
                className={selectClass}
                disabled={!archiveAvailable}
              >
                {!history.some((e) => e.version === value) && (
                  <option value={value}>{value || '—'}</option>
                )}
                {history.map((entry) => (
                  <option key={entry.version} value={entry.version}>
                    {entry.version}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="submit"
            disabled={!archiveAvailable}
            className="border border-[var(--harbour-teal)] bg-[var(--harbour-teal)] px-5 py-3 font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-40 motion-reduce:transition-none"
          >
            {m.releaseCompareAction()}
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {m.releaseRangeHint()}
        </p>
      </form>
      {!archiveAvailable ? (
        <p role="alert">
          {m.releaseRangeUnavailable()}{' '}
          <a href={localizeHref('/changelog/compare')} className="underline">
            {m.reload()}
          </a>
        </p>
      ) : (
        <>
          {incomplete && (
            <p role="alert" className="mb-6 text-sm text-muted-foreground">
              {m.changelogPartialError()}
            </p>
          )}
          {range.status === 'invalid' ? (
            <p role="alert">{m.releaseInvalid()}</p>
          ) : range.status === 'same' ? (
            <p role="status">{m.releaseSame()}</p>
          ) : (
            <>
              <div
                className="mb-10 flex flex-wrap items-baseline justify-between gap-3 border-b pb-5"
                role="status"
              >
                <p className="font-mono text-xl tracking-tight sm:text-2xl">
                  {range.from} → {range.to}
                </p>
                <p className="text-sm text-muted-foreground">
                  {m.releaseCount({ count: range.entries.length })}
                </p>
              </div>
              <ReleaseTimeline entries={range.entries} />
            </>
          )}
        </>
      )}
    </Transition>
  )
}
