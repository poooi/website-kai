import { compareVersions } from 'compare-versions'

export type ReleaseEntry = {
  version: string
  publishedAt: string | null
  language: string
  source: string
  reconstructed: boolean
  html: string
}

export const releaseYear = (entry: ReleaseEntry) =>
  entry.publishedAt?.slice(0, 4) ?? 'undated'

/** Upgrade notes cover (older, newer], regardless of selection order. */
export function releaseRange(
  entries: ReleaseEntry[],
  from: string,
  to: string,
) {
  if (
    !entries.some((e) => e.version === from) ||
    !entries.some((e) => e.version === to)
  )
    return { status: 'invalid' as const, entries: [], from, to }
  if (from === to) return { status: 'same' as const, entries: [], from, to }
  const [older, newer] = compareVersions(from, to) < 0 ? [from, to] : [to, from]
  return {
    status: 'ready' as const,
    from: older,
    to: newer,
    entries: entries
      .filter(
        (e) =>
          compareVersions(e.version, older) > 0 &&
          compareVersions(e.version, newer) <= 0,
      )
      .sort((a, b) => compareVersions(a.version, b.version)),
  }
}
