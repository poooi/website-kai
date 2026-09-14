import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/update/')({
  server: {
    handlers: {
      ANY: () => new Response('', { status: 404 }),
    },
  },
})
