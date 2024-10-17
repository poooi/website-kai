import { notFound } from 'next/navigation'

/**
 * method to fetch remote resource
 * @param url the remote url to fetch
 * @returns new Response for the server to return
 */
export const reverseFetch = async (url: string) => {
  const resp = await fetch(url)
  if (!resp.ok) {
    notFound()
  }
  return new Response(resp.body, {
    headers: { ...resp.headers, 'X-Poi-Real-Url': url },
  })
}
