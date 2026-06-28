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
import {
  detectRequestPlatform,
  getDownloadLink,
  OS,
  PlatformSpec,
  type RequestPlatformResult,
} from '~/lib/target'
import { m } from '~/paraglide/messages'
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

const buildCommonTranslations = (locale: SupportedLocale) => ({
  betaHint: m.betaHint({}, { locale }),
  description: m.description({}, { locale }),
  download: m.download({}, { locale }),
  downloadOptions: m.downloadOptions({}, { locale }),
  explore: m.explore({}, { locale }),
  httpsUpdateSupported: m.httpsUpdateSupported({}, { locale }),
  language: m.language({}, { locale }),
  mobileHint: m.mobileHint({}, { locale }),
  name: m.name({}, { locale }),
  newLabel: m.newLabel({}, { locale }),
  nightlyBuilds: m.nightlyBuilds({}, { locale }),
  oldVersions: m.oldVersions({}, { locale }),
  operatingSystem: m.operatingSystem({}, { locale }),
  options: m.options({}, { locale }),
  others: m.others({}, { locale }),
  platformLabel: m.platform({}, { locale }),
  sightedBySkilledLookouts: m.sightedBySkilledLookouts({}, { locale }),
  sourceCode: m.sourceCode({}, { locale }),
  stableHint: m.stableHint({}, { locale }),
  title: m.kanColleBrowser({}, { locale }),
})

const buildPlatformLabels = (locale: SupportedLocale) => ({
  os: {
    [OS.windows]: m.windows({}, { locale }),
    [OS.macos]: m.macos({}, { locale }),
    [OS.linux]: m.linux({}, { locale }),
  },
  spec: {
    [PlatformSpec.X64Setup]: m.x64Setup({}, { locale }),
    [PlatformSpec.X64Portable]: m.x64Portable({}, { locale }),
    [PlatformSpec.IA32Setup]: m.ia32Setup({}, { locale }),
    [PlatformSpec.IA32Portable]: m.ia32Portable({}, { locale }),
    [PlatformSpec.ARM]: m.arm({}, { locale }),
    [PlatformSpec.X64DEB]: m.x64DEB({}, { locale }),
    [PlatformSpec.X64RPM]: m.x64RPM({}, { locale }),
    [PlatformSpec.ARMDEB]: m.armDEB({}, { locale }),
    [PlatformSpec.ARMPortable]: m.armPortable({}, { locale }),
  },
})

const buildDownloadData = (
  locale: SupportedLocale,
  poiVersions: PoiVersions,
  platform: RequestPlatformResult,
) => ({
  betaDownloadLabel: m.downloadWithVersion(
    { version: poiVersions.betaVersion },
    { locale },
  ),
  betaUrl: getDownloadLink(poiVersions.betaVersion, platform.target),
  platform,
  platformLabels: buildPlatformLabels(locale),
  poiVersions,
  showBeta: compare(poiVersions.version, poiVersions.betaVersion, '<'),
  stableDownloadLabel: m.downloadWithVersion(
    { version: poiVersions.version },
    { locale },
  ),
  stableUrl: getDownloadLink(poiVersions.version, platform.target),
})

export const requireSupportedLocale = (locale: string): SupportedLocale => {
  if (!isSupportedLocale(locale)) {
    // TanStack route loaders consume thrown Responses for HTTP status control.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response('', { status: 404 })
  }

  return locale
}

export const loadCommonTranslations = async (locale: string = getLocale()) => {
  const supportedLocale = requireSupportedLocale(locale)
  return buildCommonTranslations(supportedLocale)
}

export const loadRequestAwarePageData = async (
  locale: string = getLocale(),
  context?: RequestAwareContext,
) => {
  const supportedLocale = requireSupportedLocale(locale)
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

  return {
    ...buildCommonTranslations(supportedLocale),
    ...buildDownloadData(supportedLocale, poiVersions, platform),
  }
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
