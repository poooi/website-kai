import { createFileRoute } from '@tanstack/react-router'

import { handleChangelog } from '~/lib/route-handlers'

export const Route = createFileRoute('/api/changelog/$channel')({
  server: {
    handlers: {
      GET: async ({ params, request }) => handleChangelog(request, params),
    },
  },
})
