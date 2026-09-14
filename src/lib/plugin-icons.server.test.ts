import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import names from './plugin-icons-generated/names.json'
import { resolvePluginIcon } from './plugin-icons.server'

const readJson = (path: string): unknown =>
  JSON.parse(readFileSync(path, 'utf8'))

type FamilyMetadata = {
  unicode?: string
  svgs?: { classic?: Record<string, { viewBox: number[]; path?: string }> }
}

const nameMap: Record<string, string[]> = names
const catalog = readJson('tests/fixtures/plugins.json') as Record<
  string,
  { icon: string }
>
const metadata = readJson(
  'node_modules/@fortawesome/fontawesome-free/metadata/icon-families.json',
) as Record<string, FamilyMetadata>

const catalogIcons = [...new Set(Object.values(catalog).map((p) => p.icon))]

/** Geometry straight from the official metadata, independent of the generator. */
const official = (name: string, style: string) => {
  const svg = metadata[name]?.svgs?.classic?.[style]
  if (!svg?.path) throw new Error(`missing official ${name}/${style}`)
  return { viewBox: svg.viewBox.join(' '), path: svg.path }
}

// Every `.fa.fa-<name>` block from the official v4 shims stylesheet.
const v4 = new Map<
  string,
  { unicode?: string; family?: string; weight?: number }
>()
const shimsCss = readFileSync(
  'node_modules/@fortawesome/fontawesome-free/css/v4-shims.css',
  'utf8',
)
for (const match of shimsCss.matchAll(/\.fa\.fa-([a-z0-9-]+)\s*\{([^}]*)\}/g)) {
  const name = match[1] ?? ''
  const body = match[2] ?? ''
  const record = v4.get(name) ?? {}
  const unicode = /--fa:\s*"\\([0-9a-f]+)"/i.exec(body)?.[1]
  if (unicode) record.unicode = unicode.toLowerCase()
  const family = /font-family:\s*"([^"]+)"/.exec(body)?.[1]
  if (family) record.family = family
  const weight = /font-weight:\s*(\d+)/.exec(body)?.[1]
  if (weight) record.weight = Number(weight)
  v4.set(name, record)
}

describe('resolvePluginIcon', () => {
  it('resolves every icon used by the plugin catalog', async () => {
    for (const icon of catalogIcons) {
      const geometry = await resolvePluginIcon(icon)
      expect(geometry, icon).toBeDefined()
      expect(geometry?.path, icon).toBeTruthy()
    }
  })

  it('maps v4 outline and brand aliases to the official regular and brand styles', async () => {
    expect(await resolvePluginIcon('check-square-o')).toEqual(
      official('square-check', 'regular'),
    )
    expect(await resolvePluginIcon('smile-o')).toEqual(
      official('face-smile', 'regular'),
    )
    expect(await resolvePluginIcon('file-audio-o')).toEqual(
      official('file-audio', 'regular'),
    )
    expect(await resolvePluginIcon('photo')).toEqual(
      official('image', 'regular'),
    )
    expect(await resolvePluginIcon('compass')).toEqual(
      official('compass', 'regular'),
    )
    expect(await resolvePluginIcon('calendar-o')).toEqual(
      official('calendar', 'regular'),
    )
    // `calendar` keeps its official v4 meaning (calendar-days, solid).
    expect(await resolvePluginIcon('calendar')).toEqual(
      official('calendar-days', 'solid'),
    )
    expect(await resolvePluginIcon('odnoklassniki')).toEqual(
      official('odnoklassniki', 'brands'),
    )
  })

  it('renders nothing for unknown or empty names', async () => {
    expect(await resolvePluginIcon()).toBeUndefined()
    expect(await resolvePluginIcon('not-a-real-icon')).toBeUndefined()
    expect(await resolvePluginIcon('fa/')).toBeUndefined()
  })

  it('agrees with the official v4 shims stylesheet', async () => {
    const checked = new Set([...catalogIcons, 'calendar-o'])
    let verified = 0
    for (const name of checked) {
      const shim = v4.get(name)
      const entry = nameMap[name]
      if (!shim || !entry) continue
      const canonical = entry[0] ?? ''
      const style = Number(entry[1])
      if (shim.unicode && metadata[canonical]?.unicode) {
        expect(shim.unicode, name).toBe(
          metadata[canonical].unicode?.toLowerCase(),
        )
      }
      const expectedStyle = shim.family?.includes('Brands')
        ? 2
        : shim.weight === 400
          ? 1
          : 0
      expect(style, name).toBe(expectedStyle)
      verified++
    }
    // The catalog exercises solid, regular and brand v4 shims.
    expect(verified).toBeGreaterThan(5)
  })
})
