import { createFileRoute } from '@tanstack/react-router'

import {
  isSingleSegmentFilename,
  notFound,
  reverseFetch,
} from '~/server/upstream'

export const Route = createFileRoute('/update/$filename')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const { filename } = params
        if (
          !isSingleSegmentFilename(filename) ||
          (!filename.endsWith('.json') && !filename.endsWith('.md'))
        ) {
          return notFound()
        }

        return reverseFetch(
          request,
          `https://raw.githubusercontent.com/poooi/poi-release/master/${filename}`,
        )
      },
    },
  },
})
