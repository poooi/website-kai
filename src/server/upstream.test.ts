import { describe, expect, it } from 'vitest'

import type { FetchLike } from '~/lib/fetch-poi-versions'
import { isSingleSegmentFilename, reverseFetch } from './upstream'

const makeRequest = (path: string, init?: RequestInit) =>
  new Request(`https://poi.moe${path}`, init)

const mockFetch = (responses: Record<string, Response | Error>): FetchLike => {
  return async (input) => {
    const url = input instanceof Request ? input.url : input.toString()
    const response = responses[url]
    if (response instanceof Error) {
      throw response
    }
    return response ?? new Response('', { status: 404 })
  }
}

const target = (filename: string) =>
  `https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/${filename}`

describe('isSingleSegmentFilename', () => {
  it.each([undefined, '', 'nested/meta.json', 'nested\\meta.json'])(
    'rejects %s',
    (filename) => {
      expect(isSingleSegmentFilename(filename)).toBe(false)
    },
  )

  it('accepts a single filename segment', () => {
    expect(isSingleSegmentFilename('meta.json')).toBe(true)
  })
})

describe('reverseFetch', () => {
  it('streams the upstream response and preserves X-Poi-Real-Url', async () => {
    const url = target('meta.json')
    const fetcher = mockFetch({
      [url]: new Response(JSON.stringify([{ name: 'map' }])),
    })

    const response = await reverseFetch(makeRequest('/fcd/meta.json'), url, {
      fetcher,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('X-Poi-Real-Url')).toBe(url)
    await expect(response.json()).resolves.toEqual([{ name: 'map' }])
  })

  it('passes upstream response bodies through as streams', async () => {
    const url = target('large.json')
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"items":['))
        controller.enqueue(new TextEncoder().encode('"large"'))
        controller.enqueue(new TextEncoder().encode(']}'))
        controller.close()
      },
    })
    const fetcher = mockFetch({ [url]: new Response(body) })

    const response = await reverseFetch(makeRequest('/fcd/large.json'), url, {
      fetcher,
    })

    expect(response.status).toBe(200)
    expect(response.body).toBe(body)
    await expect(response.json()).resolves.toEqual({ items: ['large'] })
  })

  it('maps upstream 404 to 404', async () => {
    const response = await reverseFetch(
      makeRequest('/fcd/meta.json'),
      target('meta.json'),
      { fetcher: mockFetch({}) },
    )

    expect(response.status).toBe(404)
  })

  it('maps upstream server errors to 502', async () => {
    const url = target('meta.json')
    const response = await reverseFetch(makeRequest('/fcd/meta.json'), url, {
      fetcher: mockFetch({ [url]: new Response('', { status: 500 }) }),
    })

    expect(response.status).toBe(502)
  })

  it('maps network failure to 504', async () => {
    const url = target('meta.json')
    const response = await reverseFetch(makeRequest('/fcd/meta.json'), url, {
      fetcher: mockFetch({ [url]: new Error('network failure') }),
    })

    expect(response.status).toBe(504)
  })

  it('aborts in-flight fetches on timeout', async () => {
    let upstreamSignal: AbortSignal | null | undefined
    const fetcher: FetchLike = async (_input, init) => {
      upstreamSignal = init?.signal
      return await new Promise<Response>(() => undefined)
    }

    const response = await reverseFetch(
      makeRequest('/fcd/meta.json'),
      target('meta.json'),
      { fetcher, timeoutMs: 1 },
    )

    expect(response.status).toBe(504)
    expect(upstreamSignal?.aborted).toBe(true)
  })

  it('does not force JSON content type for markdown targets', async () => {
    const url =
      'https://raw.githubusercontent.com/poooi/poi-release/master/notes.md'
    const fetcher = mockFetch({ [url]: new Response('# notes') })

    const response = await reverseFetch(makeRequest('/update/notes.md'), url, {
      fetcher,
    })

    expect(response.headers.get('Content-Type')).not.toBe('application/json')
    await expect(response.text()).resolves.toBe('# notes')
  })
})
