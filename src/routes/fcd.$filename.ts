import { createFileRoute } from '@tanstack/react-router'

import { handleFcd } from '~/lib/route-handlers'

export const Route = createFileRoute('/fcd/$filename')({
  server: {
    handlers: {
      GET: async ({ params, request }) => handleFcd(request, params),
    },
  },
})
