import { notFound } from 'next/navigation'

import { reverseFetch } from '~/lib/reverse-fetch'

export const runtime = 'edge'

export const GET = async (
  request: Request,
  props: { params?: Promise<{ filename: string }> },
) => {
  const params = await props.params
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
