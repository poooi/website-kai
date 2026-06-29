// @ts-check

/** @typedef {import('@inlang/paraglide-js').CompilerOptions} CompilerOptions */

const baseLocale = 'ja'
const locales = /** @type {const} */ ([
  'en',
  'fr',
  baseLocale,
  'ko',
  'zh-Hans',
  'zh-Hant',
])
const localizedLocalesBySpecificity = [
  ...locales.filter((locale) => locale !== baseLocale),
  baseLocale,
]

const localizedRootPaths =
  /** @type {NonNullable<CompilerOptions['urlPatterns']>[number]['localized']} */ (
    localizedLocalesBySpecificity.map((locale) => [
      locale,
      locale === baseLocale ? '/' : `/${locale}`,
    ])
  )
const localizedCatchAllPaths =
  /** @type {NonNullable<CompilerOptions['urlPatterns']>[number]['localized']} */ (
    // The base-locale catch-all is greedy, so keep it after prefixed locales.
    localizedLocalesBySpecificity.map((locale) => [
      locale,
      locale === baseLocale ? '/:path(.*)?' : `/${locale}/:path(.*)?`,
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
