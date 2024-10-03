/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
    testProxy: process.env.NODE_ENV === 'test',
  },
  trailingSlash: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md/,
      type: 'asset/source',
    })

    return config
  },
}

export default config
