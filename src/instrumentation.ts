import * as Sentry from '@sentry/nextjs'

// CF Workers doesn't polyfill process.versions.node — patch it so packages like
// is-core-module (used by webpack module resolution) don't throw at runtime.
// CF Workers doesn't polyfill process.versions.node, but is-core-module requires it.
// Patch it at startup so webpack module resolution works in the server function.
try {
  const proc = process as unknown as Record<string, unknown>
  const vers = (proc['versions'] ?? {}) as Record<string, string>
  if (!vers['node'] && typeof process.version === 'string') {
    vers['node'] = process.version.replace(/^v/, '')
    if (!proc['versions']) proc['versions'] = vers
  }
} catch { /* best-effort */ }

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
