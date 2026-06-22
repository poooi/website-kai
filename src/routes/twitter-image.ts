import { createFileRoute } from '@tanstack/react-router'

import { createSocialImageResponse } from '~/lib/social-image'

export const Route = createFileRoute('/twitter-image')({
  server: {
    handlers: {
      GET: () => createSocialImageResponse(),
    },
  },
})
