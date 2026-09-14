import { createFileRoute } from '@tanstack/react-router'

import { handleChangelog } from '~/server/changelog'

export const Route = createFileRoute('/api/changelog/$channel')({
  server: {
    handlers: {
      GET: async ({ params, request }) => handleChangelog(request, params),
    },
  },
})
