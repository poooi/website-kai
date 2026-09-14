import { describe, expect, it } from 'vitest'

import { changelogSchema } from '~/lib/changelog'
import type { FetchLike } from '~/lib/fetch-poi-versions'
import { handleChangelog } from './changelog'

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

const changelogUrlFor = (filename: string) =>
  `https://raw.githubusercontent.com/poooi/poi-release/master/${filename}`

describe('handleChangelog', () => {
  it('renders the changelog of the requested locale as sanitized html', async () => {
    const fetcher = mockFetch({
      [changelogUrlFor('zh-CN.md')]: new Response(`## 更新

- 修复了<script>alert(1)</script>问题
`),
    })

    const response = await handleChangelog(
      makeRequest('/api/changelog/stable?locale=zh-Hans'),
      { channel: 'stable' },
      { fetcher },
    )

    expect(response.status).toBe(200)
    const payload = changelogSchema.parse(await response.json())
    expect(payload.language).toBe('zh-CN')
    expect(payload.html).toContain('<h2>更新</h2>')
    expect(payload.html).toContain('<li>修复了alert(1)问题</li>')
    expect(payload.html).not.toContain('<script>')
  })

  it('appends the beta suffix for the beta channel', async () => {
    const fetcher = mockFetch({
      [changelogUrlFor('ja-JP-beta.md')]: new Response('# beta'),
    })

    const response = await handleChangelog(
      makeRequest('/api/changelog/beta?locale=ja'),
      { channel: 'beta' },
      { fetcher },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      html: '<h1>beta</h1>',
      language: 'ja-JP',
    })
  })

  it('falls back to en-US when the locale has no changelog', async () => {
    const fetcher = mockFetch({
      [changelogUrlFor('ko-KR.md')]: new Response('', { status: 404 }),
      [changelogUrlFor('en-US.md')]: new Response('# english'),
    })

    const response = await handleChangelog(
      makeRequest('/api/changelog/stable?locale=ko'),
      { channel: 'stable' },
      { fetcher },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      html: '<h1>english</h1>',
      language: 'en-US',
    })
  })

  it('reports upstream failures instead of falling back', async () => {
    const fetcher = mockFetch({
      [changelogUrlFor('fr-FR.md')]: new Response('', { status: 500 }),
      [changelogUrlFor('en-US.md')]: new Response('# english'),
    })

    const response = await handleChangelog(
      makeRequest('/api/changelog/stable?locale=fr'),
      { channel: 'stable' },
      { fetcher },
    )

    expect(response.status).toBe(502)
  })

  it('404s when even the fallback changelog is missing', async () => {
    const response = await handleChangelog(
      makeRequest('/api/changelog/stable?locale=en'),
      { channel: 'stable' },
      { fetcher: mockFetch({}) },
    )

    expect(response.status).toBe(404)
  })

  it('rejects unknown channels', async () => {
    const response = await handleChangelog(
      makeRequest('/api/changelog/nightly'),
      { channel: 'nightly' },
    )

    expect(response.status).toBe(404)
  })
})
