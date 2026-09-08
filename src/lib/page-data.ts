import {
  createIsomorphicFn,
  createServerFn,
  createServerOnlyFn,
} from '@tanstack/react-start'
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
import {
  detectRequestPlatform,
  getDownloadLink,
  type RequestPlatformResult,
  Target,
} from '~/lib/target'
import { getLocale } from '~/paraglide/runtime'

const exploreContentByLocale = import.meta.glob<string>(
  '../contents/explore/*.md',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const exploreHtmlByLocale = new Map<SupportedLocale, string>()

// Upstream no longer supports 32-bit Windows.
const supportedTargets = Object.values(Target).filter(
  (target) => target !== Target.win32 && target !== Target.win32Setup,
)

const getCurrentRequestHeaders = createServerOnlyFn(
  () => new Headers(getRequestHeaders()),
)

const loadPoiVersions = async () => {
  const fixture = process.env.TANSTACK_TEST_POI_VERSIONS
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

const loadPoiVersionsFromServer = createServerFn({ method: 'GET' }).handler(
  async () => loadPoiVersions(),
)

const loadPoiVersionsForRequest = createIsomorphicFn()
  .server(() => loadPoiVersions())
  .client(() => loadPoiVersionsFromServer())

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

export const loadRequestAwarePageData = async () => {
  const headers =
    typeof document === 'undefined' ? getCurrentRequestHeaders() : new Headers()
  const [poiVersions, platform] = await Promise.all([
    loadPoiVersionsForRequest(),
    detectRequestPlatform(headers),
  ])

  return buildDownloadData(
    poiVersions,
    platform,
    supportedTargets,
    supportedTargets,
  )
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
