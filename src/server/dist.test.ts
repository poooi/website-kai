import { describe, expect, it } from 'vitest'

import { poiVersionsUrl, type FetchLike } from '~/lib/fetch-poi-versions'
import { handleDist } from './dist'

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

const versionsResponse = () =>
  new Response(
    JSON.stringify({
      version: 'v10.9.2',
      betaVersion: 'v11.0.0-beta.6',
    }),
  )

describe('handleDist', () => {
  it('redirects release artifacts to GitHub by default', async () => {
    const response = await handleDist(makeRequest('/dist/poi-10.9.2-win.7z'), {
      filename: 'poi-10.9.2-win.7z',
    })

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe(
      'https://github.com/poooi/poi/releases/download/v10.9.2/poi-10.9.2-win.7z',
    )
  })

  it('redirects release artifacts to npm mirror for China', async () => {
    const response = await handleDist(
      makeRequest('/dist/poi-10.9.2-win.7z', {
        headers: { 'CF-IPCountry': 'CN' },
      }),
      { filename: 'poi-10.9.2-win.7z' },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe(
      'https://registry.npmmirror.com/-/binary/poi/v10.9.2/poi-10.9.2-win.7z',
    )
  })

  it('supports multi-digit beta release artifact tags', async () => {
    const response = await handleDist(
      makeRequest('/dist/poi-11.0.0-beta.10-win.7z'),
      { filename: 'poi-11.0.0-beta.10-win.7z' },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe(
      'https://github.com/poooi/poi/releases/download/v11.0.0-beta.10/poi-11.0.0-beta.10-win.7z',
    )
  })

  it('streams latest yml variants from the stable release', async () => {
    const target =
      'https://github.com/poooi/poi/releases/download/v10.9.2/latest-mac.yml'
    const fetcher = mockFetch({
      [poiVersionsUrl]: versionsResponse(),
      [target]: new Response('stable-yml'),
    })

    const response = await handleDist(
      makeRequest('/dist/latest-mac.yml'),
      { filename: 'latest-mac.yml' },
      { fetcher },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Poi-Real-Url')).toBe(target)
    await expect(response.text()).resolves.toBe('stable-yml')
  })

  it('maps beta yml variants to latest yml filenames in the beta release', async () => {
    const target =
      'https://github.com/poooi/poi/releases/download/v11.0.0-beta.6/latest-mac.yml'
    const fetcher = mockFetch({
      [poiVersionsUrl]: versionsResponse(),
      [target]: new Response('beta-yml'),
    })

    const response = await handleDist(
      makeRequest('/dist/beta-mac.yml'),
      { filename: 'beta-mac.yml' },
      { fetcher },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Poi-Real-Url')).toBe(target)
    await expect(response.text()).resolves.toBe('beta-yml')
  })

  it('rejects nested filenames', async () => {
    const response = await handleDist(makeRequest('/dist/nested/file.exe'), {
      filename: 'nested/file.exe',
    })

    expect(response.status).toBe(404)
  })

  it('rejects unsupported yml filenames', async () => {
    const response = await handleDist(
      makeRequest('/dist/canary.yml'),
      { filename: 'canary.yml' },
      { fetcher: mockFetch({ [poiVersionsUrl]: versionsResponse() }) },
    )

    expect(response.status).toBe(404)
  })

  it('maps invalid latest json schema to 502', async () => {
    const response = await handleDist(
      makeRequest('/dist/latest.yml'),
      { filename: 'latest.yml' },
      { fetcher: mockFetch({ [poiVersionsUrl]: new Response('{}') }) },
    )

    expect(response.status).toBe(502)
  })

  it('maps upstream network failure to 504', async () => {
    const response = await handleDist(
      makeRequest('/dist/latest.yml'),
      { filename: 'latest.yml' },
      {
        fetcher: mockFetch({
          [poiVersionsUrl]: new Error('network failure'),
        }),
      },
    )

    expect(response.status).toBe(504)
  })
})
