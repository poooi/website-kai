import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/opengraph-image')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { createSocialImageResponse } = await import('~/lib/social-image')
        return createSocialImageResponse((pathname) =>
          fetch(new URL(pathname, request.url)),
        )
      },
    },
  },
})
