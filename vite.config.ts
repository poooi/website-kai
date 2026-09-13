import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { cloudflare } from '@cloudflare/vite-plugin'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { execa } from 'execa'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { paraglideOptions } from './paraglide.config.js'

const getCommitHash = async () => {
  try {
    const commitHash = await execa('git', ['rev-parse', 'HEAD'])
    return commitHash.stdout
  } catch {
    return 'development'
  }
}

const commitHash = await getCommitHash()
const releaseHistoryFixture = process.env.TANSTACK_TEST_RELEASE_HISTORY
  ? await readFile(
      new URL('./tests/fixtures/release-history.json', import.meta.url),
      'utf8',
    )
  : ''
const buildDate = new Date().toISOString()
const pluginsFixture = process.env.TANSTACK_TEST_PLUGINS
  ? await readFile(
      new URL('./tests/fixtures/plugins.json', import.meta.url),
      'utf8',
    )
  : ''
const pluginReleasesFixture = process.env.TANSTACK_TEST_PLUGINS
  ? await readFile(
      new URL('./tests/fixtures/plugin-releases.json', import.meta.url),
      'utf8',
    )
  : ''
const creditsManifestFixture = process.env.TANSTACK_TEST_CREDITS
  ? await readFile(
      new URL('./tests/fixtures/credits-manifest.json', import.meta.url),
      'utf8',
    )
  : ''
const creditsSheetFixture = process.env.TANSTACK_TEST_CREDITS
  ? (
      await readFile(
        new URL('./tests/fixtures/credits-sheet.webp', import.meta.url),
      )
    ).toString('base64')
  : ''
const sentryRelease = process.env.SENTRY_RELEASE ?? commitHash
const sentryUploadEnabled = !!process.env.SENTRY_AUTH_TOKEN
const ibmFontPackages = [
  'plex-sans',
  'plex-sans-jp',
  'plex-sans-kr',
  'plex-sans-sc',
  'plex-sans-tc',
]

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3002,
  },
  preview: {
    host: '127.0.0.1',
    port: 3002,
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'process.env.TANSTACK_TEST_PLUGINS': JSON.stringify(pluginsFixture),
    'process.env.TANSTACK_TEST_PLUGIN_RELEASES': JSON.stringify(
      pluginReleasesFixture,
    ),
    'process.env.TANSTACK_TEST_CREDITS_MANIFEST': JSON.stringify(
      creditsManifestFixture,
    ),
    'process.env.TANSTACK_TEST_CREDITS_SHEET':
      JSON.stringify(creditsSheetFixture),
    'process.env.BUILD_DATE': JSON.stringify(buildDate),
    'process.env.COMMIT_HASH': JSON.stringify(commitHash),
    'process.env.SENTRY_RELEASE': JSON.stringify(sentryRelease),
    'process.env.TANSTACK_TEST_POI_VERSIONS': JSON.stringify(
      process.env.TANSTACK_TEST_POI_VERSIONS ?? '',
    ),
    'process.env.TANSTACK_TEST_RELEASE_HISTORY': JSON.stringify(
      releaseHistoryFixture,
    ),
  },
  plugins: [
    tailwindcss(),
    paraglideVitePlugin(paraglideOptions),
    cloudflare({
      configPath: './wrangler.toml',
      viteEnvironment: { name: 'ssr' },
    }),
    viteStaticCopy({
      targets: [
        ...ibmFontPackages.flatMap((fontPackage) => [
          {
            src: `node_modules/@ibm/${fontPackage}/fonts/split/woff2/**/*.woff2`,
            dest: `fonts/${fontPackage}`,
            rename: { stripBase: true as const },
          },
          {
            src: `node_modules/@ibm/${fontPackage}/fonts/split/woff2/**/*.css`,
            dest: `fonts/${fontPackage}`,
            rename: { stripBase: true as const },
            // Avoid a late font swap changing wrapping and moving the map.
            transform: (content: string) =>
              content.replaceAll(
                '@font-face {',
                '@font-face {\n  font-display: optional;',
              ),
          },
        ]),
        {
          src: 'src/assets/poi.svg',
          dest: 'social',
          rename: { stripBase: true as const },
        },
        {
          src: 'node_modules/@ibm/plex-sans/fonts/complete/woff/IBMPlexSans-SemiBold.woff',
          dest: 'social',
          rename: { stripBase: true as const },
        },
      ],
    }),
    tanstackStart(),
    viteReact(),
    ...(sentryUploadEnabled
      ? sentryTanstackStart({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: process.env.SENTRY_ORG ?? 'poi',
          project: process.env.SENTRY_PROJECT ?? 'poi-web-kai',
          release: { name: sentryRelease },
          sourcemaps: {
            filesToDeleteAfterUpload: [
              './dist/client/**/*.map',
              './dist/server/**/*.map',
            ],
          },
        })
      : []),
  ],
})
