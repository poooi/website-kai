import { describe, expect, it } from 'vitest'

import {
  avatarHue,
  avatarInitial,
  normalizeAvatarName,
} from './avatar-fallback'

describe('normalizeAvatarName', () => {
  it('trims and applies NFC normalization', () => {
    expect(normalizeAvatarName('  poi  ')).toBe('poi')
    expect(normalizeAvatarName('e\u0301')).toBe('é')
  })
})

describe('avatarInitial', () => {
  it('returns the uppercased first grapheme', () => {
    expect(avatarInitial(' Season千 ')).toBe('S')
    expect(avatarInitial('anonymous')).toBe('A')
  })

  it('keeps a single grapheme for multi-codepoint initials', () => {
    expect(avatarInitial('ßeta')).toBe('S')
    expect(avatarInitial('🧑\u200d🚀x')).toBe('🧑\u200d🚀')
  })

  it('falls back to ? for blank names', () => {
    expect(avatarInitial('')).toBe('?')
    expect(avatarInitial('   ')).toBe('?')
  })
})

describe('avatarHue', () => {
  it('is deterministic and identical for equal names', () => {
    expect(avatarHue('Alice')).toBe(avatarHue('Alice'))
    expect(avatarHue('Alice')).toBe(avatarHue('  Alice '))
    expect(avatarHue('Alice')).not.toBe(avatarHue('Bob'))
  })

  it('ignores Unicode composition form', () => {
    expect(avatarHue('café')).toBe(avatarHue('cafe\u0301'))
  })

  it('stays within 0..359 for a range of names', () => {
    for (const name of [
      '',
      '?',
      'Ada',
      'Jennings Wu',
      'Season千',
      '🧑\u200d🚀',
      'a'.repeat(64),
    ]) {
      const hue = avatarHue(name)
      expect(Number.isInteger(hue)).toBe(true)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThanOrEqual(359)
    }
  })
})
