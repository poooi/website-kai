import { describe, expect, it, vi } from 'vitest'

import { type FetchLike } from './fetch-poi-versions'
import { pluginCatalogUrl } from './plugin-catalog'
import {
  fetchPluginRelease,
  formatPluginReleaseDate,
  parsePluginReleaseSnapshot,
  pluginReleasesKey,
  readPluginReleases,
  refreshPluginReleases,
  selectLatestRelease,
  type PluginReleaseStore,
} from './plugin-releases.server'

const catalog = {
  'poi-plugin-alpha': {
    name: { 'en-US': 'Alpha' },
    description: { 'en-US': 'Alpha description' },
    icon: 'book',
    author: 'Author One',
    link: 'https://github.com/author-one',
  },
  'poi-plugin-beta': {
    name: { 'en-US': 'Beta' },
    description: { 'en-US': 'Beta description' },
    icon: 'wrench',
    author: 'Author Two',
    link: 'https://github.com/author-two',
  },
  'poi-plugin-gamma': {
    name: { 'en-US': 'Gamma' },
    description: { 'en-US': 'Gamma description' },
    icon: 'rocket',
    author: 'Author Three',
    link: 'https://github.com/author-three',
  },
}

const registry = (version: string, publishedAt: string) => ({
  'dist-tags': { latest: version, next: '9.9.9' },
  time: {
    [version]: publishedAt,
    '9.9.9': '2099-12-31T00:00:00.000Z',
    modified: '2099-12-31T00:00:00.000Z',
  },
})

const createStore = (initial: string | null = null) => {
  const puts: Array<{ key: string; value: string }> = []
  const store: PluginReleaseStore = {
    async get() {
      return initial
    },
    async put(key, value) {
      puts.push({ key, value })
    },
  }
  return { store, puts }
}

type RegistryScript = unknown

const inputUrl = (input: Parameters<FetchLike>[0]) =>
  input instanceof URL
    ? input.href
    : typeof input === 'string'
      ? input
      : input.url

const createFetcher = (script: {
  catalog?: unknown
  registries?: Record<string, RegistryScript>
  delayMs?: number
}) => {
  let active = 0
  let peak = 0
  const fetcher: FetchLike = async (input) => {
    const url = inputUrl(input)
    if (url === pluginCatalogUrl) {
      if (script.catalog instanceof Error) throw script.catalog
      if (typeof script.catalog === 'number')
        return new Response('', { status: script.catalog })
      return Response.json(script.catalog)
    }
    const id = decodeURIComponent(url.split('/').pop() ?? '')
    active += 1
    peak = Math.max(peak, active)
    await new Promise((resolve) => setTimeout(resolve, script.delayMs ?? 1))
    active -= 1
    const entry = script.registries?.[id]
    if (entry instanceof Error) throw entry
    if (typeof entry === 'number') return new Response('', { status: entry })
    if (entry === undefined) return new Response('', { status: 404 })
    return Response.json(entry)
  }
  return { fetcher, peak: () => peak }
}

describe('selectLatestRelease', () => {
  it('uses dist-tags.latest even when it is not the chronologically last publish', () => {
    expect(
      selectLatestRelease({
        'dist-tags': { latest: '1.0.0' },
        time: {
          '1.0.0': '2020-02-02T00:00:00.000Z',
          '0.9.0': '2024-03-03T00:00:00.000Z',
          modified: '2025-05-05T00:00:00.000Z',
        },
      }),
    ).toEqual({ version: '1.0.0', publishedAt: '2020-02-02T00:00:00.000Z' })
  })

  it('rejects malformed registries', () => {
    expect(selectLatestRelease(undefined)).toBeUndefined()
    expect(selectLatestRelease({ 'dist-tags': {}, time: {} })).toBeUndefined()
    expect(
      selectLatestRelease({ 'dist-tags': { latest: '1.0.0' }, time: {} }),
    ).toBeUndefined()
    expect(
      selectLatestRelease({
        'dist-tags': { latest: '1.0.0' },
        time: { '1.0.0': 'not-a-date' },
      }),
    ).toBeUndefined()
  })
})

describe('readPluginReleases', () => {
  it('is tolerant of a missing store, read failure and malformed data', async () => {
    expect(await readPluginReleases(undefined)).toEqual({})
    expect(
      await readPluginReleases({
        async get() {
          throw new Error('kv down')
        },
        async put() {
          return
        },
      }),
    ).toEqual({})
    expect(
      await readPluginReleases({
        async get() {
          return '{not json'
        },
        async put() {
          return
        },
      }),
    ).toEqual({})
    expect(
      await readPluginReleases({
        async get() {
          return JSON.stringify({ 'poi-plugin-x': { version: 3 } })
        },
        async put() {
          return
        },
      }),
    ).toEqual({})
  })

  it('parses a valid snapshot', async () => {
    expect(parsePluginReleaseSnapshot(null)).toEqual({})
    expect(parsePluginReleaseSnapshot('{"poi-plugin-x":{}}')).toEqual({})
    const snapshot = {
      'poi-plugin-alpha': {
        version: '1.0.0',
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    }
    const { store } = createStore(JSON.stringify(snapshot))
    expect(await readPluginReleases(store)).toEqual(snapshot)
  })
})

describe('fetchPluginRelease', () => {
  it('returns the latest version and treats non-200 as absent', async () => {
    const ok = createFetcher({
      registries: {
        'poi-plugin-alpha': registry('1.2.3', '2021-01-01T00:00:00.000Z'),
      },
    })
    expect(
      await fetchPluginRelease('poi-plugin-alpha', { fetcher: ok.fetcher }),
    ).toEqual({ version: '1.2.3', publishedAt: '2021-01-01T00:00:00.000Z' })

    const rateLimited = createFetcher({
      registries: { 'poi-plugin-alpha': 429 },
    })
    expect(
      await fetchPluginRelease('poi-plugin-alpha', {
        fetcher: rateLimited.fetcher,
      }),
    ).toBeUndefined()
  })
})

describe('refreshPluginReleases', () => {
  const previous = {
    'poi-plugin-alpha': {
      version: '0.1.0',
      publishedAt: '2019-01-01T00:00:00.000Z',
    },
    'poi-plugin-beta': {
      version: '0.2.0',
      publishedAt: '2019-02-02T00:00:00.000Z',
    },
  }

  it('returns early without fetching when the store is missing', async () => {
    const { fetcher } = createFetcher({ catalog, registries: {} })
    const spy = vi.fn(fetcher)
    expect(await refreshPluginReleases(undefined, { fetcher: spy })).toEqual({})
    expect(spy).not.toHaveBeenCalled()
  })

  it('aborts before writing when the previous snapshot cannot be read', async () => {
    const put = vi.fn()
    const store: PluginReleaseStore = {
      async get() {
        throw new Error('kv get failed')
      },
      async put() {
        put()
      },
    }
    await expect(
      refreshPluginReleases(store, {
        fetcher: createFetcher({ catalog, registries: {} }).fetcher,
      }),
    ).rejects.toThrow('kv get failed')
    expect(put).not.toHaveBeenCalled()
  })

  it('aborts before writing when the previous snapshot is malformed', async () => {
    const { store, puts } = createStore(
      JSON.stringify({ 'poi-plugin-x': { version: 3 } }),
    )
    await expect(
      refreshPluginReleases(store, {
        fetcher: createFetcher({ catalog, registries: {} }).fetcher,
      }),
    ).rejects.toThrow()
    expect(puts).toEqual([])
  })

  it('aborts before writing when the catalog fetch or validation fails', async () => {
    for (const catalogScript of [
      new Error('catalog down'),
      500,
      { 'bad-id': {} },
    ]) {
      const { store, puts } = createStore()
      await expect(
        refreshPluginReleases(store, {
          fetcher: createFetcher({ catalog: catalogScript, registries: {} })
            .fetcher,
        }),
      ).rejects.toThrow()
      expect(puts).toEqual([])
    }
  })

  it('keeps previous entries on per-package failures and updates successes', async () => {
    const { store, puts } = createStore(JSON.stringify(previous))
    const { fetcher } = createFetcher({
      catalog,
      registries: {
        'poi-plugin-alpha': registry('1.2.3', '2024-04-04T00:00:00.000Z'),
        'poi-plugin-beta': 500,
        'poi-plugin-gamma': new Error('timeout'),
      },
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const snapshot = await refreshPluginReleases(store, { fetcher })
      expect(snapshot).toEqual({
        'poi-plugin-alpha': {
          version: '1.2.3',
          publishedAt: '2024-04-04T00:00:00.000Z',
        },
        'poi-plugin-beta': previous['poi-plugin-beta'],
      })
      expect(puts).toHaveLength(1)
      expect(puts[0]!.key).toBe(pluginReleasesKey)
      expect(JSON.parse(puts[0]!.value)).toEqual(snapshot)
      expect(warn).toHaveBeenCalledTimes(1)
    } finally {
      warn.mockRestore()
    }
  })

  it('keeps the whole previous snapshot when every npm request fails', async () => {
    const { store, puts } = createStore(JSON.stringify(previous))
    const { fetcher } = createFetcher({
      catalog,
      registries: {
        'poi-plugin-alpha': 500,
        'poi-plugin-beta': new Error('timeout'),
        'poi-plugin-gamma': 429,
      },
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const snapshot = await refreshPluginReleases(store, { fetcher })
      expect(snapshot).toEqual(previous)
      expect(puts).toHaveLength(1)
      expect(JSON.parse(puts[0]!.value)).toEqual(previous)
    } finally {
      warn.mockRestore()
    }
  })

  it('drops entries that are no longer in the catalog', async () => {
    const { store, puts } = createStore(
      JSON.stringify({
        ...previous,
        'poi-plugin-removed': {
          version: '9.9.9',
          publishedAt: '2018-01-01T00:00:00.000Z',
        },
      }),
    )
    const { fetcher } = createFetcher({
      catalog: { 'poi-plugin-alpha': catalog['poi-plugin-alpha'] },
      registries: {
        'poi-plugin-alpha': registry('1.2.3', '2024-04-04T00:00:00.000Z'),
      },
    })
    const snapshot = await refreshPluginReleases(store, { fetcher })
    expect(Object.keys(snapshot)).toEqual(['poi-plugin-alpha'])
    expect(JSON.parse(puts[0]!.value)).toEqual(snapshot)
  })

  it('limits concurrent npm requests to the configured limit', async () => {
    const registries = {
      'poi-plugin-alpha': registry('1.0.0', '2024-01-01T00:00:00.000Z'),
      'poi-plugin-beta': registry('1.0.0', '2024-01-01T00:00:00.000Z'),
      'poi-plugin-gamma': registry('1.0.0', '2024-01-01T00:00:00.000Z'),
    }
    const parallel = createFetcher({ catalog, registries, delayMs: 10 })
    await refreshPluginReleases(createStore().store, {
      fetcher: parallel.fetcher,
      concurrency: 3,
    })
    expect(parallel.peak()).toBeLessThanOrEqual(3)

    const serial = createFetcher({ catalog, registries, delayMs: 10 })
    await refreshPluginReleases(createStore().store, {
      fetcher: serial.fetcher,
      concurrency: 1,
    })
    expect(serial.peak()).toBe(1)
  })

  it('propagates a rejected write', async () => {
    const store: PluginReleaseStore = {
      async get() {
        return null
      },
      async put() {
        throw new Error('kv put failed')
      },
    }
    const { fetcher } = createFetcher({
      catalog: { 'poi-plugin-alpha': catalog['poi-plugin-alpha'] },
      registries: {
        'poi-plugin-alpha': registry('1.0.0', '2024-01-01T00:00:00.000Z'),
      },
    })
    await expect(refreshPluginReleases(store, { fetcher })).rejects.toThrow(
      'kv put failed',
    )
  })
})

describe('formatPluginReleaseDate', () => {
  it('formats explicitly in UTC', () => {
    expect(formatPluginReleaseDate('2024-01-02T23:30:00.000Z', 'en')).toBe(
      'Jan 2, 2024',
    )
    expect(formatPluginReleaseDate('not-a-date', 'en')).toBe('')
  })
})
