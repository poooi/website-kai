import { compareVersions } from 'compare-versions'
import sanitize from 'rehype-sanitize'
import stringify from 'rehype-stringify'
import { remark } from 'remark'
import rehype from 'remark-rehype'
import { z } from 'zod'

import { changelogLanguageCandidates } from './changelog'
import { fetchCachedRelease } from './release-cache.server'
import { type FetchLike, UpstreamResponseError } from './fetch-poi-versions'

export const releaseHistoryUrl =
  'https://raw.githubusercontent.com/poooi/poi-release/main/history/stable.json'

const noteSchema = z.object({
  markdown: z.string().min(1),
  source: z
    .url()
    .refine(
      (url) =>
        url.startsWith('https://github.com/poooi/') ||
        /^https:\/\/m\.weibo\.cn\/detail\/\d+$/.test(url),
      'Unsupported release note source',
    ),
  // Retained for archival purposes; only main application markdown is rendered.
  pluginMarkdown: z.string().optional(),
  reconstructed: z.boolean(),
})
export const releaseHistorySchema = z
  .array(
    z.object({
      version: z.string().regex(/^v\d+\.\d+\.\d+$/),
      publishedAt: z.iso.datetime().nullable(),
      notes: z.object({
        'en-US': noteSchema,
        'ja-JP': noteSchema.optional(),
        'zh-CN': noteSchema.optional(),
        'zh-TW': noteSchema.optional(),
      }),
    }),
  )
  .refine(
    (entries) =>
      new Set(entries.map((entry) => entry.version)).size === entries.length,
    'Duplicate release version',
  )

type FetchOptions = {
  fetcher?: FetchLike
  timeoutMs?: number
  signal?: AbortSignal
}

export async function fetchReleaseHistory(
  locale: string,
  { fetcher = fetch, timeoutMs, signal }: FetchOptions = {},
) {
  let payload: unknown
  const fixture = process.env.TANSTACK_TEST_RELEASE_HISTORY
  if (fixture && fetcher === fetch) {
    payload = JSON.parse(fixture)
  } else {
    const response = await fetchCachedRelease(releaseHistoryUrl, {
      fetcher,
      signal,
      timeoutMs,
      validate: (text) => {
        releaseHistorySchema.parse(JSON.parse(text))
      },
    })
    if (!response.ok) throw new UpstreamResponseError(response.status)
    payload = await response.json()
  }
  const history = releaseHistorySchema.parse(payload)
  const processor = remark().use(rehype).use(sanitize).use(stringify)
  return Promise.all(
    history
      .sort((a, b) => compareVersions(b.version, a.version))
      .map(async (entry) => {
        const notes: Record<string, z.infer<typeof noteSchema> | undefined> =
          entry.notes
        const language = changelogLanguageCandidates(locale).find(
          (candidate) => notes[candidate],
        )!
        const note = notes[language]!
        const tree = processor.parse(note.markdown)
        // The page owns h1 and version h2 headings. Preserve hierarchy within each note.
        const headings = tree.children.filter((node) => node.type === 'heading')
        const offset = Math.max(
          0,
          3 - Math.min(...headings.map((node) => node.depth)),
        )
        for (const heading of headings)
          heading.depth = Math.min(
            6,
            heading.depth + offset,
          ) as typeof heading.depth
        const html = processor.stringify(await processor.run(tree))
        return {
          version: entry.version,
          publishedAt: entry.publishedAt,
          language,
          source: note.source,
          reconstructed: note.reconstructed,
          html,
        }
      }),
  )
}

export async function fetchChangelogPage(
  locale: string,
  options: FetchOptions = {},
) {
  try {
    return {
      history: await fetchReleaseHistory(locale, options),
      available: true,
    }
  } catch {
    return { history: [], available: false }
  }
}
