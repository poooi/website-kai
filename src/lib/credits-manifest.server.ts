import { z } from 'zod'

import { type FetchLike, UpstreamResponseError } from './fetch-poi-versions'
import { fetchCachedRelease } from './release-cache.server'

export const creditsManifestUrl =
  'https://raw.githubusercontent.com/poooi/contributors/master/dist/avatars/manifest.json'

const httpUrl = z.url({ protocol: /^https?$/ })
const sheetFilePattern = /^avatars-\d+\.[0-9a-f]{6,64}\.(png|webp)$/

export const creditsManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    version: z.string().min(1),
    cellSize: z.literal(96),
    displaySize: z.literal(48),
    pixelRatio: z.literal(2),
    sheets: z.array(
      z.object({
        url: z.string().regex(sheetFilePattern),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      }),
    ),
    avatars: z.record(
      z.string(),
      z.object({
        sheet: z.number().int().min(0),
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        width: z.literal(96),
        height: z.literal(96),
      }),
    ),
    contributors: z.array(
      z.object({
        id: z.string().min(1),
        login: z.string().min(1),
        name: z.string().nullish(),
        profile: httpUrl,
      }),
    ),
    supporters: z.array(
      z.object({
        id: z.string().min(1),
        memberId: z.union([z.string().min(1), z.number()]),
        name: z.string().nullish(),
        profile: httpUrl.nullable(),
      }),
    ),
  })
  .superRefine((manifest, ctx) => {
    for (const [id, avatar] of Object.entries(manifest.avatars)) {
      const sheet = manifest.sheets[avatar.sheet]
      if (!sheet) {
        ctx.addIssue({
          code: 'custom',
          message: `avatar ${id} references missing sheet ${avatar.sheet}`,
        })
        continue
      }
      if (
        avatar.x + avatar.width > sheet.width ||
        avatar.y + avatar.height > sheet.height
      )
        ctx.addIssue({
          code: 'custom',
          message: `avatar ${id} exceeds sheet bounds`,
        })
    }
  })

export type CreditsManifestPayload = z.infer<typeof creditsManifestSchema>

export type CreditsAvatar = {
  sheet: number
  x: number
  y: number
  width: number
  height: number
}

export type CreditsSheet = { url: string; width: number; height: number }

export type CreditsContributor = {
  id: string
  login: string
  name: string
  profile: string
  avatar?: CreditsAvatar
}

export type CreditsSupporter = {
  id: string
  memberId: string
  name: string
  profile?: string
  avatar?: CreditsAvatar
}

export type CreditsManifest = {
  version: string
  cellSize: number
  displaySize: number
  pixelRatio: number
  sheets: CreditsSheet[]
  contributors: CreditsContributor[]
  supporters: CreditsSupporter[]
}

export function normalizeCreditsManifest(
  payload: CreditsManifestPayload,
): CreditsManifest {
  const avatars = payload.avatars
  return {
    version: payload.version,
    cellSize: payload.cellSize,
    displaySize: payload.displaySize,
    pixelRatio: payload.pixelRatio,
    sheets: payload.sheets,
    contributors: payload.contributors.map((contributor) => {
      const trimmed = contributor.name?.trim()
      return {
        id: contributor.id,
        login: contributor.login,
        name: trimmed && trimmed.length > 0 ? trimmed : contributor.login,
        profile: contributor.profile,
        avatar: avatars[contributor.id],
      }
    }),
    supporters: payload.supporters.map((supporter) => ({
      id: supporter.id,
      memberId: String(supporter.memberId),
      name: supporter.name?.trim() ?? '',
      profile: supporter.profile ?? undefined,
      avatar: avatars[supporter.id],
    })),
  }
}

export async function fetchCreditsManifest({
  fetcher = fetch,
}: { fetcher?: FetchLike } = {}): Promise<{
  manifest: CreditsManifest | undefined
  available: boolean
}> {
  try {
    let payload: unknown
    const fixture = process.env.TANSTACK_TEST_CREDITS_MANIFEST
    if (fixture && fetcher === fetch) {
      payload = JSON.parse(fixture)
    } else {
      const response = await fetchCachedRelease(creditsManifestUrl, {
        fetcher,
        validate: (text) => {
          creditsManifestSchema.parse(JSON.parse(text))
        },
      })
      if (!response.ok) throw new UpstreamResponseError(response.status)
      payload = await response.json()
    }
    return {
      manifest: normalizeCreditsManifest(creditsManifestSchema.parse(payload)),
      available: true,
    }
  } catch {
    return { manifest: undefined, available: false }
  }
}
