import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { parse as parseYaml } from 'yaml'

/**
 * @typedef {{ name?: string, prefix?: string }} Shim
 * @typedef {{ aliases?: { names?: string[] }, svgs?: { classic?: Record<string, { viewBox: number[], path?: string }> } }} Family
 */

const outputDir = 'src/lib/plugin-icons-generated'
const metadataDir = 'node_modules/@fortawesome/fontawesome-free/metadata'

/** @param {string} style */
const styleCode = (style) =>
  style === 'regular' ? '1' : style === 'brands' ? '2' : '0'

/** @param {string | undefined} prefix */
const styleForPrefix = (prefix) =>
  prefix === 'far' ? 'regular' : prefix === 'fab' ? 'brands' : 'solid'

/** @param {string[]} styles */
const defaultStyle = (styles) =>
  styles.includes('solid')
    ? 'solid'
    : styles.includes('regular')
      ? 'regular'
      : styles[0]

/**
 * @param {string} file
 * @param {string | Uint8Array} data
 */
const writeIfChanged = (file, data) => {
  const next = Buffer.from(data)
  if (existsSync(file) && readFileSync(file).equals(next)) return
  writeFileSync(file, data)
}

/**
 * Builds a compact official Font Awesome geometry table, split by style so each
 * generated module stays under the server chunk budget. Aliases and v4 shims
 * resolve through a small name map instead of duplicating geometry.
 * @param {string} [root]
 */
export const generatePluginIcons = (root = process.cwd()) => {
  /** @type {unknown} */
  const familiesPayload = JSON.parse(
    readFileSync(path.join(root, metadataDir, 'icon-families.json'), 'utf8'),
  )
  /** @type {unknown} */
  const shimsPayload = parseYaml(
    readFileSync(path.join(root, metadataDir, 'shims.yml'), 'utf8'),
  )
  const families = /** @type {Record<string, Family>} */ (familiesPayload)
  const shims = /** @type {Record<string, Shim>} */ (shimsPayload)

  /** @type {Record<string, string>} */
  const alias = {}
  for (const [name, entry] of Object.entries(families)) {
    for (const old of entry.aliases?.names ?? []) {
      if (!(old in alias)) alias[old] = name
    }
  }

  /** @param {string} name */
  const stylesOf = (name) => Object.keys(families[name]?.svgs?.classic ?? {})
  /** @param {string} name */
  const target = (name) => {
    const shim = shims[name]
    if (shim) {
      return {
        canonical: shim.name ?? name,
        style: shim.prefix ? styleForPrefix(shim.prefix) : undefined,
      }
    }
    if (alias[name]) return { canonical: alias[name] }
    return { canonical: name }
  }
  /** @param {string} name */
  const resolve = (name) => {
    const { canonical, style } = target(name)
    const styles = stylesOf(canonical)
    if (!styles.length) return undefined
    const chosen =
      style && styles.includes(style) ? style : defaultStyle(styles)
    return { canonical, style: chosen }
  }

  /** @type {Record<string, string[]>} */
  const names = {}
  /** @param {string} name */
  const remember = (name) => {
    const resolved = resolve(name)
    const style = resolved?.style
    if (resolved && style) {
      names[name] = [resolved.canonical, styleCode(style)]
    }
  }
  for (const name of Object.keys(families)) remember(name)
  for (const name of Object.keys(alias)) remember(name)
  for (const name of Object.keys(shims)) remember(name)
  // v4 outline aliases use the regular family of their base name. Bases are the
  // modern canonical names and their aliases; only an already-explicit outline
  // alias (e.g. check-square-o from shims.yml) is left untouched.
  /** @type {Map<string, string>} */
  const bases = new Map()
  for (const name of Object.keys(families)) bases.set(name, name)
  for (const [name, canonical] of Object.entries(alias)) {
    if (!bases.has(name)) bases.set(name, canonical)
  }
  for (const [name, canonical] of bases) {
    if (!stylesOf(canonical).includes('regular')) continue
    const outline = `${name}-o`
    if (!(outline in names)) names[outline] = [canonical, styleCode('regular')]
  }

  /** @type {Record<string, Record<string, string[]>>} */
  const geometry = { solid: {}, regular: {}, brands: {} }
  for (const [name, entry] of Object.entries(families)) {
    for (const [style, svg] of Object.entries(entry.svgs?.classic ?? {})) {
      if (!geometry[style] || typeof svg.path !== 'string') continue
      geometry[style][name] = [svg.viewBox.join(' '), svg.path]
    }
  }

  mkdirSync(path.join(root, outputDir), { recursive: true })
  writeIfChanged(
    path.join(root, outputDir, 'names.json'),
    JSON.stringify(names),
  )
  for (const style of Object.keys(geometry)) {
    writeIfChanged(
      path.join(root, outputDir, `geometry-${style}.json`),
      JSON.stringify(geometry[style]),
    )
  }
}

const entry = process.argv[1]
if (entry && import.meta.url === pathToFileURL(entry).href) {
  generatePluginIcons()
  console.log('plugin icons generated')
}
