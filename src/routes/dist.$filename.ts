import { createFileRoute } from '@tanstack/react-router'

import { handleDist } from '~/server/dist'

export const Route = createFileRoute('/dist/$filename')({
  server: {
    handlers: {
      GET: async ({ params, request }) => handleDist(request, params),
    },
  },
})
