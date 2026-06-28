import {
  baseLocale,
  deLocalizeHref,
  isLocale,
  locales,
  localizeHref as paraglideLocalizeHref,
  type Locale,
} from '~/paraglide/runtime'

export const defaultLocale = baseLocale

export const supportedLocales = locales

export type SupportedLocale = Locale

export const isSupportedLocale = (
  locale: string,
): locale is SupportedLocale => {
  return isLocale(locale)
}

export const isDefaultLocale = (locale: string) => locale === defaultLocale

export const getPathLocale = (pathname: string) => {
  const segment = pathname.split('/').find(Boolean)
  return segment && isSupportedLocale(segment) ? segment : undefined
}

export const stripLocalePrefix = (pathname: string) => {
  const locale = getPathLocale(pathname)
  if (!locale) {
    return deLocalizeHref(pathname)
  }

  const stripped = pathname.replace(new RegExp(`^/${locale}`), '')
  return stripped || '/'
}

export const localizePath = (pathname: string, locale: string) => {
  const localized = paraglideLocalizeHref(stripLocalePrefix(pathname), {
    locale: isSupportedLocale(locale) ? locale : defaultLocale,
  })
  return localized !== '/' ? localized.replace(/\/+$/, '') : localized
}

export const localizeHref = (
  pathname: string,
  locale: string,
  search = '',
  hash = '',
) => `${localizePath(pathname, locale)}${search}${hash}`

export const parseCookieHeader = (cookieHeader: string | null) => {
  const cookies = Object.create(null) as Record<string, string>
  for (const entry of (cookieHeader ?? '').split(';')) {
    const trimmed = entry.trim()
    if (!trimmed) {
      continue
    }

    const [key, ...value] = trimmed.split('=')
    if (key) {
      try {
        cookies[key] = decodeURIComponent(value.join('='))
      } catch {
        // Ignore malformed cookie values instead of failing request routing.
      }
    }
  }

  return cookies
}

const parseAcceptLanguage = (acceptLanguage: string) => {
  return acceptLanguage
    .split(',')
    .map((entry, index) => {
      const [language = '', ...parameters] = entry
        .trim()
        .split(';')
        .map((part) => part.trim())
      const qParameter = parameters.find((parameter) =>
        parameter.startsWith('q='),
      )
      const q = qParameter ? Number(qParameter.slice(2)) : 1
      return {
        index,
        language,
        q: Number.isFinite(q) ? q : 0,
      }
    })
    .filter(({ language, q }) => language && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
}

const matchAcceptedLanguage = (language: string) => {
  if (isSupportedLocale(language)) {
    return language
  }

  const normalized = language.toLowerCase()
  if (
    normalized === 'zh-hant' ||
    normalized.startsWith('zh-hant-') ||
    normalized === 'zh-tw' ||
    normalized === 'zh-hk' ||
    normalized === 'zh-mo'
  ) {
    return 'zh-Hant'
  }

  if (
    normalized === 'zh' ||
    normalized === 'zh-hans' ||
    normalized.startsWith('zh-hans-') ||
    normalized === 'zh-cn' ||
    normalized === 'zh-sg' ||
    normalized === 'zh-my'
  ) {
    return 'zh-Hans'
  }

  const baseLocale = normalized.includes('-')
    ? normalized.slice(0, normalized.indexOf('-'))
    : normalized
  return supportedLocales.find(
    (supportedLocale) => supportedLocale.toLowerCase() === baseLocale,
  )
}

export const resolvePreferredLocale = (headers: Headers) => {
  const cookieLocale = parseCookieHeader(headers.get('Cookie')).NEXT_LOCALE
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }

  const acceptLanguage = headers.get('Accept-Language') ?? ''
  for (const { language } of parseAcceptLanguage(acceptLanguage)) {
    const supported = matchAcceptedLanguage(language)
    if (supported) {
      return supported
    }
  }

  return defaultLocale
}
