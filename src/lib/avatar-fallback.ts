const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })

const firstGrapheme = (value: string): string | undefined => {
  const [first] = segmenter.segment(value)
  return first?.segment
}

/** Locale-independent, stable identity key for an avatar fallback. */
export const normalizeAvatarName = (name: string): string =>
  name.normalize('NFC').trim()

/** First Unicode grapheme, uppercased and reduced to a single grapheme
 * (`ß` -> `S`); blank names fall back to `?`. */
export const avatarInitial = (name: string): string => {
  const first = firstGrapheme(normalizeAvatarName(name))
  if (!first) return '?'
  return firstGrapheme(first.toUpperCase()) ?? '?'
}

/** FNV-1a hash of the normalized name, folded into a hue in 0..359. Identical
 * names always map to the same hue with no locale, time or randomness. */
export const avatarHue = (name: string): number => {
  const normalized = normalizeAvatarName(name)
  let hash = 2166136261
  for (let index = 0; index < normalized.length; index++) {
    hash ^= normalized.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % 360
}
