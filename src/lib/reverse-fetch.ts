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
  const fullfilled = new Response(resp.body, resp)
  fullfilled.headers.set('X-Poi-Real-Url', url)
  if (url.endsWith('.json')) {
    fullfilled.headers.set('Content-Type', 'application/json')
  }
  return fullfilled
}
