import { z } from 'zod'

import { type FetchLike, UpstreamResponseError } from './fetch-poi-versions'
import { fetchCachedRelease } from './release-cache.server'

export const contributorsUrl =
  'https://raw.githubusercontent.com/poooi/contributors/master/dist/contributors.json'
export const supportersUrl =
  'https://rest.opencollective.com/poi/members/all.json'
export const supportersPageSize = 1000

// Only the fields the credits page renders are required; upstream stats and
// hand-added artists (custom profiles, no GitHub stats) are passed through.
const httpUrl = z.url({ protocol: /^https?$/ })

/** Normalize empty or whitespace-only text to undefined so `??` is the fallback. */
const nonEmpty = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export const contributorSchema = z
  .object({
    login: z.string().min(1),
    name: z.string().nullish(),
    avatar_url: httpUrl,
    html_url: httpUrl,
  })
  .passthrough()
export const contributorsSchema = z.array(contributorSchema)

export type ContributorEntry = z.infer<typeof contributorSchema>

export type Contributor = {
  login: string
  name: string
  avatarUrl: string
  profileUrl: string
}

/** Keep upstream order; fall back to the login when the display name is empty. */
export function toContributor(entry: ContributorEntry): Contributor {
  const name = nonEmpty(entry.name)
  return {
    login: entry.login,
    name: name ?? entry.login,
    avatarUrl: entry.avatar_url,
    profileUrl: entry.html_url,
  }
}

export function parseContributors(payload: unknown): Contributor[] {
  return contributorsSchema.parse(payload).map(toContributor)
}

export async function fetchContributors({
  fetcher = fetch,
}: { fetcher?: FetchLike } = {}): Promise<{
  contributors: Contributor[]
  available: boolean
}> {
  try {
    let payload: unknown
    const fixture = process.env.TANSTACK_TEST_CONTRIBUTORS
    if (fixture && fetcher === fetch) {
      payload = JSON.parse(fixture)
    } else {
      const response = await fetchCachedRelease(contributorsUrl, {
        fetcher,
        validate: (text) => {
          contributorsSchema.parse(JSON.parse(text))
        },
      })
      if (!response.ok) throw new UpstreamResponseError(response.status)
      payload = await response.json()
    }
    return { contributors: parseContributors(payload), available: true }
  } catch {
    return { contributors: [], available: false }
  }
}

// Open Collective members/all.json returns every member (past and current).
// Financial support is `totalAmountDonated > 0` regardless of role, MemberId is
// the stable identity, and a member can appear once per tier membership.
export const supporterSchema = z
  .object({
    MemberId: z.union([z.string().min(1), z.number()]),
    name: z.string().nullish(),
    company: z.string().nullish(),
    image: httpUrl.nullish(),
    profile: httpUrl.nullish(),
    totalAmountDonated: z.number(),
  })
  .passthrough()

export const supportersSchema = z.array(supporterSchema)

export type SupporterEntry = z.infer<typeof supporterSchema>

export type Supporter = {
  id: string
  name: string
  avatarUrl?: string
  profileUrl?: string
}

function toSupporter(entry: SupporterEntry): Supporter {
  const name = nonEmpty(entry.name) ?? nonEmpty(entry.company)
  return {
    id: String(entry.MemberId),
    name: name ?? '',
    avatarUrl: entry.image ?? undefined,
    profileUrl: entry.profile ?? undefined,
  }
}

function supporterKey(entry: SupporterEntry): string {
  return entry.profile ?? String(entry.MemberId)
}

/**
 * Paying members of any role, deduped by profile (falling back to MemberId) so
 * repeated tier memberships collapse, preserving first-seen order.
 */
export function selectSupporters(entries: SupporterEntry[]): Supporter[] {
  const seen = new Set<string>()
  const supporters: Supporter[] = []
  for (const entry of entries) {
    if (entry.totalAmountDonated <= 0) continue
    const key = supporterKey(entry)
    if (seen.has(key)) continue
    seen.add(key)
    supporters.push(toSupporter(entry))
  }
  return supporters
}

export function parseSupporters(payload: unknown): Supporter[] {
  return selectSupporters(supportersSchema.parse(payload))
}

async function fetchSupportersPage(
  fetcher: FetchLike,
  offset: number,
): Promise<SupporterEntry[]> {
  const response = await fetchCachedRelease(
    `${supportersUrl}?limit=${supportersPageSize}&offset=${offset}`,
    {
      fetcher,
      validate: (text) => {
        supportersSchema.parse(JSON.parse(text))
      },
    },
  )
  if (!response.ok) throw new UpstreamResponseError(response.status)
  return supportersSchema.parse(await response.json())
}

export async function fetchSupporters({
  fetcher = fetch,
}: { fetcher?: FetchLike } = {}): Promise<{
  supporters: Supporter[]
  available: boolean
}> {
  try {
    let entries: SupporterEntry[]
    const fixture = process.env.TANSTACK_TEST_SUPPORTERS
    if (fixture && fetcher === fetch) {
      entries = supportersSchema.parse(JSON.parse(fixture))
    } else {
      entries = []
      const seenPages = new Set<string>()
      let offset = 0
      for (;;) {
        const page = await fetchSupportersPage(fetcher, offset)
        const pageKey = page.map((entry) => String(entry.MemberId)).join('\n')
        // Fail loudly rather than reporting a partial export as complete.
        if (seenPages.has(pageKey))
          throw new Error('Open Collective repeated a supporters page')
        seenPages.add(pageKey)
        entries.push(...page)
        if (page.length < supportersPageSize) break
        offset += supportersPageSize
      }
    }
    return { supporters: selectSupporters(entries), available: true }
  } catch (error) {
    console.warn(
      `Open Collective supporters unavailable: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    )
    return { supporters: [], available: false }
  }
}
