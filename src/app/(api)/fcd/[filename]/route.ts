import { notFound } from 'next/navigation'

import { reverseFetch } from '~/lib/reverse-fetch'

export const runtime = 'edge'

export const GET = async (
  request: Request,
  { params }: { params: { filename: string } },
) => {
  const { filename } = params
  if (!filename) {
    notFound()
  }
  if (!filename?.endsWith('.json')) {
    notFound()
  }
  return reverseFetch(
    `https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/${filename}`,
  )
}
