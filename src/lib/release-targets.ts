import { z } from 'zod'
import { fetchWithTimeout, type FetchLike } from './fetch-poi-versions'
import { getDownloadLink, Target } from './target'

const releaseSchema = z.object({
  assets: z.array(z.object({ name: z.string() })),
})

export const matchReleaseTargets = (version: string, filenames: string[]) => {
  const names = new Set(filenames)
  return Object.values(Target).filter((target) => {
    // The shared Windows installer is not evidence of 32-bit support.
    // Releases that support ia32 also ship the ia32 portable archive.
    if (
      target === Target.win32Setup &&
      !names.has(getDownloadLink(version, Target.win32).replace('/dist/', ''))
    )
      return false
    return names.has(getDownloadLink(version, target).replace('/dist/', ''))
  })
}

// Cache public release filenames only; platform and locale remain request-specific.
const cache = new Map<string, { expires: number; targets: Target[] }>()
export const fetchReleaseTargets = async (
  version: string,
  fetcher: FetchLike = fetch,
) => {
  const cached = cache.get(version)
  if (cached && cached.expires > Date.now()) return cached.targets
  try {
    const response = await fetchWithTimeout(
      fetcher,
      `https://api.github.com/repos/poooi/poi/releases/tags/${encodeURIComponent(version)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'poi-website',
        },
      },
      5000,
    )
    if (!response.ok) return []
    const release = releaseSchema.parse(await response.json())
    const targets = matchReleaseTargets(
      version,
      release.assets.map((asset) => asset.name),
    )
    cache.set(version, { targets, expires: Date.now() + 300_000 })
    return targets
  } catch {
    return []
  }
}
