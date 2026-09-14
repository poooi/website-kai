import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { fontSplit, proto, StaticWasm } from 'cn-font-split/dist/wasm/index.mjs'

export type CriticalFontName = 'latin' | 'jp' | 'kr' | 'sc' | 'tc'

const catalogLocales = ['en', 'fr', 'ja', 'ko', 'zh-Hans', 'zh-Hant'] as const

// Pinned engine asset so every build uses the same toolchain; installed with
// the documented CLI wasm target (see package.json "fonts:wasm"). Pinning the
// version does not make the bytes reproducible: the engine's subset ordering
// drifts between runs for larger CJK sets (observed SC/TC), so outputs are
// rewritten only when their bytes change rather than assumed stable.
const engineTarget = 'wasm32-wasip1'
const engineVersion = `${engineTarget}@7.6.8`
const wasmFileName = `libffi-${engineTarget}.wasm`

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
  const characters = new Set<string>([...ascii, ...literalSymbols])
  for (const locale of sources[name].locales) {
    for (const value of Object.values(readCatalog(root, locale))) {
      collect(characters, value)
    }
  }
  // The language chooser lists every language name in every locale.
  for (const locale of catalogLocales) {
    collect(characters, readCatalog(root, locale).language)
  }
  return [...characters].join('')
}

const ensureEngine = (root: string): string => {
  const distDir = path.join(root, 'node_modules/cn-font-split/dist')
  const wasmPath = path.join(distDir, wasmFileName)
  const versionPath = path.join(distDir, 'version')
  const pinned =
    existsSync(versionPath) &&
    readFileSync(versionPath, 'utf8').includes(engineVersion)
  if (!existsSync(wasmPath) || !pinned) {
    execFileSync(
      process.execPath,
      [path.join(distDir, 'cli.js'), 'i', engineVersion],
      { stdio: 'inherit' },
    )
  }
  if (!existsSync(wasmPath)) {
    throw new Error(`cn-font-split ${engineVersion} engine was not installed`)
  }
  return wasmPath
}

// The engine writes the original IBM metadata (copyright, trademark, designers,
// licence and project links) into the generated stylesheet header. Keep it as a
// legal `/*! */` comment served with the face, minus the nondeterministic
// CreateTime line.
const attributionOf = (css: string): string => {
  const start = css.indexOf('/*')
  const close = css.indexOf('*/', start)
  const block = start >= 0 && close > start ? css.slice(start + 2, close) : css
  const cleaned = block
    .replace(/CreateTime:[^\n]*\n?/g, '')
    .replace(/\*\//g, '* /')
    .trim()
  if (!cleaned) throw new Error('cn-font-split stylesheet had no attribution')
  return `/*! ${cleaned} */`
}

const writeIfChanged = (file: string, data: string | Uint8Array) => {
  const next = typeof data === 'string' ? Buffer.from(data) : data
  if (existsSync(file) && readFileSync(file).equals(next)) return
  writeFileSync(file, data)
}

/** Generates the per-font UI subsets that let the first paint use IBM Plex
 * without waiting on the split shards. Runs at Vite config evaluation so dev
 * and build both have the assets; the pinned WASM engine is used so the
 * toolchain stays cross-platform with no native build. */
export const generateCriticalFonts = async (root = process.cwd()) => {
  const outputDir = path.join(root, criticalFontsOutputDir)
  mkdirSync(outputDir, { recursive: true })
  const wasm = new StaticWasm(new Uint8Array(readFileSync(ensureEngine(root))))

  // Sequential: the engine is not documented as thread-safe.
  for (const name of Object.keys(sources) as CriticalFontName[]) {
    const codepoints = [...buildText(root, name)].map((character) =>
      character.codePointAt(0)!,
    )
    const config = proto.InputTemplate.fromObject({
      input: new Uint8Array(
        readFileSync(path.join(root, sources[name].source)),
      ),
      outDir: '/tmp/fonts',
      subsets: [new Uint8Array(new Uint32Array(codepoints).buffer)],
      renameOutputFont: `ui-${name}.[ext]`,
      autoSubset: false,
      languageAreas: false,
      reduceMins: false,
      subsetRemainChars: false,
      fontFeature: true,
      multiThreads: false,
      testHtml: false,
      reporter: false,
    })

    const payload = new Uint8Array(config.serialize()).buffer
    const outputs = await fontSplit(payload, wasm.WasiHandle, {
      logger: () => undefined,
    })

    const faces = outputs.filter((output) => output?.name.endsWith('.woff2'))
    if (faces.length !== 1 || !faces[0]) {
      throw new Error(
        `cn-font-split produced ${faces.length} woff2 for ${name}`,
      )
    }
    const stylesheet = outputs.find((output) => output?.name === 'result.css')
    if (!stylesheet) {
      throw new Error(`cn-font-split produced no stylesheet for ${name}`)
    }

    writeIfChanged(path.join(outputDir, `ui-${name}.woff2`), faces[0].data)
    writeIfChanged(
      path.join(outputDir, `ui-${name}.attribution.txt`),
      attributionOf(Buffer.from(stylesheet.data).toString('utf8')),
    )
  }
}
