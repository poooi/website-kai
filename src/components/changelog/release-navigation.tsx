import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { type ReleaseEntry, releaseYear } from '~/lib/release-range'
import { m } from '~/paraglide/messages'

export function ReleaseNavigation({ entries }: { entries: ReleaseEntry[] }) {
  const groups = new Map<string, ReleaseEntry[]>()
  for (const entry of entries) {
    const year = releaseYear(entry)
    groups.set(year, [...(groups.get(year) ?? []), entry])
  }
  const [active, setActive] = useState(entries[0]?.version)
  const [expanded, setExpanded] = useState<string>()
  const activeRef = useRef<string>(undefined)

  useEffect(() => {
    const headings = entries.map((entry) => ({
      entry,
      element: document.getElementById(`release-${entry.version}`),
    }))
    let frame = 0
    const sync = () => {
      frame = 0
      let current = headings[0]?.entry
      for (const { entry, element } of headings) {
        if (element && element.getBoundingClientRect().top <= 128)
          current = entry
      }
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      )
        current = headings.at(-1)?.entry
      if (current && current.version !== activeRef.current) {
        activeRef.current = current.version
        setActive(current.version)
        setExpanded(releaseYear(current))
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync)
    }
    sync()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [entries])

  const navigation = (id: string) => (
    <nav aria-label={m.releaseVersions()}>
      {[...groups].map(([year, releases]) => (
        <details
          key={year}
          name={`release-years-${id}`}
          open={expanded === year}
          className="group border-b border-[var(--harbour-teal)]/15"
        >
          <summary
            onClick={(event) => {
              event.preventDefault()
              setExpanded(expanded === year ? undefined : year)
            }}
            className="flex cursor-pointer list-none items-center gap-3 py-2 text-sm [&::-webkit-details-marker]:hidden"
          >
            <span className="font-mono">
              {year === 'undated' ? m.releaseUndated() : year}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {releases.length}
            </span>
            <ChevronDown
              className="h-3 w-3 text-muted-foreground group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <ul className="grid grid-cols-3 gap-1 pb-3">
            {releases.map((entry) => (
              <li key={entry.version}>
                <a
                  href={`#release-${entry.version}`}
                  aria-current={
                    entry.version === active ? 'location' : undefined
                  }
                  onClick={(event) => {
                    event.currentTarget
                      .closest('details[data-mobile-directory]')
                      ?.removeAttribute('open')
                  }}
                  className="block border-l-2 border-transparent py-1 pl-2 font-mono text-xs text-muted-foreground hover:text-[var(--harbour-teal)] aria-[current=location]:border-[var(--harbour-teal)] aria-[current=location]:bg-[var(--harbour-teal)]/10 aria-[current=location]:text-[var(--harbour-teal)]"
                >
                  {entry.version}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </nav>
  )
  return (
    <aside className="min-w-0 lg:sticky lg:top-6">
      <div className="hidden lg:block">
        <h2 className="mb-4 text-xs text-muted-foreground">
          {m.releaseVersions()}
        </h2>
        {navigation('desktop')}
      </div>
      <details data-mobile-directory className="border-y py-3 lg:hidden">
        <summary className="cursor-pointer text-sm">
          {m.releaseVersions()}
        </summary>
        <div className="mt-3">{navigation('mobile')}</div>
      </details>
    </aside>
  )
}
