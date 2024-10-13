// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://cada89d337c4fa8d92e1e1b2ddc1fdfc@o171991.ingest.us.sentry.io/4508112237101056',
  tracesSampleRate: 0.01,
  debug: false,
})
