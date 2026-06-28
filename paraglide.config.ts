import type { CompilerOptions } from '@inlang/paraglide-js'

const locales = ['en', 'fr', 'ja', 'ko', 'zh-Hans', 'zh-Hant'] as const
type Locale = (typeof locales)[number]

const localizedRootPaths = locales.map((locale): [Locale, string] => [
  locale,
  locale === 'ja' ? '/' : `/${locale}`,
])
const localizedCatchAllPaths = locales.map((locale): [Locale, string] => [
  locale,
  locale === 'ja' ? '/:path(.*)?' : `/${locale}/:path(.*)?`,
])

export const paraglideOptions = {
  project: './project.inlang',
  outdir: './src/paraglide',
  outputStructure: 'message-modules',
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
} satisfies CompilerOptions
