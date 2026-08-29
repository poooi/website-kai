import { z } from 'zod'

/**
 * poi-release only ships a subset of the locales the site supports, so every
 * language is tried against the upstream and anything missing falls back to
 * en-US. Mapping every locale (rather than only the ones that exist today)
 * means a newly added changelog language works without a code change here.
 */
const localeToLanguage: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ja: 'ja-JP',
  ko: 'ko-KR',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
}

export const fallbackChangelogLanguage = 'en-US'

export const changelogChannels = ['stable', 'beta'] as const

export type ChangelogChannel = (typeof changelogChannels)[number]

export const isChangelogChannel = (
  channel: string | undefined,
): channel is ChangelogChannel => {
  return changelogChannels.includes(channel as ChangelogChannel)
}

export const changelogLanguage = (locale: string | undefined) => {
  return localeToLanguage[locale ?? ''] ?? fallbackChangelogLanguage
}

export const changelogLanguageCandidates = (locale: string | undefined) => {
  const language = changelogLanguage(locale)
  return language === fallbackChangelogLanguage
    ? [language]
    : [language, fallbackChangelogLanguage]
}

export const changelogFilename = (
  language: string,
  channel: ChangelogChannel,
) => `${language}${channel === 'beta' ? '-beta' : ''}.md`

export const changelogApiPath = (channel: ChangelogChannel, locale: string) =>
  `/api/changelog/${channel}?locale=${encodeURIComponent(locale)}`

export const changelogSchema = z.object({
  html: z.string(),
  language: z.string(),
})

export type Changelog = z.infer<typeof changelogSchema>
