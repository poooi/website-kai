import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { resolvePluginIcon } from './plugin-icons.server'

const catalog = JSON.parse(
  readFileSync('tests/fixtures/plugins.json', 'utf8'),
) as Record<string, { icon: string }>

const expectIcon = async (name: string, prefix: string, iconName: string) => {
  const definition = await resolvePluginIcon(name)
  expect(definition, name).toBeDefined()
  expect(definition?.prefix).toBe(prefix)
  expect(definition?.iconName).toBe(iconName)
  expect(Array.isArray(definition?.icon)).toBe(true)
}

describe('resolvePluginIcon', () => {
  it('resolves the Font Awesome definition for every catalog plugin icon', async () => {
    for (const plugin of Object.values(catalog)) {
      const definition = await resolvePluginIcon(plugin.icon)
      expect(definition, plugin.icon).toBeDefined()
      expect(definition?.iconName, plugin.icon).toBeTruthy()
      expect(definition?.icon, plugin.icon).toBeTruthy()
    }
  })

  it('applies the official v4 shim and alias prefixes', async () => {
    await expectIcon('check-square-o', 'far', 'square-check')
    await expectIcon('smile-o', 'far', 'face-smile')
    await expectIcon('file-audio-o', 'far', 'file-audio')
    await expectIcon('photo', 'far', 'image')
    await expectIcon('compass', 'far', 'compass')
    // `calendar` keeps its official v4 meaning, `calendar-o` the regular one.
    await expectIcon('calendar', 'fas', 'calendar-days')
    await expectIcon('calendar-o', 'far', 'calendar')
    await expectIcon('odnoklassniki', 'fab', 'odnoklassniki')
  })

  it('returns undefined for unknown or empty names', async () => {
    expect(await resolvePluginIcon()).toBeUndefined()
    expect(await resolvePluginIcon('not-a-real-icon')).toBeUndefined()
    expect(await resolvePluginIcon('fa/')).toBeUndefined()
  })
})
