export const socialImageCacheControl = 'public,max-age=3600'
export const socialImageContentType = 'image/png'
export const socialImageWidth = 1200
export const socialImageHeight = 630

export const withSocialImageHeaders = (headers = new Headers()) => {
  const socialImageHeaders = new Headers(headers)
  socialImageHeaders.set('Cache-Control', socialImageCacheControl)
  socialImageHeaders.set('Content-Type', socialImageContentType)
  return socialImageHeaders
}
