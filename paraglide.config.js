// @ts-check

/** @typedef {import('@inlang/paraglide-js').CompilerOptions} CompilerOptions */

const locales = /** @type {const} */ ([
  'en',
  'fr',
  'ja',
  'ko',
  'zh-Hans',
  'zh-Hant',
])

const localizedRootPaths =
  /** @type {NonNullable<CompilerOptions['urlPatterns']>[number]['localized']} */ (
    locales.map((locale) => [locale, locale === 'ja' ? '/' : `/${locale}`])
  )
const localizedCatchAllPaths =
  /** @type {NonNullable<CompilerOptions['urlPatterns']>[number]['localized']} */ (
    locales.map((locale) => [
      locale,
      locale === 'ja' ? '/:path(.*)?' : `/${locale}/:path(.*)?`,
    ])
  )

/** @type {CompilerOptions} */
export const paraglideOptions = {
  project: './project.inlang',
  outdir: './src/paraglide',
  outputStructure: 'message-modules',
  emitTsDeclarations: true,
  emitGitIgnore: false,
  emitPrettierIgnore: false,
  emitReadme: false,
  cookieName: 'NEXT_LOCALE',
  strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
  urlPatterns: [
    {
      pattern: '/',
      localized: localizedRootPaths,
    },
    {
      pattern: '/:path(.*)?',
      localized: localizedCatchAllPaths,
    },
  ],
  routeStrategies: [
    { match: '/api/:path(.*)?', exclude: true },
    { match: '/status', exclude: true },
    { match: '/dist/:path(.*)?', exclude: true },
    { match: '/fcd/:path(.*)?', exclude: true },
    { match: '/update/:path(.*)?', exclude: true },
    { match: '/opengraph-image', exclude: true },
    { match: '/twitter-image', exclude: true },
  ],
}
