import { createFileRoute } from '@tanstack/react-router'

import { createSocialImageResponse } from '~/lib/social-image'

export const Route = createFileRoute('/opengraph-image')({
  server: {
    handlers: {
      GET: () => createSocialImageResponse(),
    },
  },
})
