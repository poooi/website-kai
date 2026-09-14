import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/status')({
  server: {
    handlers: {
      GET: ({ request }) =>
        Response.json({
          message: 'poi poi poi!',
          region: request.headers.get('CF-IPCountry'),
        }),
    },
  },
})
