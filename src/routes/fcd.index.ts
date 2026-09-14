import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/fcd/')({
  server: {
    handlers: {
      ANY: () => new Response('', { status: 404 }),
    },
  },
})
