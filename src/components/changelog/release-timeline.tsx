import { PageProse } from '~/components/page-prose'
import { type ReleaseEntry } from '~/lib/release-range'
import { m } from '~/paraglide/messages'
import { getLocale } from '~/paraglide/runtime'

export function ReleaseTimeline({ entries }: { entries: ReleaseEntry[] }) {
  return (
    <div className="min-w-0 border-l border-[var(--harbour-teal)]/30 pl-6 sm:pl-10">
      {entries.map((entry) => (
        <section
          key={entry.version}
          aria-labelledby={`release-${entry.version}`}
          className="relative scroll-mt-24 pb-14 last:pb-0 sm:pb-20"
        >
          <span
            aria-hidden="true"
            className="absolute top-3 -left-[29px] h-2 w-2 rounded-full bg-[var(--harbour-teal)] sm:-left-[45px]"
          />
          <header className="mb-6 border-b pb-5">
            <p className="mb-2 font-mono text-xs tracking-wide text-muted-foreground">
              {entry.publishedAt ? (
                <time dateTime={entry.publishedAt}>
                  {entry.publishedAt.slice(0, 10)}
                </time>
              ) : (
                <span title={m.releaseMissingDate()}>{m.releaseUndated()}</span>
              )}
            </p>
            <h2
              id={`release-${entry.version}`}
              className="scroll-mt-24 font-mono text-2xl font-medium tracking-tight sm:text-3xl"
            >
              POI {entry.version}
            </h2>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <a
                className="underline underline-offset-4 hover:text-[var(--harbour-teal)]"
                href={entry.source}
              >
                {entry.reconstructed
                  ? m.reconstructedReleaseNotes()
                  : m.releaseNoteSource()}{' '}
                ↗
              </a>
              {entry.language === 'en-US' && getLocale() !== 'en' && (
                <span lang="en">English</span>
              )}
            </p>
          </header>
          <PageProse
            lang={entry.language}
            className="prose-h3:text-lg prose-li:my-1 prose-li:leading-7"
            dangerouslySetInnerHTML={{ __html: entry.html }}
          />
        </section>
      ))}
    </div>
  )
}
