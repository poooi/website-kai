export type Theme = 'dark' | 'light' | 'system'

export const themeCookieName = 'theme'

export const isTheme = (value: string | null | undefined): value is Theme => {
  return value === 'dark' || value === 'light' || value === 'system'
}

export const parseCookieString = (cookie: string) => {
  const cookies = Object.create(null) as Record<string, string>
  for (const entry of cookie.split(';')) {
    const [key, ...value] = entry.trim().split('=')
    if (key) {
      try {
        cookies[key] = decodeURIComponent(value.join('='))
      } catch {
        // Ignore malformed cookie values instead of failing request rendering.
      }
    }
  }
  return cookies
}

export const getThemeCookie = (cookie: string | null | undefined) => {
  if (!cookie) {
    return undefined
  }
  const theme = parseCookieString(cookie)[themeCookieName]
  return isTheme(theme) ? theme : undefined
}
