import sanitize from 'rehype-sanitize'
import stringify from 'rehype-stringify'
import { remark } from 'remark'
import rehype from 'remark-rehype'

import { catalogSchema, pluginCatalogUrl } from './plugin-catalog'
import { type FetchLike, UpstreamResponseError } from './fetch-poi-versions'
import {
  formatPluginReleaseDate,
  type PluginReleaseSnapshot,
} from './plugin-releases.server'
import { fetchCachedRelease } from './release-cache.server'

export { catalogSchema, pluginCatalogUrl }

const languages: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ja: 'ja-JP',
  ko: 'ko-KR',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
}

export async function fetchPlugins(
  locale: string,
  {
    fetcher = fetch,
    releases = {},
  }: { fetcher?: FetchLike; releases?: PluginReleaseSnapshot } = {},
) {
  try {
    let payload: unknown
    const fixture = process.env.TANSTACK_TEST_PLUGINS
    if (fixture && fetcher === fetch) {
      payload = JSON.parse(fixture)
    } else {
      const response = await fetchCachedRelease(pluginCatalogUrl, {
        fetcher,
        validate: (text) => {
          catalogSchema.parse(JSON.parse(text))
        },
      })
      if (!response.ok) throw new UpstreamResponseError(response.status)
      payload = await response.json()
    }
    const catalog = catalogSchema.parse(payload)
    const processor = remark().use(rehype).use(sanitize).use(stringify)
    const language = languages[locale] ?? 'en-US'
    const plugins = await Promise.all(
      Object.entries(catalog).map(async ([id, plugin]) => {
        const nameLanguage = plugin.name[language] ? language : 'en-US'
        const descriptionLanguage = plugin.description[language]
          ? language
          : 'en-US'
        const description = plugin.description[descriptionLanguage]
        const release = releases[id]
        return {
          id,
          name: plugin.name[nameLanguage],
          nameLanguage,
          descriptionLanguage,
          html: (await processor.process(description)).toString(),
          author: plugin.author,
          authorUrl: plugin.link,
          icon: plugin.icon,
          url: `https://www.npmjs.com/package/${id}`,
          release: release
            ? {
                version: release.version,
                publishedAt: release.publishedAt,
                date: formatPluginReleaseDate(release.publishedAt, locale),
              }
            : undefined,
          searchText: [
            id,
            ...Object.values(plugin.name),
            description,
            plugin.author,
          ]
            .join(' ')
            .toLowerCase(),
        }
      }),
    )
    return { plugins, available: true }
  } catch {
    return { plugins: [], available: false }
  }
}
