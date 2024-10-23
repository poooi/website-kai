import { notFound } from 'next/navigation'

import { fetchPoiVersions } from '~/lib/fetch-poi-versions'
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

  const ipCountry = request.headers.get('CF-IPCountry') ?? ''

  const destination =
    ipCountry === 'CN'
      ? `https://registry.npmmirror.com/-/binary/poi/v${tag}/${filename}`
      : `https://github.com/poooi/poi/releases/download/v${tag}/${filename}`

  const response = new Response('', { status: 301 })
  response.headers.set('Location', destination)
  return response
}
