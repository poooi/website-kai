import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dist/')({
  server: {
    handlers: {
      ANY: () => new Response('', { status: 404 }),
    },
  },
})
