import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { cloudflare } from '@cloudflare/vite-plugin'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { execa } from 'execa'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { paraglideOptions } from './paraglide.config'

const getCommitHash = async () => {
  try {
    const commitHash = await execa('git', ['rev-parse', 'HEAD'])
    return commitHash.stdout
  } catch {
    return 'development'
  }
}

const commitHash = await getCommitHash()
const buildDate = new Date().toISOString()
const sentryRelease = process.env.SENTRY_RELEASE ?? commitHash
const sentryUploadEnabled = !!process.env.SENTRY_AUTH_TOKEN
const paraglideServerPath = fileURLToPath(
  new URL('./src/paraglide/server.js', import.meta.url),
)

const ibmFontPackages = [
  'plex-sans',
  'plex-sans-jp',
  'plex-sans-kr',
  'plex-sans-sc',
  'plex-sans-tc',
]

const paraglideCloudflareTypecheckPlugin = () => ({
  name: 'paraglide-cloudflare-typecheck',
  enforce: 'post' as const,
  async buildStart() {
    const source = await readFile(paraglideServerPath, 'utf8')
    if (!source.startsWith('// @ts-nocheck')) {
      await writeFile(paraglideServerPath, `// @ts-nocheck\n${source}`)
    }
  },
})

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
    'process.env.BUILD_DATE': JSON.stringify(buildDate),
    'process.env.COMMIT_HASH': JSON.stringify(commitHash),
    'process.env.SENTRY_RELEASE': JSON.stringify(sentryRelease),
    'process.env.TANSTACK_TEST_POI_VERSIONS': JSON.stringify(
      process.env.TANSTACK_TEST_POI_VERSIONS ?? '',
    ),
  },
  plugins: [
    paraglideVitePlugin(paraglideOptions),
    paraglideCloudflareTypecheckPlugin(),
    cloudflare({
      configPath: './wrangler.toml',
      viteEnvironment: { name: 'ssr' },
    }),
    viteStaticCopy({
      targets: ibmFontPackages.map((fontPackage) => ({
        src: `node_modules/@ibm/${fontPackage}/fonts/split/woff2/**/*.{css,woff2}`,
        dest: `fonts/${fontPackage}`,
        rename: { stripBase: true },
      })),
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
