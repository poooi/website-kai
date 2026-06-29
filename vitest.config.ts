import { fileURLToPath } from 'node:url'

import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { defineConfig } from 'vitest/config'

import { paraglideOptions } from './paraglide.config.js'

export default defineConfig({
  plugins: [paraglideVitePlugin(paraglideOptions)],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
