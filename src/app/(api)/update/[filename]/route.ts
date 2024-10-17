import { notFound } from 'next/navigation'

import { reverseFetch } from '~/lib/reverse-fetch'

export const runtime = 'edge'

export const GET = async (
  request: Request,
  { params }: { params?: { filename: string } },
) => {
  const { filename } = params ?? {}
  if (!filename) {
    notFound()
  }
  if (!filename?.endsWith('.json') && !filename?.endsWith('.md')) {
    notFound()
  }
  return reverseFetch(
    `https://raw.githubusercontent.com/poooi/poi-release/master/${filename}`,
  )
}
