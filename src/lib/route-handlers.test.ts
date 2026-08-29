import { describe, expect, it } from 'vitest'

import { changelogSchema } from './changelog'
import { poiVersionsUrl, type FetchLike } from './fetch-poi-versions'
import {
  handleChangelog,
  handleDist,
  handleFcd,
  handleStatus,
  handleUpdate,
} from './route-handlers'

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

describe('handleStatus', () => {
  it('returns status json with Cloudflare country header', async () => {
    const response = handleStatus(
      makeRequest('/status', { headers: { 'CF-IPCountry': 'JP' } }),
    )

    await expect(response.json()).resolves.toEqual({
      message: 'poi poi poi!',
      region: 'JP',
    })
  })
})

describe('handleFcd', () => {
  it('streams fcd json and preserves X-Poi-Real-Url', async () => {
    const target =
      'https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/meta.json'
    const fetcher = mockFetch({
      [target]: new Response(JSON.stringify([{ name: 'map' }])),
    })

    const response = await handleFcd(
      makeRequest('/fcd/meta.json'),
      { filename: 'meta.json' },
      { fetcher },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('X-Poi-Real-Url')).toBe(target)
    await expect(response.json()).resolves.toEqual([{ name: 'map' }])
  })

  it('passes upstream response bodies through as streams', async () => {
    const target =
      'https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/large.json'
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"items":['))
        controller.enqueue(new TextEncoder().encode('"large"'))
        controller.enqueue(new TextEncoder().encode(']}'))
        controller.close()
      },
    })
    const fetcher = mockFetch({
      [target]: new Response(body),
    })

    const response = await handleFcd(
      makeRequest('/fcd/large.json'),
      { filename: 'large.json' },
      { fetcher },
    )

    expect(response.status).toBe(200)
    expect(response.body).toBe(body)
    await expect(response.json()).resolves.toEqual({ items: ['large'] })
  })

  it('rejects invalid filenames', async () => {
    const response = await handleFcd(makeRequest('/fcd/meta.md'), {
      filename: 'meta.md',
    })

    expect(response.status).toBe(404)
  })

  it('maps upstream 404 to 404', async () => {
    const response = await handleFcd(
      makeRequest('/fcd/meta.json'),
      { filename: 'meta.json' },
      { fetcher: mockFetch({}) },
    )

    expect(response.status).toBe(404)
  })

  it('maps upstream server errors to 502', async () => {
    const target =
      'https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/meta.json'
    const response = await handleFcd(
      makeRequest('/fcd/meta.json'),
      { filename: 'meta.json' },
      { fetcher: mockFetch({ [target]: new Response('', { status: 500 }) }) },
    )

    expect(response.status).toBe(502)
  })

  it('maps final proxy network failure to 504', async () => {
    const target =
      'https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/meta.json'
    const response = await handleFcd(
      makeRequest('/fcd/meta.json'),
      { filename: 'meta.json' },
      { fetcher: mockFetch({ [target]: new Error('network failure') }) },
    )

    expect(response.status).toBe(504)
  })

  it('aborts final proxy fetches on timeout', async () => {
    let upstreamSignal: AbortSignal | null | undefined
    const fetcher: FetchLike = async (_input, init) => {
      upstreamSignal = init?.signal
      return await new Promise<Response>(() => undefined)
    }

    const response = await handleFcd(
      makeRequest('/fcd/meta.json'),
      { filename: 'meta.json' },
      { fetcher, timeoutMs: 1 },
    )

    expect(response.status).toBe(504)
    expect(upstreamSignal?.aborted).toBe(true)
  })
})

describe('handleUpdate', () => {
  it('allows json and markdown update files', async () => {
    const jsonTarget =
      'https://raw.githubusercontent.com/poooi/poi-release/master/update.json'
    const mdTarget =
      'https://raw.githubusercontent.com/poooi/poi-release/master/notes.md'
    const fetcher = mockFetch({
      [jsonTarget]: new Response('{}'),
      [mdTarget]: new Response('# notes'),
    })

    const jsonResponse = await handleUpdate(
      makeRequest('/update/update.json'),
      { filename: 'update.json' },
      { fetcher },
    )
    const mdResponse = await handleUpdate(
      makeRequest('/update/notes.md'),
      { filename: 'notes.md' },
      { fetcher },
    )

    expect(jsonResponse.status).toBe(200)
    expect(jsonResponse.headers.get('Content-Type')).toBe('application/json')
    expect(mdResponse.status).toBe(200)
    await expect(mdResponse.text()).resolves.toBe('# notes')
  })

  it('rejects unsupported update extensions', async () => {
    const response = await handleUpdate(makeRequest('/update/file.exe'), {
      filename: 'file.exe',
    })

    expect(response.status).toBe(404)
  })
})

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
