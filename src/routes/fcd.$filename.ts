import { createFileRoute } from '@tanstack/react-router'

import {
  isSingleSegmentFilename,
  notFound,
  reverseFetch,
} from '~/server/upstream'

export const Route = createFileRoute('/fcd/$filename')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const { filename } = params
        if (!isSingleSegmentFilename(filename) || !filename.endsWith('.json')) {
          return notFound()
        }

        return reverseFetch(
          request,
          `https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/${filename}`,
        )
      },
    },
  },
})
