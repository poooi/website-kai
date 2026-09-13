import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ArrowUpRight } from 'lucide-react'

import { PageHeader } from '~/components/page-header'
import { Transition } from '~/components/transition'
import { fetchContributors, fetchSupporters } from '~/lib/contributors.server'
import { m } from '~/paraglide/messages'

const contributionsUrl = 'https://github.com/poooi/poi#development'
const openCollectiveUrl = 'https://opencollective.com/poi'
const externalLinkClass = 'text-link inline-flex items-center gap-1'
const avatarClass = 'h-12 w-12 rounded-full bg-muted object-cover'

const loadCredits = createServerFn({ method: 'GET' }).handler(async () => {
  const [contributors, supporters] = await Promise.all([
    fetchContributors(),
    fetchSupporters(),
  ])
  return { contributors, supporters }
})

export const Route = createFileRoute('/credits')({
  loader: () => loadCredits(),
  staleTime: 5 * 60 * 1000,
  head: () => ({ meta: [{ title: `poi | ${m.credits()}` }] }),
  component: CreditsPage,
})

function CreditsPage() {
  const { contributors, supporters } = Route.useLoaderData()
  return (
    <Transition>
      <PageHeader title={m.credits()} />

      <p className="mb-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a className="text-link" href="#contributors">
          {m.contributors()}
        </a>
        <a className="text-link" href="#supporters">
          {m.supporters()}
        </a>
      </p>

      <section
        id="contributors"
        aria-labelledby="credits-contributors"
        className="scroll-mt-[calc(var(--sticky-header-offset)+1.5rem)] border-t pt-8"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2
            id="credits-contributors"
            className="text-2xl font-medium tracking-tight"
          >
            {m.contributors()}
          </h2>
          <a
            className={externalLinkClass}
            href={contributionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {m.creditsContribute()}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-7">
          {m.contributorsThanks()}
        </p>
        {contributors.available ? (
          <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-x-6 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]">
            {contributors.contributors.map((contributor) => (
              <li
                key={contributor.login}
                className="flex min-w-0 flex-col gap-2"
              >
                <img
                  src={contributor.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className={avatarClass}
                />
                <a
                  className="text-link w-full text-sm leading-5 [overflow-wrap:anywhere]"
                  href={contributor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contributor.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="mt-6 text-sm text-muted-foreground">
            {m.creditsContributorsUnavailable()}
          </p>
        )}
      </section>

      <section
        id="supporters"
        aria-labelledby="credits-supporters"
        className="mt-14 scroll-mt-[calc(var(--sticky-header-offset)+1.5rem)] border-t pt-8"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2
            id="credits-supporters"
            className="text-2xl font-medium tracking-tight"
          >
            {m.supporters()}
          </h2>
          <a
            className={externalLinkClass}
            href={openCollectiveUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {m.creditsSupport()}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-7">
          {m.supportersThanks()}
        </p>
        {supporters.available ? (
          <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-x-6 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]">
            {supporters.supporters.map((supporter) => (
              <li key={supporter.id} className="flex min-w-0 flex-col gap-2">
                {supporter.avatarUrl ? (
                  <img
                    src={supporter.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    className={avatarClass}
                  />
                ) : (
                  <span aria-hidden="true" className={avatarClass} />
                )}
                {supporter.profileUrl ? (
                  <a
                    className="text-link w-full text-sm leading-5 [overflow-wrap:anywhere]"
                    href={supporter.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {supporter.name || m.creditsAnonymousSupporter()}
                  </a>
                ) : (
                  <span className="w-full text-sm leading-5 [overflow-wrap:anywhere]">
                    {supporter.name || m.creditsAnonymousSupporter()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            {m.creditsSupportersUnavailable()}
          </p>
        )}
      </section>
    </Transition>
  )
}
