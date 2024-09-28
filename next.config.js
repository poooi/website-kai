import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js')

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    testProxy: true,
  },
}

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

export default config
