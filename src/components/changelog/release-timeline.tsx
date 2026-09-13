import { PageProse } from '~/components/page-prose'
import { type ReleaseEntry } from '~/lib/release-range'
import { m } from '~/paraglide/messages'
import { getLocale } from '~/paraglide/runtime'
import { ArrowUpRight } from 'lucide-react'

export function ReleaseTimeline({ entries }: { entries: ReleaseEntry[] }) {
  return (
    <div className="min-w-0 border-l border-navigation/30 pl-6 sm:pl-10">
      {entries.map((entry) => (
        <section
          key={entry.version}
          aria-labelledby={`release-${entry.version}`}
          className="relative scroll-mt-24 pb-14 last:pb-0 sm:pb-20"
        >
          <span
            aria-hidden="true"
            className="absolute top-3 -left-[29px] h-2 w-2 rounded-full bg-navigation sm:-left-[45px]"
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
              <a
                href={`https://github.com/poooi/poi/releases/tag/${entry.version}`}
                className="inline-flex items-center gap-2 hover:text-navigation"
              >
                POI {entry.version}
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </a>
            </h2>
            {entry.language === 'en-US' && getLocale() !== 'en' && (
              <p className="mt-3 text-xs text-muted-foreground" lang="en">
                English
              </p>
            )}
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
