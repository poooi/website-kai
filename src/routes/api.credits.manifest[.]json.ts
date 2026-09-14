import { createFileRoute } from '@tanstack/react-router'

import {
  manifestResponse,
  methodNotAllowedResponse,
  preflightResponse,
} from '~/server/credits-proxy'

export const Route = createFileRoute('/api/credits/manifest.json')({
  server: {
    handlers: {
      GET: () => manifestResponse(),
      OPTIONS: ({ request }) => preflightResponse(request),
      ANY: () => methodNotAllowedResponse(),
    },
  },
})
