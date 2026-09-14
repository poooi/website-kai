import { fetchPoiVersions } from '~/lib/fetch-poi-versions'
import {
  type HandlerContext,
  isSingleSegmentFilename,
  mapUpstreamError,
  notFound,
  reverseFetch,
} from '~/server/upstream'

export const handleDist = async (
  request: Request,
  { filename }: { filename?: string },
  context: HandlerContext = {},
): Promise<Response> => {
  if (!isSingleSegmentFilename(filename)) {
    return notFound()
  }

  if (filename.endsWith('.yml')) {
    let version: string
    let distFileName: string
    try {
      const poiVersions = await fetchPoiVersions({
        fetcher: context.fetcher,
        timeoutMs: context.timeoutMs,
        signal: request.signal,
      })
      if (filename.startsWith('beta')) {
        version = poiVersions.betaVersion
        distFileName = filename.replace(/^beta/, 'latest')
      } else if (filename.startsWith('latest')) {
        version = poiVersions.version
        distFileName = filename
      } else {
        return notFound()
      }
    } catch (error) {
      return mapUpstreamError(error)
    }

    return reverseFetch(
      request,
      `https://github.com/poooi/poi/releases/download/${version}/${distFileName}`,
      context,
    )
  }

  const tag = /(\d+\.\d+\.\d+(?:-beta\.\d+)?)/.exec(filename)?.[1]

  if (!tag) {
    return notFound()
  }

  const ipCountry = request.headers.get('CF-IPCountry') ?? ''
  const destination =
    ipCountry === 'CN'
      ? `https://registry.npmmirror.com/-/binary/poi/v${tag}/${filename}`
      : `https://github.com/poooi/poi/releases/download/v${tag}/${filename}`

  return new Response('', {
    status: 301,
    headers: {
      Location: destination,
    },
  })
}
