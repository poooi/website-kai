'use client'

import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { sentryDsn, sentryRelease } from '~/lib/sentry'

let initialized = false
let initialization: Promise<void> | undefined

export const SentryClient = () => {
  const router = useRouter()

  useEffect(() => {
    if (initialized || initialization) {
      return
    }

    initialization = import('@sentry/tanstackstart-react')
      .then((Sentry) => {
        Sentry.init({
          dsn: sentryDsn,
          integrations: [
            Sentry.replayIntegration(),
            Sentry.tanstackRouterBrowserTracingIntegration(router),
          ],
          release: sentryRelease,
          replaysOnErrorSampleRate: 1.0,
          replaysSessionSampleRate: 0.001,
          tracesSampleRate: 0.01,
        })
        initialized = true
      })
      .catch(() => {
        initialized = false
      })
      .finally(() => {
        initialization = undefined
      })
  }, [router])

  return null
}
