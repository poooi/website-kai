'use client'

import {
  atom,
  Provider as JotaiProvider,
  useAtom,
  useAtomValue,
  useSetAtom,
} from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { useEffect, useRef, type PropsWithChildren } from 'react'

import {
  getThemeCookie,
  isTheme,
  themeCookieName,
  type Theme,
} from '~/lib/theme'

interface ThemeProviderProps extends PropsWithChildren {
  attribute?: 'class'
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
  enableSystem?: boolean
}

const storageKey = themeCookieName

const themeAtom = atom<Theme>('system')

const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const disableTransitions = () => {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode('*{transition:none!important}'))
  document.head.appendChild(style)
  window.getComputedStyle(document.body)
  return () => {
    style.remove()
  }
}

const setThemeCookie = (theme: Theme) => {
  document.cookie = `${themeCookieName}=${theme};max-age=31536000;path=/;sameSite=lax`
}

const applyTheme = (
  theme: Theme,
  enableSystem: boolean,
  disableTransitionOnChange: boolean,
) => {
  const restoreTransitions = disableTransitionOnChange
    ? disableTransitions()
    : undefined
  const resolvedTheme =
    theme === 'system' && enableSystem ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  restoreTransitions?.()
}

export const ThemeProvider = ({
  attribute = 'class',
  children,
  defaultTheme = 'system',
  disableTransitionOnChange = false,
  enableSystem = true,
}: ThemeProviderProps) => {
  return (
    <JotaiProvider>
      <ThemeHydrator
        attribute={attribute}
        defaultTheme={defaultTheme}
        disableTransitionOnChange={disableTransitionOnChange}
        enableSystem={enableSystem}
      >
        {children}
      </ThemeHydrator>
    </JotaiProvider>
  )
}

const ThemeHydrator = ({
  children,
  defaultTheme = 'system',
  disableTransitionOnChange = false,
  enableSystem = true,
}: ThemeProviderProps) => {
  useHydrateAtoms([[themeAtom, defaultTheme]])
  const [theme, setTheme] = useAtom(themeAtom)
  const skipThemeEffect = useRef(true)

  useEffect(() => {
    const cookieTheme = getThemeCookie(document.cookie)
    const storedTheme = window.localStorage.getItem(storageKey)
    const initialTheme =
      cookieTheme ?? (isTheme(storedTheme) ? storedTheme : defaultTheme)
    setTheme(initialTheme)
    applyTheme(initialTheme, enableSystem, disableTransitionOnChange)
  }, [defaultTheme, disableTransitionOnChange, enableSystem, setTheme])

  useEffect(() => {
    const skipPersistence = skipThemeEffect.current
    if (skipPersistence) {
      skipThemeEffect.current = false
    }

    if (!skipPersistence) {
      window.localStorage.setItem(storageKey, theme)
      setThemeCookie(theme)
      applyTheme(theme, enableSystem, disableTransitionOnChange)
    }

    if (enableSystem && theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () =>
        applyTheme('system', true, disableTransitionOnChange)
      media.addEventListener('change', handleChange)
      return () => media.removeEventListener('change', handleChange)
    }
  }, [disableTransitionOnChange, enableSystem, theme])

  return <>{children}</>
}

export const useTheme = () => {
  return {
    setTheme: useSetAtom(themeAtom),
    theme: useAtomValue(themeAtom),
  }
}
