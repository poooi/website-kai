// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://cada89d337c4fa8d92e1e1b2ddc1fdfc@o171991.ingest.us.sentry.io/4508112237101056',
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 0.01,
  replaysSessionSampleRate: 0.001,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
})
