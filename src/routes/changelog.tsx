import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Transition } from '~/components/transition'
import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'
import { fetchLocalizedChangelog } from '~/lib/changelog.server'
import { m } from '~/paraglide/messages'
import { getLocale, locales, localizeHref } from '~/paraglide/runtime'

const loadChangelog = createServerFn({ method: 'GET' })
  .validator(z.enum(locales))
  .handler(async ({ data: locale }) => {
    try {
      return await fetchLocalizedChangelog(locale, 'stable')
    } catch {
      return null
    }
  })

export const Route = createFileRoute('/changelog')({
  loader: () => loadChangelog({ data: getLocale() }),
  head: () => ({ meta: [{ title: `poi | ${m.changelog()}` }] }),
  component: ChangelogPage,
})

function ChangelogPage() {
  const changelog = Route.useLoaderData()
  return (
    <Transition>
      <PageHeader title={m.changelog()}>
        <a
          className="text-base text-[var(--harbour-teal)] underline underline-offset-4"
          href="https://github.com/poooi/poi/releases"
        >
          {m.originalReleases()} ↗
        </a>
      </PageHeader>
      {changelog ? (
        // Markdown is sanitized on the server before entering the route data.
        <PageProse
          lang={changelog.language}
          dangerouslySetInnerHTML={{ __html: changelog.html }}
        />
      ) : (
        <PageProse role="alert">
          <p>{m.releaseLoadError()}</p>
          <a href={localizeHref('/changelog')}>{m.reload()}</a>
        </PageProse>
      )}
    </Transition>
  )
}
