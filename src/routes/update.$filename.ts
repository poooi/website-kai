import { createFileRoute } from '@tanstack/react-router'

import { handleUpdate } from '~/lib/route-handlers'

export const Route = createFileRoute('/update/$filename')({
  server: {
    handlers: {
      GET: async ({ params, request }) => handleUpdate(request, params),
    },
  },
})
