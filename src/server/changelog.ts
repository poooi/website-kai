import { isChangelogChannel } from '~/lib/changelog'
import { fetchLocalizedChangelog } from '~/lib/changelog.server'
import {
  type HandlerContext,
  mapUpstreamError,
  notFound,
} from '~/server/upstream'

export const handleChangelog = async (
  request: Request,
  { channel }: { channel?: string },
  context?: HandlerContext,
): Promise<Response> => {
  if (!isChangelogChannel(channel)) {
    return notFound()
  }

  const locale = new URL(request.url).searchParams.get('locale') ?? undefined

  try {
    const changelog = await fetchLocalizedChangelog(locale, channel, {
      ...context,
      signal: request.signal,
    })
    return Response.json(changelog, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    })
  } catch (error) {
    return mapUpstreamError(error)
  }
}
