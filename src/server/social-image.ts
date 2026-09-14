import { withSocialImageHeaders } from '~/lib/social-image-constants'

/** Cheap HEAD path: headers only, no rendering or asset reads. */
export const socialImageHeadResponse = () =>
  new Response(null, { headers: withSocialImageHeaders() })

export const socialImageResponse = async (
  request: Request,
): Promise<Response> => {
  const { env } = await import('cloudflare:workers')
  const { createSocialImageResponse } = await import('~/lib/social-image')
  return createSocialImageResponse((pathname) =>
    env.ASSETS.fetch(
      new Request(new URL(pathname, request.url), { method: 'GET' }),
    ),
  )
}
