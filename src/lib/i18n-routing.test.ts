import { describe, expect, it } from 'vitest'

import {
  localizeHref,
  parseCookieHeader,
  resolvePreferredLocale,
} from './i18n-routing'

describe('parseCookieHeader', () => {
  it('uses a null-prototype cookie map for untrusted cookie names', () => {
    const cookies = parseCookieHeader('__proto__=polluted; constructor=value')

    expect(Object.getPrototypeOf(cookies)).toBeNull()
    expect(cookies.__proto__).toBe('polluted')
    expect(cookies.constructor).toBe('value')
    expect(Object.prototype).not.toHaveProperty('polluted')
  })
})

describe('localizeHref', () => {
  it('preserves search params and hash fragments while changing locale', () => {
    expect(
      localizeHref('/download', 'fr', '?channel=stable', '#download'),
    ).toBe('/fr/download?channel=stable#download')
    expect(
      localizeHref('/en/download', 'ja', '?channel=stable', '#download'),
    ).toBe('/download?channel=stable#download')
  })
})

describe('resolvePreferredLocale', () => {
  it('honors Accept-Language q-values', () => {
    const headers = new Headers({
      'Accept-Language': 'ja;q=0,en;q=1',
    })

    expect(resolvePreferredLocale(headers)).toBe('en')
  })

  it('maps Chinese region tags to script locales', () => {
    expect(
      resolvePreferredLocale(
        new Headers({
          'Accept-Language': 'zh-TW,zh;q=0.5',
        }),
      ),
    ).toBe('zh-Hant')
    expect(
      resolvePreferredLocale(
        new Headers({
          'Accept-Language': 'zh-CN,zh;q=0.5',
        }),
      ),
    ).toBe('zh-Hans')
  })

  it('localizes the root path without adding a trailing slash', async () => {
    const { localizePath } = await import('./i18n-routing')

    expect(localizePath('/', 'en')).toBe('/en')
  })

  it('maps Chinese script-region tags to script locales', () => {
    expect(
      resolvePreferredLocale(
        new Headers({
          'Accept-Language': 'zh-Hant-TW',
        }),
      ),
    ).toBe('zh-Hant')
    expect(
      resolvePreferredLocale(
        new Headers({
          'Accept-Language': 'zh-Hans-CN',
        }),
      ),
    ).toBe('zh-Hans')
  })

  it('ignores malformed locale cookies', () => {
    expect(
      resolvePreferredLocale(
        new Headers({
          'Accept-Language': 'en',
          Cookie: 'NEXT_LOCALE=%E0%A4%A',
        }),
      ),
    ).toBe('en')
  })
})
