const transparentPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l1Yv4wAAAABJRU5ErkJggg=='

const transparentPng = Uint8Array.from(atob(transparentPngBase64), (char) =>
  char.charCodeAt(0),
)

export const createSocialImageResponse = () =>
  new Response(transparentPng, {
    headers: {
      'Cache-Control': 'public,max-age=3600',
      'Content-Type': 'image/png',
    },
  })
