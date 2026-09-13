import { describe, expect, it, vi } from 'vitest'
import {
  fetchChangelogPage,
  fetchReleaseHistory,
  releaseHistorySchema,
  releaseHistoryUrl,
} from './release-history.server'
import { type FetchLike } from './fetch-poi-versions'

const original = (markdown: string) => ({
  markdown,
  source: 'https://github.com/poooi/poi/releases/tag/v1.0.0',
  reconstructed: false,
})
const history = [
  {
    version: 'v1.0.0',
    publishedAt: '2015-06-12T12:34:13Z',
    notes: {
      'en-US': original(
        '# Features\n\nHello world!\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))',
      ),
    },
  },
  {
    version: 'v11.0.0',
    publishedAt: '2025-10-17T20:57:55Z',
    notes: {
      'en-US': original('Older English'),
      'zh-CN': original('历史中文'),
      'ja-JP': original('日本語'),
    },
  },
  {
    version: 'v12.0.1',
    publishedAt: '2026-08-29T16:26:18Z',
    notes: { 'en-US': original('Archived copy') },
  },
]
const mockFetch =
  (archived: Response | Error = Response.json(history)): FetchLike =>
  async () => {
    if (archived instanceof Error) throw archived
    return archived.clone()
  }

describe('release history', () => {
  it('renders recovered Weibo main notes without archived plugin updates', async () => {
    const entries = await fetchReleaseHistory('zh-Hans', {
      fetcher: mockFetch(
        Response.json([
          {
            ...history[0],
            notes: {
              'en-US': original('English'),
              'zh-CN': {
                markdown: '### 功能\n\n- 插件自动更新',
                pluginMarkdown: '### 插件更新\n\n- 未卜先知新功能',
                source: 'https://m.weibo.cn/detail/4081524570241818',
                reconstructed: false,
              },
            },
          },
        ]),
      ),
    })
    expect(entries[0]).toMatchObject({
      source: 'https://m.weibo.cn/detail/4081524570241818',
      language: 'zh-CN',
      reconstructed: false,
    })
    expect(entries[0]!.html).toContain('插件自动更新')
    expect(entries[0]!.html).not.toContain('未卜先知')
    for (const source of [
      'https://m.weibo.cn.evil.test/detail/123',
      'https://m.weibo.cn/detail/123?redirect=evil',
      'http://m.weibo.cn/detail/123',
    ]) {
      expect(
        releaseHistorySchema.safeParse([
          {
            ...history[0],
            notes: { 'en-US': { ...original('notes'), source } },
          },
        ]).success,
      ).toBe(false)
    }
  })
  it('sorts by version, preserves available translations and falls back per release', async () => {
    const entries = await fetchReleaseHistory('zh-Hans', {
      fetcher: mockFetch(),
    })
    expect(entries.map((entry) => entry.version)).toEqual([
      'v12.0.1',
      'v11.0.0',
      'v1.0.0',
    ])
    expect(entries[1]).toMatchObject({
      language: 'zh-CN',
      html: '<p>历史中文</p>',
    })
    expect(entries[2]).toMatchObject({
      language: 'en-US',
      publishedAt: '2015-06-12T12:34:13Z',
    })
    expect(entries[2]!.html).toContain('<h3>Features</h3>')
    expect(entries[2]!.html).not.toContain('<script>')
    expect(entries[2]!.html).not.toContain('javascript:')
    const japanese = await fetchReleaseHistory('ja', { fetcher: mockFetch() })
    expect(japanese[1]!.language).toBe('ja-JP')
    const french = await fetchReleaseHistory('fr', { fetcher: mockFetch() })
    expect(french.every((entry) => entry.language === 'en-US')).toBe(true)
  })

  it('loads the page exclusively from the archive', async () => {
    const fetcher = vi.fn(mockFetch())
    const result = await fetchChangelogPage('en', { fetcher })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]![0]).toBe(releaseHistoryUrl)
    expect(result.history[0]).toMatchObject({
      version: 'v12.0.1',
      publishedAt: '2026-08-29T16:26:18Z',
      html: '<p>Archived copy</p>',
    })
    expect(result.available).toBe(true)
  })

  it('reports unavailable data without fetching channel files as a fallback', async () => {
    const fetcher = vi.fn(mockFetch(new Response('', { status: 404 })))
    const result = await fetchChangelogPage('en', { fetcher })
    expect(result).toEqual({ history: [], available: false })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('rejects prereleases, special tags, duplicate versions and unsafe source URLs', () => {
    for (const version of ['v12.0.0-beta.1', 'v11.1.0-win7']) {
      expect(
        releaseHistorySchema.safeParse([{ ...history[0], version }]).success,
      ).toBe(false)
    }
    expect(
      releaseHistorySchema.safeParse([history[0], history[0]]).success,
    ).toBe(false)
    expect(
      releaseHistorySchema.safeParse([
        {
          ...history[0],
          notes: {
            'en-US': { ...original('notes'), source: 'javascript:alert(1)' },
          },
        },
      ]).success,
    ).toBe(false)
  })

  it('does not label reconstructed notes as original', async () => {
    const reconstructed = [
      {
        ...history[0],
        notes: {
          'en-US': { ...original('Restored notes'), reconstructed: true },
        },
      },
    ]
    const entries = await fetchReleaseHistory('en', {
      fetcher: mockFetch(Response.json(reconstructed)),
    })
    expect(entries[0]!.reconstructed).toBe(true)
  })
})
