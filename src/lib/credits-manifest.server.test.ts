import { describe, expect, it, vi } from 'vitest'

import { fetchCreditsManifest } from './credits-manifest.server'

const validPayload = {
  schemaVersion: 1,
  version: 'v1',
  cellSize: 96,
  displaySize: 48,
  pixelRatio: 2,
  sheets: [{ url: 'avatars-0.0123456789abcdef.webp', width: 96, height: 192 }],
  avatars: {
    a: { sheet: 0, x: 0, y: 0, width: 96, height: 96 },
    c: { sheet: 0, x: 0, y: 96, width: 96, height: 96 },
  },
  contributors: [
    {
      id: 'a',
      login: 'alice',
      name: null,
      profile: 'https://github.com/alice',
    },
    {
      id: 'b',
      login: 'bob',
      name: '  Bobby  ',
      profile: 'https://github.com/bob',
    },
  ],
  supporters: [
    { id: 'c', memberId: 7, name: null, profile: null },
    {
      id: 'd',
      memberId: '8',
      name: 'Tess',
      profile: 'https://opencollective.com/tess',
    },
  ],
}

const jsonFetcher = (body: unknown, status = 200) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
  ) as unknown as typeof fetch

describe('fetchCreditsManifest', () => {
  it('normalizes names, ids and sprite lookups', async () => {
    const { manifest, available } = await fetchCreditsManifest({
      fetcher: jsonFetcher(validPayload),
    })

    expect(available).toBe(true)
    expect(manifest?.displaySize).toBe(48)
    expect(manifest?.sheets).toEqual(validPayload.sheets)
    expect(manifest?.contributors).toEqual([
      {
        id: 'a',
        login: 'alice',
        name: 'alice',
        profile: 'https://github.com/alice',
        avatar: validPayload.avatars.a,
      },
      {
        id: 'b',
        login: 'bob',
        name: 'Bobby',
        profile: 'https://github.com/bob',
        avatar: undefined,
      },
    ])
    expect(manifest?.supporters).toEqual([
      { id: 'c', memberId: '7', name: '', avatar: validPayload.avatars.c },
      {
        id: 'd',
        memberId: '8',
        name: 'Tess',
        profile: 'https://opencollective.com/tess',
        avatar: undefined,
      },
    ])
  })

  it('treats an empty avatar map as avatar-free', async () => {
    const { manifest, available } = await fetchCreditsManifest({
      fetcher: jsonFetcher({ ...validPayload, avatars: {} }),
    })

    expect(available).toBe(true)
    expect(manifest?.contributors[0]?.avatar).toBeUndefined()
    expect(manifest?.supporters[0]?.avatar).toBeUndefined()
  })

  it('requires the avatar map and the 96/48/2 geometry', async () => {
    for (const payload of [
      { ...validPayload, avatars: undefined },
      { ...validPayload, cellSize: 64 },
      { ...validPayload, displaySize: 64 },
      { ...validPayload, pixelRatio: 1 },
      {
        ...validPayload,
        avatars: { a: { sheet: 0, x: 0, y: 0, width: 48, height: 48 } },
      },
    ])
      expect(
        (await fetchCreditsManifest({ fetcher: jsonFetcher(payload) }))
          .available,
      ).toBe(false)
  })

  it('rejects avatars outside their sheet bounds', async () => {
    const { available } = await fetchCreditsManifest({
      fetcher: jsonFetcher({
        ...validPayload,
        avatars: { a: { sheet: 0, x: 10, y: 0, width: 96, height: 96 } },
      }),
    })

    expect(available).toBe(false)
  })

  it('rejects avatars pointing at a missing sheet', async () => {
    const { available } = await fetchCreditsManifest({
      fetcher: jsonFetcher({
        ...validPayload,
        avatars: { a: { sheet: 9, x: 0, y: 0, width: 96, height: 96 } },
      }),
    })

    expect(available).toBe(false)
  })

  it('rejects sheet filenames that are not relative hashed webp', async () => {
    const { available } = await fetchCreditsManifest({
      fetcher: jsonFetcher({
        ...validPayload,
        sheets: [{ url: 'avatars-0.webp', width: 96, height: 192 }],
      }),
    })

    expect(available).toBe(false)
  })

  it('reports unavailable when the source fails', async () => {
    const { manifest, available } = await fetchCreditsManifest({
      fetcher: jsonFetcher({}, 500),
    })

    expect(available).toBe(false)
    expect(manifest).toBeUndefined()
  })

  it('reports unavailable when the source throws', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    const { available } = await fetchCreditsManifest({ fetcher })

    expect(available).toBe(false)
  })
})
