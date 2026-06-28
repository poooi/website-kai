import { rm } from 'node:fs/promises'

import { compile } from '@inlang/paraglide-js'

const locales = ['en', 'fr', 'ja', 'ko', 'zh-Hans', 'zh-Hant']
const localizedRootPaths = locales.map((locale) => [
  locale,
  locale === 'ja' ? '/' : `/${locale}`,
])
const localizedCatchAllPaths = locales.map((locale) => [
  locale,
  locale === 'ja' ? '/:path(.*)?' : `/${locale}/:path(.*)?`,
])

const outdir = './src/paraglide'

await rm(outdir, { force: true, recursive: true })

await compile({
  project: './project.inlang',
  outdir,
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
})
