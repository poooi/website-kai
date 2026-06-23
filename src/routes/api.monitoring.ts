import * as Sentry from '@sentry/tanstackstart-react'
import { createFileRoute } from '@tanstack/react-router'

import { sentryDsn } from '~/lib/sentry'

const sentryTunnel = Sentry.createSentryTunnelRoute({
  allowedDsns: [sentryDsn],
})

const methodNotAllowed = () =>
  new Response(null, {
    headers: {
      Allow: 'POST',
      'Cache-Control': 'no-store',
    },
    status: 405,
  })

export const Route = createFileRoute('/api/monitoring')({
  server: {
    handlers: {
      ...sentryTunnel.handlers,
      GET: methodNotAllowed,
      HEAD: methodNotAllowed,
    },
  },
})
