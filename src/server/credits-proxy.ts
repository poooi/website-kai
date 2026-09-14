import { type FetchLike } from '~/lib/fetch-poi-versions'
import { loadCreditsManifest } from '~/lib/credits-manifest.server'
import { fetchCreditsSprite } from '~/server/credits-sprite'

const allowedMethods = 'GET, HEAD, OPTIONS'

/** File-origin renderers need CORS on every credits API result. */
const withCors = (response: Response): Response => {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  return new Response(response.body, { status: response.status, headers })
}

const jsonResponse = (body: string, status: number, cacheControl: string) =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  })

/** The raw upstream manifest, exposed with a short outward cache. */
export const manifestResponse = async (
  fetcher: FetchLike = fetch,
): Promise<Response> => {
  try {
    return withCors(
      jsonResponse(
        await loadCreditsManifest(fetcher),
        200,
        'public, max-age=300',
      ),
    )
  } catch {
    return withCors(
      jsonResponse('{"error":"credits manifest unavailable"}', 502, 'no-store'),
    )
  }
}

/** A hashed sheet through the canonical sprite resource and its shared cache. */
export const spriteResponse = async (
  filename: string,
  requestUrl: string,
  fetcher: FetchLike = fetch,
): Promise<Response> => {
  const sprite = await fetchCreditsSprite(filename, requestUrl, { fetcher })
  return withCors(
    sprite ??
      new Response('Not Found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      }),
  )
}

/** CORS preflight reflecting the requested headers. */
export const preflightResponse = (request: Request): Response =>
  withCors(
    new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': allowedMethods,
        'Access-Control-Allow-Headers':
          request.headers.get('Access-Control-Request-Headers') ?? '',
        Vary: 'Access-Control-Request-Headers',
        Allow: allowedMethods,
      },
    }),
  )

export const methodNotAllowedResponse = (): Response =>
  withCors(
    new Response(null, {
      status: 405,
      headers: { Allow: allowedMethods, 'Cache-Control': 'no-store' },
    }),
  )
