import sanitize from 'rehype-sanitize'
import stringify from 'rehype-stringify'
import { remark } from 'remark'
import rehype from 'remark-rehype'

import {
  changelogFilename,
  changelogLanguageCandidates,
  isChangelogChannel,
  type ChangelogChannel,
} from './changelog'
import {
  fetchPoiVersions,
  fetchWithTimeout,
  InvalidUpstreamResponseError,
  type FetchLike,
  UpstreamNetworkError,
  UpstreamResponseError,
  UpstreamTimeoutError,
} from './fetch-poi-versions'

interface HandlerContext {
  fetcher?: FetchLike
  timeoutMs?: number
}

interface FilenameParams {
  filename?: string
}

interface ChannelParams {
  channel?: string
}

const notFound = () => new Response('', { status: 404 })

// Kept next to the handler so the markdown pipeline never reaches the client
// bundle through the shared changelog module.
const changelogUrl = (language: string, channel: ChangelogChannel) =>
  `https://raw.githubusercontent.com/poooi/poi-release/master/${changelogFilename(language, channel)}`

const renderChangelog = async (markdown: string) =>
  (
    await remark().use(rehype).use(sanitize).use(stringify).process(markdown)
  ).toString()

const badGateway = () => new Response('', { status: 502 })

const gatewayTimeout = () => new Response('', { status: 504 })

const isSingleSegmentFilename = (
  filename: string | undefined,
): filename is string => {
  return !!filename && !filename.includes('/') && !filename.includes('\\')
}

const mapUpstreamError = (error: unknown) => {
  if (error instanceof UpstreamResponseError) {
    return error.status === 404 ? notFound() : badGateway()
  }

  if (
    error instanceof UpstreamTimeoutError ||
    error instanceof UpstreamNetworkError
  ) {
    return gatewayTimeout()
  }

  if (error instanceof InvalidUpstreamResponseError) {
    return badGateway()
  }

  throw error
}

const reverseFetch = async (
  request: Request,
  url: string,
  { fetcher = fetch, timeoutMs }: HandlerContext = {},
) => {
  let resp: Response
  try {
    resp = await fetchWithTimeout(
      fetcher,
      url,
      { signal: request.signal },
      timeoutMs,
    )
  } catch (error) {
    if (!(error instanceof UpstreamTimeoutError)) {
      return mapUpstreamError(new UpstreamNetworkError(error))
    }
    return mapUpstreamError(error)
  }

  if (!resp.ok) {
    return mapUpstreamError(new UpstreamResponseError(resp.status))
  }

  const fulfilled = new Response(resp.body, resp)
  fulfilled.headers.set('X-Poi-Real-Url', url)
  if (url.endsWith('.json')) {
    fulfilled.headers.set('Content-Type', 'application/json')
  }
  return fulfilled
}

export const handleStatus = (request: Request) => {
  const ipCountry = request.headers.get('CF-IPCountry')
  return Response.json({ message: 'poi poi poi!', region: ipCountry })
}

export const handleFcd = async (
  request: Request,
  { filename }: FilenameParams,
  context?: HandlerContext,
) => {
  if (!isSingleSegmentFilename(filename) || !filename.endsWith('.json')) {
    return notFound()
  }

  return reverseFetch(
    request,
    `https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/${filename}`,
    context,
  )
}

export const handleUpdate = async (
  request: Request,
  { filename }: FilenameParams,
  context?: HandlerContext,
) => {
  if (
    !isSingleSegmentFilename(filename) ||
    (!filename.endsWith('.json') && !filename.endsWith('.md'))
  ) {
    return notFound()
  }

  return reverseFetch(
    request,
    `https://raw.githubusercontent.com/poooi/poi-release/master/${filename}`,
    context,
  )
}

export const handleChangelog = async (
  request: Request,
  { channel }: ChannelParams,
  context?: HandlerContext,
) => {
  if (!isChangelogChannel(channel)) {
    return notFound()
  }

  const locale = new URL(request.url).searchParams.get('locale') ?? undefined

  for (const language of changelogLanguageCandidates(locale)) {
    const upstream = await reverseFetch(
      request,
      changelogUrl(language, channel),
      context,
    )

    if (upstream.ok) {
      const html = await renderChangelog(await upstream.text())
      return Response.json(
        { html, language },
        { headers: { 'Cache-Control': 'public, max-age=300' } },
      )
    }

    // Only a missing file is worth falling back for; a failing upstream is
    // reported as-is so the dialog can offer a retry.
    if (upstream.status !== 404) {
      return upstream
    }
  }

  return notFound()
}

export const handleDist = async (
  request: Request,
  { filename }: FilenameParams,
  context: HandlerContext = {},
) => {
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
