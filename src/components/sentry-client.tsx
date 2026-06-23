'use client'

import { useEffect } from 'react'

import { sentryDsn, sentryRelease } from '~/lib/sentry'

let initialized = false
let initialization: Promise<void> | undefined

export const SentryClient = () => {
  useEffect(() => {
    if (initialized || initialization) {
      return
    }

    initialization = import('@sentry/react')
      .then((Sentry) => {
        Sentry.init({
          dsn: sentryDsn,
          integrations: [Sentry.replayIntegration()],
          release: sentryRelease,
          replaysOnErrorSampleRate: 1.0,
          replaysSessionSampleRate: 0.001,
          tracesSampleRate: 0.01,
          tunnel: '/api/monitoring',
        })
        initialized = true
      })
      .catch(() => {
        initialized = false
      })
      .finally(() => {
        initialization = undefined
      })
  }, [])

  return null
}
