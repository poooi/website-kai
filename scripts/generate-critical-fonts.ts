import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import subsetFont from 'subset-font'

export type CriticalFontName = 'latin' | 'jp' | 'kr' | 'sc' | 'tc'

const catalogLocales = ['en', 'fr', 'ja', 'ko', 'zh-Hans', 'zh-Hant'] as const

// ASCII covers the interface's Latin/numeric text; these are the non-ASCII
// literals the UI prints directly. Localized strings, platform labels and the
// language chooser names all come from the message catalogs, so no key list
// needs maintaining.
const ascii =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
const literalSymbols = '©®™←↑→↓↔↗↘·•–—…×÷±°§'

const sources: Record<
  CriticalFontName,
  { source: string; locales: (typeof catalogLocales)[number][] }
> = {
  latin: {
    source:
      'node_modules/@ibm/plex-sans/fonts/complete/woff2/IBMPlexSans-Regular.woff2',
    locales: ['en', 'fr'],
  },
  jp: {
    source:
      'node_modules/@ibm/plex-sans-jp/fonts/complete/woff2/hinted/IBMPlexSansJP-Regular.woff2',
    locales: ['ja'],
  },
  kr: {
    source:
      'node_modules/@ibm/plex-sans-kr/fonts/complete/woff2/hinted/IBMPlexSansKR-Regular.woff2',
    locales: ['ko'],
  },
  sc: {
    source:
      'node_modules/@ibm/plex-sans-sc/fonts/complete/woff2/hinted/IBMPlexSansSC-Regular.woff2',
    locales: ['zh-Hans'],
  },
  tc: {
    source:
      'node_modules/@ibm/plex-sans-tc/fonts/complete/woff2/hinted/IBMPlexSansTC-Regular.woff2',
    locales: ['zh-Hant'],
  },
}

export const criticalFontsOutputDir = 'src/assets/fonts/generated'

const readCatalog = (root: string, locale: string): Record<string, unknown> => {
  const parsed: unknown = JSON.parse(
    readFileSync(path.join(root, 'messages', `${locale}.json`), 'utf8'),
  )
  return parsed as Record<string, unknown>
}

const collect = (target: Set<string>, value: unknown) => {
  if (typeof value === 'string') {
    for (const character of value) target.add(character)
  }
}

const buildText = (root: string, name: CriticalFontName): string => {
  const catalogs = catalogLocales.map((locale) => readCatalog(root, locale))
  const characters = new Set<string>([...ascii, ...literalSymbols])
  for (const locale of sources[name].locales) {
    for (const value of Object.values(readCatalog(root, locale))) {
      collect(characters, value)
    }
  }
  // The language chooser lists every language name in every locale.
  for (const catalog of catalogs) collect(characters, catalog.language)
  return [...characters].join('')
}

/** Generates the per-font UI subsets that let the first paint use IBM Plex
 * without waiting on the split shards. Runs at Vite config evaluation so dev
 * and build both have the assets; outputs are written to the ignored fonts
 * directory only when their bytes change (Vite hashes them on import). */
export const generateCriticalFonts = async (root = process.cwd()) => {
  const outputDir = path.join(root, criticalFontsOutputDir)
  mkdirSync(outputDir, { recursive: true })

  await Promise.all(
    (Object.keys(sources) as CriticalFontName[]).map(async (name) => {
      const text = buildText(root, name)
      const sourceBuffer = readFileSync(path.join(root, sources[name].source))
      const subset = await subsetFont(sourceBuffer, text, {
        targetFormat: 'woff2',
        // IBM Plex is OFL-1.1 with Reserved Font Name "Plex". Keep the
        // attribution and license name records alongside the original shaping;
        // the unsubsetted shard fonts remain the fallback for omitted glyphs.
        preserveNameIds: [7, 8, 9, 10, 11, 12, 13, 14, 16, 17],
      })
      const outputPath = path.join(outputDir, `ui-${name}.woff2`)
      if (existsSync(outputPath) && readFileSync(outputPath).equals(subset)) {
        return
      }
      writeFileSync(outputPath, subset)
    }),
  )
}
