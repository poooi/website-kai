import { type FetchLike, UpstreamResponseError } from '~/lib/fetch-poi-versions'
import {
  creditsManifestSchema,
  creditsManifestUrl,
} from '~/lib/credits-manifest.server'
import { fetchCachedRelease } from '~/lib/release-cache.server'
import { creditsSpritePath, handleCreditsSprite } from '~/server/credits-sprite'

export const creditsProxyPath = '/api/credits/'
const manifestPath = `${creditsProxyPath}manifest.json`
const allowedMethods = 'GET, HEAD, OPTIONS'

// One wrapper for every branch: CORS-open for file-origin renderers and never a
// body on HEAD, including proxied errors.
const finalize = (response: Response, method: string) => {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  return new Response(method === 'HEAD' ? null : response.body, {
    status: response.status,
    headers,
  })
}

const loadManifest = async (fetcher: FetchLike) => {
  const fixture = process.env.TANSTACK_TEST_CREDITS_MANIFEST
  if (fixture && fetcher === fetch) {
    creditsManifestSchema.parse(JSON.parse(fixture))
    return fixture
  }
  const response = await fetchCachedRelease(creditsManifestUrl, {
    fetcher,
    validate: (text) => creditsManifestSchema.parse(JSON.parse(text)),
  })
  if (!response.ok) throw new UpstreamResponseError(response.status)
  return response.text()
}

/** Public credits API for the poi renderer: the upstream manifest verbatim
 * (bare sheet filenames stay relative to this origin) and the hashed sheets
 * through the canonical sprite handler and its shared cache. */
export async function handleCreditsProxy(
  request: Request,
  { fetcher = fetch }: { fetcher?: FetchLike } = {},
): Promise<Response | undefined> {
  const { pathname } = new URL(request.url)
  if (!pathname.startsWith(creditsProxyPath)) return undefined
  const method = request.method

  if (method === 'OPTIONS')
    return finalize(
      new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Methods': allowedMethods,
          Allow: allowedMethods,
        },
      }),
      method,
    )

  if (method !== 'GET' && method !== 'HEAD')
    return finalize(
      new Response(null, {
        status: 405,
        headers: { Allow: allowedMethods, 'Cache-Control': 'no-store' },
      }),
      method,
    )

  if (pathname === manifestPath) {
    try {
      return finalize(
        new Response(await loadManifest(fetcher), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          },
        }),
        method,
      )
    } catch {
      return finalize(
        new Response('{"error":"credits manifest unavailable"}', {
          status: 502,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        }),
        method,
      )
    }
  }

  const filename = pathname.slice(creditsProxyPath.length)
  const sprite = await handleCreditsSprite(
    new Request(
      new URL(`${creditsSpritePath}${filename}`, request.url),
      request,
    ),
    { fetcher },
  )
  return finalize(
    sprite ??
      new Response('Not Found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      }),
    method,
  )
}
