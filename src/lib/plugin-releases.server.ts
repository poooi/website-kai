import { z } from 'zod'

import { catalogSchema, pluginCatalogUrl } from './plugin-catalog'
import {
  fetchWithTimeout,
  type FetchLike,
  UpstreamResponseError,
} from './fetch-poi-versions'
import { fetchCachedRelease } from './release-cache.server'

/** One stable KV key so the last good snapshot survives indefinitely. */
export const pluginReleasesKey = 'official-plugin-releases:v1'

export const pluginReleaseSchema = z.object({
  version: z.string().min(1),
  publishedAt: z.iso.datetime(),
})
export const pluginReleaseSnapshotSchema = z.record(
  z.string().regex(/^poi-plugin-[a-z0-9-]+$/),
  pluginReleaseSchema,
)

export type PluginRelease = z.infer<typeof pluginReleaseSchema>
export type PluginReleaseSnapshot = z.infer<typeof pluginReleaseSnapshotSchema>

/** Minimal KV surface so the refresh logic is unit-testable without bindings. */
export interface PluginReleaseStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

const registrySchema = z.object({
  'dist-tags': z.object({ latest: z.string().min(1) }),
  time: z.record(z.string(), z.string()),
})

/** Pick the npm `latest` tag and the publication time of that exact version. */
export function selectLatestRelease(
  registry: unknown,
): PluginRelease | undefined {
  const parsed = registrySchema.safeParse(registry)
  if (!parsed.success) return undefined
  const version = parsed.data['dist-tags'].latest
  const publishedAt = parsed.data.time[version]
  if (!publishedAt) return undefined
  const date = new Date(publishedAt)
  if (Number.isNaN(date.getTime())) return undefined
  return { version, publishedAt: date.toISOString() }
}

export function parsePluginReleaseSnapshot(
  text: string | null | undefined,
): PluginReleaseSnapshot {
  if (!text) return {}
  try {
    const parsed = pluginReleaseSnapshotSchema.safeParse(JSON.parse(text))
    return parsed.success ? parsed.data : {}
  } catch {
    return {}
  }
}

/** Read the stored snapshot once. Missing or unreadable data yields no releases. */
export async function readPluginReleases(
  store: PluginReleaseStore | undefined,
): Promise<PluginReleaseSnapshot> {
  if (!store) return {}
  try {
    return parsePluginReleaseSnapshot(await store.get(pluginReleasesKey))
  } catch {
    return {}
  }
}

export async function fetchPluginRelease(
  id: string,
  {
    fetcher = fetch,
    timeoutMs,
  }: { fetcher?: FetchLike; timeoutMs?: number } = {},
): Promise<PluginRelease | undefined> {
  try {
    const response = await fetchWithTimeout(
      fetcher,
      `https://registry.npmjs.org/${encodeURIComponent(id)}`,
      {},
      timeoutMs,
    )
    // Non-200 (including 429) is a per-package failure; never retry in a loop.
    if (!response.ok) return undefined
    return selectLatestRelease(await response.json())
  } catch {
    return undefined
  }
}

/**
 * Fetch the official catalog and refresh one compact snapshot. The previous
 * snapshot is read once and preserved per package on any npm failure; a catalog
 * failure leaves the snapshot untouched. Entries removed from the catalog are
 * dropped because the snapshot is rebuilt from the fetched catalog only.
 */
export async function refreshPluginReleases(
  store: PluginReleaseStore | undefined,
  {
    fetcher = fetch,
    concurrency = 3,
    timeoutMs,
  }: { fetcher?: FetchLike; concurrency?: number; timeoutMs?: number } = {},
): Promise<PluginReleaseSnapshot> {
  if (!store) return {}

  // Strict read: a failed or malformed prior snapshot aborts before any write,
  // so a partial refresh cannot clobber unknown good entries.
  const raw = await store.get(pluginReleasesKey)
  const previous: PluginReleaseSnapshot =
    raw === null ? {} : pluginReleaseSnapshotSchema.parse(JSON.parse(raw))

  // Catalog fetch/validation failures propagate and leave KV untouched.
  const response = await fetchCachedRelease(pluginCatalogUrl, {
    fetcher,
    timeoutMs,
    validate: (text) => {
      catalogSchema.parse(JSON.parse(text))
    },
  })
  if (!response.ok) throw new UpstreamResponseError(response.status)
  const catalog = catalogSchema.parse(await response.json())

  const ids = Object.keys(catalog)
  const fetched = new Map<string, PluginRelease>()
  const queue = [...ids]
  const workers = Math.max(1, Math.min(concurrency, ids.length || 1))
  let failed = 0

  await Promise.all(
    Array.from({ length: workers }, async () => {
      for (;;) {
        const id = queue.shift()
        if (!id) return
        const release = await fetchPluginRelease(id, { fetcher, timeoutMs })
        if (release) fetched.set(id, release)
        else {
          failed += 1
          if (previous[id]) fetched.set(id, previous[id])
        }
      }
    }),
  )

  const snapshot: PluginReleaseSnapshot = {}
  for (const id of ids) {
    const release = fetched.get(id)
    if (release) snapshot[id] = release
  }

  if (failed > 0) {
    console.warn(
      `[plugin-releases] npm refresh failed for ${failed}/${ids.length} packages; retaining previous entries where available`,
    )
  }

  // Write failures propagate so the scheduled run is not reported as success.
  await store.put(pluginReleasesKey, JSON.stringify(snapshot))

  return snapshot
}

const formatterLocales: Record<string, string> = {
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
}
const formatters = new Map<string, Intl.DateTimeFormat>()

/** Format a publication date explicitly in UTC so SSR and client agree. */
export function formatPluginReleaseDate(
  publishedAt: string,
  locale: string,
): string {
  const date = new Date(publishedAt)
  if (Number.isNaN(date.getTime())) return ''
  const tag = formatterLocales[locale] ?? locale
  let formatter = formatters.get(tag)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(tag, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    })
    formatters.set(tag, formatter)
  }
  return formatter.format(date)
}
