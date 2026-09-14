import latin from '~/assets/fonts/generated/ui-latin.woff2?url'
import jp from '~/assets/fonts/generated/ui-jp.woff2?url'
import kr from '~/assets/fonts/generated/ui-kr.woff2?url'
import sc from '~/assets/fonts/generated/ui-sc.woff2?url'
import tc from '~/assets/fonts/generated/ui-tc.woff2?url'
import type { SupportedLocale } from '~/lib/i18n-routing'

type CriticalFontName = 'latin' | 'jp' | 'kr' | 'sc' | 'tc'

const urls: Record<CriticalFontName, string> = { latin, jp, kr, sc, tc }

const families: Record<CriticalFontName, string> = {
  latin: 'Poi UI Latin',
  jp: 'Poi UI JP',
  kr: 'Poi UI KR',
  sc: 'Poi UI SC',
  tc: 'Poi UI TC',
}

const fontByLocale: Record<SupportedLocale, CriticalFontName> = {
  en: 'latin',
  fr: 'latin',
  ja: 'jp',
  ko: 'kr',
  'zh-Hans': 'sc',
  'zh-Hant': 'tc',
}

export const criticalFontPreload: Record<SupportedLocale, string> = {
  en: urls.latin,
  fr: urls.latin,
  ja: urls.jp,
  ko: urls.kr,
  'zh-Hans': urls.sc,
  'zh-Hant': urls.tc,
}

// A separate family sits first in each locale's stack, so the UI glyphs always
// come from the preloaded subset while anything it lacks falls through to the
// split IBM Plex shards. Omitted glyphs therefore render on demand, and no
// unicode-range bookkeeping is required. Only the active locale's face is
// declared so no other subset can be requested by mistake.
export const criticalFontCss = (locale: SupportedLocale): string => {
  const name = fontByLocale[locale]
  return `@font-face{font-family:'${families[name]}';font-style:normal;font-weight:400;font-display:block;src:url(${urls[name]}) format('woff2')}`
}
