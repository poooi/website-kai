export const sentryDsn =
  'https://cada89d337c4fa8d92e1e1b2ddc1fdfc@o171991.ingest.us.sentry.io/4508112237101056'
export const sentryRelease =
  process.env.SENTRY_RELEASE ?? process.env.COMMIT_HASH ?? 'development'
