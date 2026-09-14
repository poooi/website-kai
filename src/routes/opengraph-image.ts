import { createFileRoute } from '@tanstack/react-router'

import {
  socialImageHeadResponse,
  socialImageResponse,
} from '~/server/social-image'

export const Route = createFileRoute('/opengraph-image')({
  server: {
    handlers: {
      GET: ({ request }) => socialImageResponse(request),
      HEAD: () => socialImageHeadResponse(),
    },
  },
})
