import { notFound } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { reverseFetch } from '~/utils/reverse-fetch'
import { fetchPoiVersions } from '~/utils/fetch-poi-versions'

export const runtime = 'edge'

export const GET = async (
  request: Request,
  { params }: { params?: { filename: string } },
) => {
  const { filename } = params ?? {}
  const { cf } = getRequestContext()

  if (!filename) {
    notFound()
  }
  let resp
  if (filename.endsWith('.yml')) {
    const poiVersions = await fetchPoiVersions()
    if (filename.startsWith('beta')) {
      const distFileName = filename.replace('beta', 'latest')
      resp = reverseFetch(
        `https://github.com/poooi/poi/releases/download/${poiVersions.betaVersion}/${distFileName}`,
      )
    } else if (filename.startsWith('latest')) {
      resp = reverseFetch(
        `https://github.com/poooi/poi/releases/download/${poiVersions.version}/${filename}`,
      )
    } else {
      return
    }

    return resp
  }

  const tag = /(\d+\.\d+\.\d+(-beta\.\d)?)/.exec(filename)?.[1]

  if (!tag) {
    return
  }

  const destination =
    cf?.country === 'CN'
      ? `https://registry.npmmirror.com/-/binary/poi/v${tag}/${filename}`
      : `https://github.com/poooi/poi/releases/download/v${tag}/${filename}`

  const response = new Response('', { status: 301 })
  response.headers.set('Location', destination)
  return response
}
