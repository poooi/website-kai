import { createFileRoute } from '@tanstack/react-router'

import { handleStatus } from '~/lib/route-handlers'

export const Route = createFileRoute('/status')({
  server: {
    handlers: {
      GET: async ({ request }) => handleStatus(request),
    },
  },
})
