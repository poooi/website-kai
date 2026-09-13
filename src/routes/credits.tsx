import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ArrowUpRight } from 'lucide-react'

import poiLogo from '~/assets/poi.svg?url'
import { PageHeader } from '~/components/page-header'
import { Transition } from '~/components/transition'
import {
  fetchCreditsManifest,
  type CreditsAvatar,
  type CreditsManifest,
} from '~/lib/credits-manifest.server'
import { specialThanks } from '~/lib/special-thanks'
import { m } from '~/paraglide/messages'

const contributionsUrl = 'https://github.com/poooi/poi#development'
const openCollectiveUrl = 'https://opencollective.com/poi'
const externalLinkClass = 'text-link inline-flex items-center gap-1'
const avatarClass = 'shrink-0 rounded-full bg-muted bg-no-repeat'
const placeholderClass =
  'inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-muted'
const sectionClass =
  'scroll-mt-[calc(var(--sticky-header-offset)+1.5rem)] border-t pt-8'
const nameGridClass =
  'mt-6 grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-x-6 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]'

const loadCredits = createServerFn({ method: 'GET' }).handler(() =>
  fetchCreditsManifest(),
)

export const Route = createFileRoute('/credits')({
  loader: () => loadCredits(),
  staleTime: 5 * 60 * 1000,
  head: () => ({ meta: [{ title: `poi | ${m.credits()}` }] }),
  component: CreditsPage,
})

function CreditsPage() {
  const { manifest, available } = Route.useLoaderData()
  return (
    <Transition>
      <PageHeader title={m.credits()} />

      <p
        data-credits-jump
        className="mb-10 flex flex-wrap gap-x-6 gap-y-2 text-sm"
      >
        <a className="text-link" href="#supporters">
          {m.supporters()}
        </a>
        <a className="text-link" href="#contributors">
          {m.contributors()}
        </a>
        <a className="text-link" href="#special-thanks">
          {m.specialThanks()}
        </a>
      </p>

      <section
        id="supporters"
        aria-labelledby="credits-supporters"
        className={sectionClass}
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
        {available && manifest ? (
          <ul className={nameGridClass}>
            {manifest.supporters.map((supporter) => (
              <li key={supporter.id} className="flex min-w-0 flex-col gap-2">
                <SpriteAvatar manifest={manifest} avatar={supporter.avatar} />
                {supporter.profile ? (
                  <a
                    className="text-link w-full text-sm leading-5 [overflow-wrap:anywhere]"
                    href={supporter.profile}
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

      <section
        id="contributors"
        aria-labelledby="credits-contributors"
        className={`mt-14 ${sectionClass}`}
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
        {available && manifest ? (
          <ul className={nameGridClass}>
            {manifest.contributors.map((contributor) => (
              <li key={contributor.id} className="flex min-w-0 flex-col gap-2">
                <SpriteAvatar manifest={manifest} avatar={contributor.avatar} />
                <a
                  className="text-link w-full text-sm leading-5 [overflow-wrap:anywhere]"
                  href={contributor.profile}
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
        id="special-thanks"
        aria-labelledby="credits-special-thanks"
        className={`mt-14 ${sectionClass}`}
      >
        <h2
          id="credits-special-thanks"
          className="text-2xl font-medium tracking-tight"
        >
          {m.specialThanks()}
        </h2>
        <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {specialThanks.map((entry) => (
            <li
              key={entry.name}
              className="flex items-start gap-4 border-t pt-4"
            >
              {entry.logo && (
                <span className={entry.logo.boxClassName} aria-hidden="true">
                  <img
                    src={entry.logo.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={entry.logo.imgClassName}
                  />
                </span>
              )}
              <div className="min-w-0">
                <a
                  className="text-link text-sm font-medium"
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {entry.name}
                </a>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {entry.description()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Transition>
  )
}

function SpriteAvatar({
  manifest,
  avatar,
}: {
  manifest: CreditsManifest
  avatar?: CreditsAvatar
}) {
  const size = manifest.displaySize
  const sheet = avatar ? manifest.sheets[avatar.sheet] : undefined
  if (!avatar || !sheet)
    return (
      <span
        aria-hidden="true"
        data-sprite-placeholder
        style={{ width: size, height: size }}
        className={placeholderClass}
      >
        <img
          src={poiLogo}
          alt=""
          className="h-10 w-10 object-contain opacity-70 grayscale dark:opacity-80"
        />
      </span>
    )

  const scale = manifest.pixelRatio
  return (
    <span
      aria-hidden="true"
      data-credits-sprite
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/api/credits-sprite/${sheet.url})`,
        backgroundPosition: `-${avatar.x / scale}px -${avatar.y / scale}px`,
        backgroundSize: `${sheet.width / scale}px ${sheet.height / scale}px`,
      }}
      className={avatarClass}
    />
  )
}
