import { createServerOnlyFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { compare } from 'compare-versions'
import type { TFunction } from 'i18next'
import sanitize from 'rehype-sanitize'
import stringify from 'rehype-stringify'
import { remark } from 'remark'
import rehype from 'remark-rehype'

import { initTranslations } from '~/i18n'
import {
  fetchPoiVersions,
  poiVersionsSchema,
  type PoiVersions,
} from '~/lib/fetch-poi-versions'
import {
  defaultLocale,
  isSupportedLocale,
  type SupportedLocale,
} from '~/lib/i18n-routing'
import {
  detectRequestPlatform,
  getDownloadLink,
  OS,
  PlatformSpec,
  type RequestPlatformResult,
} from '~/lib/target'
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
    return poiVersionsSchema.parse(JSON.parse(fixture) as unknown)
  }

  return await fetchPoiVersions()
}

const buildCommonTranslations = (t: TFunction<'common'>) => ({
  betaHint: t('beta-hint'),
  description: t('description'),
  download: t('Download'),
  downloadOptions: t('Download options'),
  explore: t('Explore'),
  httpsUpdateSupported: t('HTTPS game update supported!'),
  language: t('language'),
  mobileHint: t('mobile-hint'),
  name: t('name'),
  newLabel: t('New'),
  nightlyBuilds: t('Nightly builds'),
  oldVersions: t('Old versions'),
  operatingSystem: t('Operating system'),
  options: t('Options'),
  others: t('Others'),
  platformLabel: t('Platform'),
  sightedBySkilledLookouts: t('Sighted by skilled lookouts:'),
  sourceCode: t('Source code'),
  stableHint: t('stable-hint'),
  title: t('KanColle Browser'),
})

const buildPlatformLabels = (t: TFunction<'common'>) => ({
  os: Object.fromEntries(Object.values(OS).map((os) => [os, t(os)])) as Record<
    OS,
    string
  >,
  spec: Object.fromEntries(
    Object.values(PlatformSpec).map((spec) => [spec, t(spec)]),
  ) as Record<PlatformSpec, string>,
})

const buildDownloadData = (
  t: TFunction<'common'>,
  poiVersions: PoiVersions,
  platform: RequestPlatformResult,
) => ({
  betaDownloadLabel: t('download', { version: poiVersions.betaVersion }),
  betaUrl: getDownloadLink(poiVersions.betaVersion, platform.target),
  platform,
  platformLabels: buildPlatformLabels(t),
  poiVersions,
  showBeta: compare(poiVersions.version, poiVersions.betaVersion, '<'),
  stableDownloadLabel: t('download', { version: poiVersions.version }),
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

export const loadCommonTranslations = async (
  locale: string = defaultLocale,
) => {
  const supportedLocale = requireSupportedLocale(locale)
  const { t } = await initTranslations(supportedLocale, ['common'])
  return buildCommonTranslations(t)
}

export const loadRequestAwarePageData = async (
  locale: string = defaultLocale,
  context?: RequestAwareContext,
) => {
  const supportedLocale = requireSupportedLocale(locale)
  const serverContext = normalizeServerContext(context)
  const headers = serverContext?.requestHeaders
    ? new Headers(serverContext.requestHeaders)
    : getCurrentRequestHeaders()
  const [{ t }, poiVersions, platform] = await Promise.all([
    initTranslations(supportedLocale, ['common']),
    loadPoiVersions(serverContext?.env),
    detectRequestPlatform(headers),
  ])

  return {
    ...buildCommonTranslations(t),
    ...buildDownloadData(t, poiVersions, platform),
  }
}

export const loadExploreHtml = async (locale: string = defaultLocale) => {
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
