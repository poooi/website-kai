import { beforeEach, describe, expect, it, vi } from 'vitest'

import { socialImageHeadResponse, socialImageResponse } from './social-image'

const mocks = vi.hoisted(() => ({
  assetFetch: vi.fn<(request: Request) => Promise<Response>>(),
  createSocialImageResponse:
    vi.fn<
      (fetchAsset: (pathname: string) => Promise<Response>) => Promise<Response>
    >(),
}))

vi.mock('cloudflare:workers', () => ({
  env: { ASSETS: { fetch: mocks.assetFetch } },
}))

vi.mock('~/lib/social-image', () => ({
  createSocialImageResponse: mocks.createSocialImageResponse,
}))

beforeEach(() => {
  mocks.assetFetch.mockReset()
  mocks.assetFetch.mockResolvedValue(new Response('<svg/>'))
  mocks.createSocialImageResponse.mockReset()
  mocks.createSocialImageResponse.mockImplementation(async (fetchAsset) => {
    const response = await fetchAsset('/social/poi.svg')
    return new Response(response.body, { status: 200 })
  })
})

describe('socialImageHeadResponse', () => {
  it('answers with social image headers and no body', async () => {
    const response = socialImageHeadResponse()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public,max-age=3600')
    expect(response.headers.get('Content-Type')).toBe('image/png')
    await expect(response.arrayBuffer()).resolves.toHaveProperty(
      'byteLength',
      0,
    )
    expect(mocks.createSocialImageResponse).not.toHaveBeenCalled()
  })
})

describe('socialImageResponse', () => {
  it('reads assets through the ASSETS binding with a fresh GET request', async () => {
    const response = await socialImageResponse(
      new Request('https://poi.moe/opengraph-image?from=unit#social', {
        headers: {
          'If-Modified-Since': 'Tue, 30 Jun 2026 00:00:00 GMT',
          'If-None-Match': '*',
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(mocks.assetFetch).toHaveBeenCalledOnce()
    const [assetRequest] = mocks.assetFetch.mock.calls[0] ?? []
    expect(assetRequest?.method).toBe('GET')
    expect(assetRequest?.url).toBe('https://poi.moe/social/poi.svg')
    expect(assetRequest?.headers.get('If-None-Match')).toBeNull()
    expect(assetRequest?.headers.get('If-Modified-Since')).toBeNull()
  })
})
