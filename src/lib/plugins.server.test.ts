import { describe, expect, it, vi } from 'vitest'

import { type FetchLike } from './fetch-poi-versions'
import { catalogSchema, fetchPlugins, pluginCatalogUrl } from './plugins.server'

const catalog = {
  'poi-plugin-alpha': {
    name: { 'en-US': 'Alpha', 'ja-JP': 'アルファ', 'zh-CN': '阿尔法' },
    description: {
      'en-US': 'First plugin with a [link](https://example.com)',
      'ja-JP': '最初のプラグイン',
      'zh-CN': '第一个插件',
    },
    version: 'v0.0.0',
    icon: 'book',
    author: 'Author One',
    link: 'https://github.com/author-one',
  },
  'poi-plugin-beta': {
    name: { 'en-US': 'Beta' },
    description: {
      'en-US':
        'Second plugin<script>alert(1)</script> with a [bad](javascript:alert(1)) link',
    },
    version: 'v0.0.0',
    icon: 'wrench',
    author: 'Author Two',
    link: 'https://github.com/author-two',
  },
  'poi-plugin-gamma': {
    name: { 'en-US': 'Gamma', 'ja-JP': 'ガンマ' },
    description: { 'en-US': 'Third plugin' },
    version: 'v0.0.0',
    icon: 'rocket',
    author: 'Author Three',
    link: 'https://github.com/author-three',
  },
}

const mockFetch =
  (payload: unknown, init?: ResponseInit): FetchLike =>
  async () =>
    Response.json(payload, init)

const find = (result: Awaited<ReturnType<typeof fetchPlugins>>, id: string) =>
  result.plugins.find((plugin) => plugin.id === id)!

describe('plugin catalog', () => {
  it('localizes names and descriptions with an English fallback per field', async () => {
    const japanese = await fetchPlugins('ja', { fetcher: mockFetch(catalog) })
    expect(japanese.available).toBe(true)
    expect(japanese.plugins).toHaveLength(3)
    expect(find(japanese, 'poi-plugin-alpha')).toMatchObject({
      name: 'アルファ',
      nameLanguage: 'ja-JP',
      descriptionLanguage: 'ja-JP',
      author: 'Author One',
      authorUrl: 'https://github.com/author-one',
      url: 'https://www.npmjs.com/package/poi-plugin-alpha',
    })
    expect(find(japanese, 'poi-plugin-alpha').icon?.path).toBeTruthy()
    expect(find(japanese, 'poi-plugin-alpha').icon?.viewBox).toMatch(
      /^0 0 \d+ \d+$/,
    )
    expect(find(japanese, 'poi-plugin-alpha').html).toContain(
      '最初のプラグイン',
    )
    expect(find(japanese, 'poi-plugin-beta')).toMatchObject({
      name: 'Beta',
      nameLanguage: 'en-US',
      descriptionLanguage: 'en-US',
    })
    expect(find(japanese, 'poi-plugin-gamma')).toMatchObject({
      name: 'ガンマ',
      nameLanguage: 'ja-JP',
      descriptionLanguage: 'en-US',
    })
    expect(find(japanese, 'poi-plugin-gamma').html).toContain('Third plugin')

    const simplified = await fetchPlugins('zh-Hans', {
      fetcher: mockFetch(catalog),
    })
    expect(find(simplified, 'poi-plugin-alpha')).toMatchObject({
      name: '阿尔法',
      nameLanguage: 'zh-CN',
    })

    const traditional = await fetchPlugins('zh-Hant', {
      fetcher: mockFetch(catalog),
    })
    expect(find(traditional, 'poi-plugin-alpha')).toMatchObject({
      name: 'Alpha',
      nameLanguage: 'en-US',
    })

    const french = await fetchPlugins('fr', { fetcher: mockFetch(catalog) })
    expect(
      french.plugins.every(
        (plugin) =>
          plugin.nameLanguage === 'en-US' &&
          plugin.descriptionLanguage === 'en-US',
      ),
    ).toBe(true)
  })

  it('renders sanitized Markdown descriptions', async () => {
    const result = await fetchPlugins('en', { fetcher: mockFetch(catalog) })
    const alpha = find(result, 'poi-plugin-alpha')
    expect(alpha.html).toContain('<a href="https://example.com"')
    expect(alpha.html).toContain('link</a>')
    const beta = find(result, 'poi-plugin-beta')
    expect(beta.html).not.toContain('<script')
    expect(beta.html).not.toContain('javascript:')
    expect(beta.html).not.toContain('<a href')
    expect(beta.html).toContain('bad')
  })

  it('merges a release version and an explicit UTC date', async () => {
    const result = await fetchPlugins('en', {
      fetcher: mockFetch(catalog),
      releases: {
        'poi-plugin-alpha': {
          version: '1.2.3',
          publishedAt: '2024-01-02T23:30:00.000Z',
        },
      },
    })
    expect(find(result, 'poi-plugin-alpha').release).toEqual({
      version: '1.2.3',
      publishedAt: '2024-01-02T23:30:00.000Z',
      date: 'Jan 2, 2024',
    })
    expect(find(result, 'poi-plugin-beta').release).toBeUndefined()
  })

  it('builds searchable text from the package id, all names, description and author', async () => {
    const result = await fetchPlugins('en', { fetcher: mockFetch(catalog) })
    const alpha = find(result, 'poi-plugin-alpha')
    for (const term of [
      'poi-plugin-alpha',
      'alpha',
      'アルファ',
      '阿尔法',
      'first plugin',
      'author one',
    ])
      expect(alpha.searchText).toContain(term)
    expect(alpha.searchText).toBe(alpha.searchText.toLowerCase())
  })

  it('requests the upstream catalog through the shared cache helper', async () => {
    const fetcher = vi.fn(mockFetch(catalog))
    await fetchPlugins('en', { fetcher })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]![0]).toBe(pluginCatalogUrl)
  })

  it('rejects malformed upstream catalogs', () => {
    const base = catalog['poi-plugin-alpha']
    for (const [id, plugin] of [
      ['plugin-alpha', base],
      ['poi-plugin-alpha', { ...base, name: { 'ja-JP': 'アルファ' } }],
      ['poi-plugin-alpha', { ...base, link: 'ftp://example.com' }],
      [
        'poi-plugin-alpha',
        {
          name: base.name,
          icon: base.icon,
          author: base.author,
          link: base.link,
        },
      ],
    ] as const)
      expect(catalogSchema.safeParse({ [id]: plugin }).success).toBe(false)
  })

  it('reports an unavailable catalog on upstream or validation failure', async () => {
    const failing: FetchLike = async () => {
      throw new Error('network down')
    }
    expect(await fetchPlugins('en', { fetcher: failing })).toEqual({
      plugins: [],
      available: false,
    })
    expect(
      await fetchPlugins('en', { fetcher: mockFetch({}, { status: 404 }) }),
    ).toEqual({ plugins: [], available: false })
    expect(
      await fetchPlugins('en', {
        fetcher: mockFetch({ 'plugin-bad': catalog['poi-plugin-alpha'] }),
      }),
    ).toEqual({ plugins: [], available: false })
  })

  it('reads the build-time fixture when no custom fetcher is provided', async () => {
    const previous = process.env.TANSTACK_TEST_PLUGINS
    process.env.TANSTACK_TEST_PLUGINS = JSON.stringify(catalog)
    try {
      const result = await fetchPlugins('en')
      expect(result.available).toBe(true)
      expect(result.plugins).toHaveLength(3)
    } finally {
      if (previous === undefined) delete process.env.TANSTACK_TEST_PLUGINS
      else process.env.TANSTACK_TEST_PLUGINS = previous
    }
  })
})
