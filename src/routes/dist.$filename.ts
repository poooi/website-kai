import { createFileRoute } from '@tanstack/react-router'

import { handleDist } from '~/lib/route-handlers'

export const Route = createFileRoute('/dist/$filename')({
  server: {
    handlers: {
      GET: async ({ params, request }) => handleDist(request, params),
    },
  },
})
