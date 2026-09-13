import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ReleaseTimeline } from '~/components/changelog/release-timeline'
import { PageHeader } from '~/components/page-header'
import { Transition } from '~/components/transition'
import { Button } from '~/components/ui/button'
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
  const selectClass = 'field-control mt-2 block w-full font-mono'
  return (
    <Transition>
      <a
        href={localizeHref('/changelog')}
        className="text-link mb-7 inline-block text-sm"
      >
        ← {m.releaseBack()}
      </a>
      <PageHeader title={m.releaseCompare()} />
      <form
        method="get"
        action={localizeHref('/changelog/compare')}
        className="mb-12 border-b pb-7"
      >
        <div className="grid items-end gap-5 sm:grid-cols-[1fr_1fr_auto]">
          {(
            [
              ['from', from, m.releaseFrom()],
              ['to', to, m.releaseTo()],
            ] as const
          ).map(([name, value, label]) => (
            <label key={name} className="field-label min-w-0">
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
          <Button type="submit" size="lg" disabled={!archiveAvailable}>
            {m.releaseCompareAction()}
          </Button>
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
