import { describe, expect, it, vi } from 'vitest'

import {
  contributorSchema,
  contributorsSchema,
  contributorsUrl,
  fetchContributors,
  fetchSupporters,
  parseContributors,
  parseSupporters,
  supporterSchema,
  supportersPageSize,
  supportersSchema,
  supportersUrl,
} from './contributors.server'
import { type FetchLike } from './fetch-poi-versions'

const payload = [
  {
    avatar_url:
      'https://raw.githubusercontent.com/poooi/contributors/master/assets/season.png',
    html_url: 'http://www.pixiv.net/member.php?id=3991162',
    login: 'Season千',
  },
  {
    avatar_url: 'https://avatars.githubusercontent.com/u/6753092?v=4',
    firstCommitTime: 1414281600,
    html_url: 'https://github.com/hanzhao',
    id: 6753092,
    login: 'hanzhao',
    name: 'Maggie',
    total: 889,
  },
  {
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    html_url: 'https://github.com/noname',
    login: 'noname',
    name: null,
  },
  {
    avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
    html_url: 'https://github.com/blank',
    login: 'blank',
    name: '   ',
  },
]

const mockFetch =
  (data: unknown, init?: ResponseInit): FetchLike =>
  async () =>
    Response.json(data, init)

describe('contributor schema', () => {
  it('accepts hand-added artists and ignores extra stats', () => {
    expect(contributorsSchema.safeParse(payload).success).toBe(true)
    expect(
      contributorSchema.safeParse({
        avatar_url: 'http://example.com/a.png',
        html_url: 'http://example.com/artist',
        login: 'artist',
        total: 1,
        perRepo: { 'poooi/poi': 1 },
      }).success,
    ).toBe(true)
  })

  it('requires login and http(s) avatar and profile URLs', () => {
    const base = {
      avatar_url: 'https://example.com/a.png',
      html_url: 'https://example.com/u',
      login: 'user',
    }
    for (const candidate of [
      { ...base, login: '' },
      { ...base, avatar_url: 'javascript:alert(1)' },
      { ...base, html_url: 'ftp://example.com/u' },
      { ...base, avatar_url: 'not-a-url' },
    ])
      expect(contributorSchema.safeParse(candidate).success).toBe(false)
    expect(contributorsSchema.safeParse({}).success).toBe(false)
  })
})

describe('parseContributors', () => {
  it('preserves upstream order and falls back to login for missing names', () => {
    const contributors = parseContributors(payload)
    expect(contributors.map(({ login }) => login)).toEqual([
      'Season千',
      'hanzhao',
      'noname',
      'blank',
    ])
    expect(contributors[0]).toEqual({
      login: 'Season千',
      name: 'Season千',
      avatarUrl:
        'https://raw.githubusercontent.com/poooi/contributors/master/assets/season.png',
      profileUrl: 'http://www.pixiv.net/member.php?id=3991162',
    })
    expect(contributors[1]!.name).toBe('Maggie')
    expect(contributors[2]!.name).toBe('noname')
    expect(contributors[3]!.name).toBe('blank')
  })
})

describe('fetchContributors', () => {
  it('reads the single contributors document through the cache helper', async () => {
    const fetcher = vi.fn(mockFetch(payload))
    const result = await fetchContributors({ fetcher })
    expect(result.available).toBe(true)
    expect(result.contributors).toHaveLength(4)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]![0]).toBe(contributorsUrl)
  })

  it('reports unavailable on network, HTTP or validation failure', async () => {
    const failing: FetchLike = async () => {
      throw new Error('network down')
    }
    expect(await fetchContributors({ fetcher: failing })).toEqual({
      contributors: [],
      available: false,
    })
    expect(
      await fetchContributors({
        fetcher: mockFetch(payload, { status: 500 }),
      }),
    ).toEqual({ contributors: [], available: false })
    expect(
      await fetchContributors({
        fetcher: mockFetch([{ login: '', avatar_url: '', html_url: '' }]),
      }),
    ).toEqual({ contributors: [], available: false })
  })

  it('reads the build-time fixture when no custom fetcher is provided', async () => {
    const previous = process.env.TANSTACK_TEST_CONTRIBUTORS
    process.env.TANSTACK_TEST_CONTRIBUTORS = JSON.stringify(payload)
    try {
      const result = await fetchContributors()
      expect(result.available).toBe(true)
      expect(result.contributors).toHaveLength(4)
    } finally {
      if (previous === undefined) delete process.env.TANSTACK_TEST_CONTRIBUTORS
      else process.env.TANSTACK_TEST_CONTRIBUTORS = previous
    }
  })
})

const supportersPayload = [
  {
    MemberId: 1,
    role: 'ADMIN',
    name: 'Sorayama',
    image: 'https://example.com/sorayama.png',
    profile: 'https://opencollective.com/sorayama',
    totalAmountDonated: 50,
  },
  {
    MemberId: 2,
    role: 'ADMIN',
    name: 'magica',
    image: 'https://example.com/magica.png',
    profile: 'https://opencollective.com/magicae',
    totalAmountDonated: 120,
  },
  {
    MemberId: 3,
    role: 'ADMIN',
    name: 'Jennings Wu',
    image: null,
    profile: 'https://opencollective.com/jenningswu',
    totalAmountDonated: 30,
  },
  {
    MemberId: 4,
    role: 'BACKER',
    name: 'Ada',
    image: 'https://example.com/ada.png',
    profile: 'https://opencollective.com/ada',
    totalAmountDonated: 100,
  },
  {
    MemberId: 5,
    role: 'BACKER',
    name: null,
    company: null,
    image: null,
    profile: null,
    totalAmountDonated: 5,
  },
  {
    MemberId: 6,
    role: 'BACKER',
    name: 'Zero Donor',
    image: null,
    profile: 'https://opencollective.com/zero',
    totalAmountDonated: 0,
  },
  {
    MemberId: 4,
    role: 'BACKER',
    name: 'Ada',
    image: 'https://example.com/ada.png',
    profile: 'https://opencollective.com/ada',
    totalAmountDonated: 100,
  },
  {
    MemberId: 5,
    role: 'BACKER',
    name: null,
    company: null,
    image: null,
    profile: null,
    totalAmountDonated: 5,
  },
]

describe('supporter schema', () => {
  it('accepts string or numeric MemberId and a required numeric donation', () => {
    expect(supportersSchema.safeParse(supportersPayload).success).toBe(true)
    expect(
      supporterSchema.safeParse({
        MemberId: 'abc',
        name: 'x',
        image: 'http://example.com/a.png',
        profile: null,
        totalAmountDonated: 0,
      }).success,
    ).toBe(true)
  })

  it('rejects missing MemberId, missing donation and unsafe URLs', () => {
    for (const candidate of [
      { name: 'x', totalAmountDonated: 1 },
      { MemberId: 1, totalAmountDonated: 1, image: 'javascript:alert(1)' },
      { MemberId: 1, totalAmountDonated: 1, profile: 'ftp://example.com/u' },
      { MemberId: 1, totalAmountDonated: 'ten' },
    ])
      expect(supporterSchema.safeParse(candidate).success).toBe(false)
    expect(supportersSchema.safeParse({}).success).toBe(false)
  })
})

describe('parseSupporters', () => {
  it('includes paying admins and past backers, excludes zero and dedupes', () => {
    const supporters = parseSupporters(supportersPayload)
    expect(supporters.map(({ id }) => id)).toEqual(['1', '2', '3', '4', '5'])
    expect(supporters.map(({ name }) => name)).toEqual([
      'Sorayama',
      'magica',
      'Jennings Wu',
      'Ada',
      '',
    ])
    expect(supporters[0]!.profileUrl).toBe(
      'https://opencollective.com/sorayama',
    )
    expect(supporters[3]!.profileUrl).toBe('https://opencollective.com/ada')
    expect(supporters.some(({ name }) => name === 'Zero Donor')).toBe(false)
    expect(supporters.filter(({ id }) => id === '4')).toHaveLength(1)
    expect(supporters.filter(({ id }) => id === '5')).toHaveLength(1)
  })
})

const supportersPage = (start: number, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    MemberId: start + index,
    role: 'BACKER',
    name: `member-${start + index}`,
    profile: `https://opencollective.com/member-${start + index}`,
    totalAmountDonated: 1,
  }))

describe('fetchSupporters', () => {
  it('pages with limit/offset until a short page and merges in order', async () => {
    const calls: string[] = []
    const fetcher: FetchLike = async (input) => {
      const url =
        input instanceof URL
          ? input.href
          : typeof input === 'string'
            ? input
            : input.url
      calls.push(url)
      const offset = Number(new URL(url).searchParams.get('offset'))
      return Response.json(
        offset === 0
          ? supportersPage(0, supportersPageSize)
          : supportersPage(supportersPageSize, 3),
      )
    }
    const result = await fetchSupporters({ fetcher })
    expect(result.available).toBe(true)
    expect(result.supporters).toHaveLength(supportersPageSize + 3)
    expect(calls).toEqual([
      `${supportersUrl}?limit=${supportersPageSize}&offset=0`,
      `${supportersUrl}?limit=${supportersPageSize}&offset=${supportersPageSize}`,
    ])
    expect(result.supporters[0]!.id).toBe('0')
    expect(result.supporters.at(-1)!.id).toBe(String(supportersPageSize + 2))
  })

  it('fails instead of claiming completeness when a page repeats', async () => {
    const fetcher: FetchLike = async () =>
      Response.json(supportersPage(0, supportersPageSize))
    expect(await fetchSupporters({ fetcher })).toEqual({
      supporters: [],
      available: false,
    })
  })

  it('reports unavailable on network, HTTP or validation failure', async () => {
    const failing: FetchLike = async () => {
      throw new Error('network down')
    }
    expect(await fetchSupporters({ fetcher: failing })).toEqual({
      supporters: [],
      available: false,
    })
    expect(
      await fetchSupporters({
        fetcher: mockFetch(supportersPayload, { status: 500 }),
      }),
    ).toEqual({ supporters: [], available: false })
    expect(
      await fetchSupporters({
        fetcher: mockFetch([{ role: 'BACKER', name: 'x' }]),
      }),
    ).toEqual({ supporters: [], available: false })
  })

  it('reads the build-time fixture when no custom fetcher is provided', async () => {
    const previous = process.env.TANSTACK_TEST_SUPPORTERS
    process.env.TANSTACK_TEST_SUPPORTERS = JSON.stringify(supportersPayload)
    try {
      const result = await fetchSupporters()
      expect(result.available).toBe(true)
      expect(result.supporters.map(({ id }) => id)).toEqual([
        '1',
        '2',
        '3',
        '4',
        '5',
      ])
    } finally {
      if (previous === undefined) delete process.env.TANSTACK_TEST_SUPPORTERS
      else process.env.TANSTACK_TEST_SUPPORTERS = previous
    }
  })
})
