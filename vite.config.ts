import { fileURLToPath } from 'node:url'

import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { execa } from 'execa'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

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
    'process.env.BUILD_DATE': JSON.stringify(buildDate),
    'process.env.COMMIT_HASH': JSON.stringify(commitHash),
  },
  plugins: [
    cloudflare({
      configPath: './wrangler.tanstack.jsonc',
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
  ],
})
