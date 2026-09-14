import { type FetchLike } from '~/lib/fetch-poi-versions'
import { loadCreditsManifest } from '~/lib/credits-manifest.server'
import { creditsSpritePath, fetchCreditsSprite } from '~/server/credits-sprite'

export const creditsProxyPath = '/api/credits/'
const manifestPath = `${creditsProxyPath}manifest.json`
const allowedMethods = 'GET, HEAD, OPTIONS'

const jsonResponse = (body: string, status: number, cacheControl: string) =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  })

/** Public credits API: the raw upstream manifest at /api/credits/manifest.json
 * and hashed sheets under /api/credits/ and the legacy /api/credits-sprite/
 * path, reusing the shared canonical sprite cache. */
export async function handleCreditsProxy(
  request: Request,
  { fetcher = fetch }: { fetcher?: FetchLike } = {},
): Promise<Response | undefined> {
  const { pathname } = new URL(request.url)
  const legacy = pathname.startsWith(creditsSpritePath)
  if (!legacy && !pathname.startsWith(creditsProxyPath)) return undefined
  const method = request.method

  let response: Response
  if (method === 'OPTIONS') {
    response = new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': allowedMethods,
        'Access-Control-Allow-Headers':
          request.headers.get('Access-Control-Request-Headers') ?? '',
        Vary: 'Access-Control-Request-Headers',
        Allow: allowedMethods,
      },
    })
  } else if (method !== 'GET' && method !== 'HEAD') {
    response = new Response(null, {
      status: 405,
      headers: { Allow: allowedMethods, 'Cache-Control': 'no-store' },
    })
  } else if (!legacy && pathname === manifestPath) {
    try {
      response = jsonResponse(
        await loadCreditsManifest(fetcher),
        200,
        'public, max-age=300',
      )
    } catch {
      response = jsonResponse(
        '{"error":"credits manifest unavailable"}',
        502,
        'no-store',
      )
    }
  } else {
    const prefix = legacy ? creditsSpritePath : creditsProxyPath
    const sprite = await fetchCreditsSprite(
      pathname.slice(prefix.length),
      request.url,
      { fetcher },
    )
    response =
      sprite ??
      new Response('Not Found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      })
  }

  // Single final response: CORS-open for file-origin renderers and never a body
  // on HEAD, including proxied errors.
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  return new Response(method === 'HEAD' ? null : response.body, {
    status: response.status,
    headers,
  })
}
