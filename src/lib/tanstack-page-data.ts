import { createServerOnlyFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { compare } from 'compare-versions'
import sanitize from 'rehype-sanitize'
import stringify from 'rehype-stringify'
import { remark } from 'remark'
import rehype from 'remark-rehype'

import {
  fetchPoiVersions,
  poiVersionsSchema,
  type PoiVersions,
} from '~/lib/fetch-poi-versions'
import { isSupportedLocale, type SupportedLocale } from '~/lib/i18n-routing'
import { fetchReleaseTargets } from '~/lib/release-targets'
import {
  detectRequestPlatform,
  getDownloadLink,
  type RequestPlatformResult,
  type Target,
} from '~/lib/target'
import { getLocale } from '~/paraglide/runtime'
import { type TanStackRouterContext } from '~/routes/__root'

const exploreContentByLocale = import.meta.glob<string>(
  '../contents/explore/*.md',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const exploreHtmlByLocale = new Map<SupportedLocale, string>()

type ServerContext = NonNullable<TanStackRouterContext['serverContext']>
type RequestAwareContext = ServerContext | TanStackRouterContext

const getCurrentRequestHeaders = createServerOnlyFn(
  () => new Headers(getRequestHeaders()),
)

const normalizeServerContext = (
  context?: RequestAwareContext,
): ServerContext | undefined => {
  return context && 'serverContext' in context && context.serverContext
    ? context.serverContext
    : context
}

const loadPoiVersions = async (env?: ServerContext['env']) => {
  const fixture =
    env?.TANSTACK_TEST_POI_VERSIONS ?? process.env.TANSTACK_TEST_POI_VERSIONS
  if (fixture) {
    try {
      return poiVersionsSchema.parse(JSON.parse(fixture) as unknown)
    } catch (error) {
      throw new Error('Invalid TANSTACK_TEST_POI_VERSIONS fixture JSON', {
        cause: error,
      })
    }
  }

  return await fetchPoiVersions()
}

const buildDownloadData = (
  poiVersions: PoiVersions,
  platform: RequestPlatformResult,
  stableTargets: Target[],
  betaTargets: Target[],
) => ({
  betaUrl: betaTargets.includes(platform.target)
    ? getDownloadLink(poiVersions.betaVersion, platform.target)
    : 'https://github.com/poooi/poi/releases',
  stableTargets,
  betaTargets,
  platform,
  poiVersions,
  showBeta: compare(poiVersions.version, poiVersions.betaVersion, '<'),
  stableUrl: stableTargets.includes(platform.target)
    ? getDownloadLink(poiVersions.version, platform.target)
    : 'https://github.com/poooi/poi/releases',
})

export const requireSupportedLocale = (locale: string): SupportedLocale => {
  if (!isSupportedLocale(locale)) {
    // TanStack route loaders consume thrown Responses for HTTP status control.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response('', { status: 404 })
  }

  return locale
}

export const loadRequestAwarePageData = async (
  context?: RequestAwareContext,
) => {
  const serverContext = normalizeServerContext(context)
  const headers = serverContext?.requestHeaders
    ? new Headers(serverContext.requestHeaders)
    : typeof document === 'undefined'
      ? getCurrentRequestHeaders()
      : new Headers()
  const [poiVersions, platform] = await Promise.all([
    loadPoiVersions(serverContext?.env),
    detectRequestPlatform(headers),
  ])

  const [stableTargets, betaTargets] = await Promise.all([
    fetchReleaseTargets(poiVersions.version),
    compare(poiVersions.version, poiVersions.betaVersion, '<')
      ? fetchReleaseTargets(poiVersions.betaVersion)
      : Promise.resolve([]),
  ])
  return buildDownloadData(poiVersions, platform, stableTargets, betaTargets)
}

export const loadExploreHtml = async (locale: string = getLocale()) => {
  const supportedLocale = requireSupportedLocale(locale)
  const cachedHtml = exploreHtmlByLocale.get(supportedLocale)
  if (cachedHtml !== undefined) {
    return cachedHtml
  }

  const content =
    exploreContentByLocale[`../contents/explore/${supportedLocale}.md`]
  if (!content) {
    // TanStack route loaders consume thrown Responses for HTTP status control.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response('', { status: 404 })
  }

  const html = (
    await remark().use(rehype).use(sanitize).use(stringify).process(content)
  ).toString()
  exploreHtmlByLocale.set(supportedLocale, html)
  return html
}
