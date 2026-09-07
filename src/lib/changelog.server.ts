import sanitize from 'rehype-sanitize'
import stringify from 'rehype-stringify'
import { remark } from 'remark'
import rehype from 'remark-rehype'
import {
  changelogFilename,
  changelogLanguageCandidates,
  type ChangelogChannel,
} from './changelog'
import {
  fetchWithTimeout,
  type FetchLike,
  UpstreamNetworkError,
  UpstreamResponseError,
  UpstreamTimeoutError,
} from './fetch-poi-versions'

export const fetchLocalizedChangelog = async (
  locale: string | undefined,
  channel: ChangelogChannel,
  {
    fetcher = fetch,
    timeoutMs,
    signal,
  }: { fetcher?: FetchLike; timeoutMs?: number; signal?: AbortSignal } = {},
) => {
  for (const language of changelogLanguageCandidates(locale)) {
    let response: Response
    try {
      response = await fetchWithTimeout(
        fetcher,
        `https://raw.githubusercontent.com/poooi/poi-release/master/${changelogFilename(language, channel)}`,
        { signal },
        timeoutMs,
      )
    } catch (error) {
      if (error instanceof UpstreamTimeoutError) throw error
      throw new UpstreamNetworkError(error)
    }
    if (response.status === 404) continue
    if (!response.ok) throw new UpstreamResponseError(response.status)
    const html = (
      await remark()
        .use(rehype)
        .use(sanitize)
        .use(stringify)
        .process(await response.text())
    ).toString()
    return { html, language }
  }
  throw new UpstreamResponseError(404)
}
