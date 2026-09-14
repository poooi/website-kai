import { createFileRoute } from '@tanstack/react-router'

import {
  methodNotAllowedResponse,
  preflightResponse,
  spriteResponse,
} from '~/server/credits-proxy'

export const Route = createFileRoute('/api/credits/$filename')({
  server: {
    handlers: {
      GET: ({ params, request }) =>
        spriteResponse(params.filename, request.url),
      OPTIONS: ({ request }) => preflightResponse(request),
      ANY: () => methodNotAllowedResponse(),
    },
  },
})
