declare module '~/paraglide/runtime' {
  export const baseLocale: 'ja'
  export const locales: readonly ['en', 'fr', 'ja', 'ko', 'zh-Hans', 'zh-Hant']
  export type Locale = (typeof locales)[number]
  export type LocalizedString = string

  export const isLocale: (locale: unknown) => locale is Locale
  export const getLocale: () => Locale
  export const setLocale: (
    newLocale: Locale,
    options?: { reload?: boolean },
  ) => void | Promise<void>
  export const localizeHref: (
    href: string,
    options?: { locale?: Locale },
  ) => string
  export const deLocalizeHref: (href: string) => string
  export const localizeUrl: (
    url: string | URL,
    options?: { locale?: Locale },
  ) => URL
  export const deLocalizeUrl: (url: string | URL) => URL
}

declare module '~/paraglide/messages' {
  import type { Locale, LocalizedString } from '~/paraglide/runtime'

  type Message = (
    inputs?: Record<string, never>,
    options?: { locale?: Locale },
  ) => LocalizedString
  type VersionMessage = (
    inputs: { version: string },
    options?: { locale?: Locale },
  ) => LocalizedString

  export const m: {
    arm: Message
    armDEB: Message
    armPortable: Message
    betaHint: Message
    chibaheit: Message
    description: Message
    discordSubChannel: Message
    download: Message
    downloadOptions: Message
    downloadWithVersion: VersionMessage
    explore: Message
    github: Message
    httpsUpdateSupported: Message
    ia32Portable: Message
    ia32Setup: Message
    kanColleBrowser: Message
    language: Message
    lilywhite: Message
    linux: Message
    macos: Message
    mobileHint: Message
    name: Message
    newLabel: Message
    nightlyBuilds: Message
    oldVersions: Message
    opencollective: Message
    operatingSystem: Message
    options: Message
    others: Message
    platform: Message
    sightedBySkilledLookouts: Message
    sourceCode: Message
    stableHint: Message
    system: Message
    telegram: Message
    theme: Message
    weibo: Message
    windows: Message
    x: Message
    x64DEB: Message
    x64Portable: Message
    x64RPM: Message
    x64Setup: Message
  }
}

declare module '~/paraglide/server' {
  import type { Locale } from '~/paraglide/runtime'

  export const paraglideMiddleware: (
    request: Request,
    resolve: (args: {
      request: Request
      locale: Locale
    }) => Response | Promise<Response>,
    options?: {
      effectiveRequestUrl?: string | URL | ((request: Request) => string | URL)
      onRedirect?: (response: Response) => void
    },
  ) => Promise<Response>
}
