/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import path from 'node:path/posix'

import { withSentryConfig } from '@sentry/nextjs'
import { execa } from 'execa'
import fs from 'fs-extra'
import { globby } from 'globby'
import PQueue from 'p-queue'

const commitHash = await execa('git', ['rev-parse', 'HEAD'])
const now = new Date().toISOString()

const queue = new PQueue({ concurrency: 3 })

await import('./src/env.js')

class CopyFontsWebpackPlugin {
  static started = false
  apply(/** @type {import('webpack').Compiler} */ compiler) {
    compiler.hooks.beforeCompile.tapPromise(
      'CopyFontsWebpackPlugin',
      async () => {
        if (CopyFontsWebpackPlugin.started) {
          return
        }
        CopyFontsWebpackPlugin.started = true
        const cssFiles = await globby(
          path.resolve('node_modules/@ibm/**/woff2/**/*.css'),
        )
        const fontFiles = await globby(
          path.resolve('node_modules/@ibm/**/woff2/**/*.woff2'),
        )
        const dest = path.resolve('public/fonts/')
        await fs.ensureDir('./public/fonts')
        await queue.addAll(
          cssFiles.map((cssFile) => () => {
            const fontName = /@ibm\/(.+?)\//.exec(cssFile)[1]
            return fs.copy(
              cssFile,
              path.resolve(dest, fontName, path.basename(cssFile)),
            )
          }),
        )
        await queue.addAll(
          fontFiles.map((fontFile) => () => {
            const fontName = /@ibm\/(.+?)\//.exec(fontFile)[1]
            return fs.copy(
              fontFile,
              path.resolve(dest, fontName, path.basename(fontFile)),
            )
          }),
        )
      },
    )
  }
}

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
  webpack: (/** @type {import('webpack').Configuration} */ config) => {
    config.plugins.push(new CopyFontsWebpackPlugin())
    config.module.rules.push({
      test: /\.md/,
      type: 'asset/source',
    })

    return config
  },
  env: {
    COMMIT_HASH: commitHash.stdout,
    BUILD_DATE: now,
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Poi-Codename',
          value: 'Shiratsuyu',
        },
        {
          key: 'X-Poi-Revision',
          value: commitHash.stdout ?? 'development',
        },
        {
          key: 'X-Poi-Build-Date',
          value: now,
        },
        {
          key: 'X-Poi-Greetings',
          value: 'poi?',
        },
      ],
    },
  ],
}

// Injected content via Sentry wizard below

export default withSentryConfig(config, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'poi',
  project: 'poi-web-kai',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/api/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
