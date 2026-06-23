'use client'

import {
  atom,
  Provider as JotaiProvider,
  useAtom,
  useAtomValue,
  useSetAtom,
} from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type PropsWithChildren,
} from 'react'

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
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

const themeAtom = atom<Theme>('system')
const resolvedThemeAtom = atom<'dark' | 'light'>('light')

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
  document.cookie = `${themeCookieName}=${theme};max-age=31536000;path=/;SameSite=Lax`
}

const getStoredTheme = () => {
  try {
    const storedTheme = window.localStorage.getItem(storageKey)
    return isTheme(storedTheme) ? storedTheme : undefined
  } catch {
    return undefined
  }
}

const setStoredTheme = (theme: Theme) => {
  try {
    window.localStorage.setItem(storageKey, theme)
  } catch {
    // Storage can be disabled; the theme cookie still preserves preference.
  }
}

const applyTheme = (
  theme: Theme,
  enableSystem: boolean,
  disableTransitionOnChange: boolean,
): 'dark' | 'light' => {
  const restoreTransitions = disableTransitionOnChange
    ? disableTransitions()
    : undefined
  const resolvedTheme =
    theme === 'dark'
      ? 'dark'
      : theme === 'light'
        ? 'light'
        : enableSystem
          ? getSystemTheme()
          : 'light'
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  restoreTransitions?.()
  return resolvedTheme
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
  const setResolvedTheme = useSetAtom(resolvedThemeAtom)
  const skipThemeEffect = useRef(true)

  useIsomorphicLayoutEffect(() => {
    const cookieTheme = getThemeCookie(document.cookie)
    const initialTheme = cookieTheme ?? getStoredTheme() ?? defaultTheme
    setTheme(initialTheme)
    setStoredTheme(initialTheme)
    setThemeCookie(initialTheme)
    setResolvedTheme(
      applyTheme(initialTheme, enableSystem, disableTransitionOnChange),
    )
  }, [
    defaultTheme,
    disableTransitionOnChange,
    enableSystem,
    setResolvedTheme,
    setTheme,
  ])

  useEffect(() => {
    const skipPersistence = skipThemeEffect.current
    if (skipPersistence) {
      skipThemeEffect.current = false
    }

    if (!skipPersistence) {
      setStoredTheme(theme)
      setThemeCookie(theme)
      setResolvedTheme(
        applyTheme(theme, enableSystem, disableTransitionOnChange),
      )
    }

    if (enableSystem && theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        setResolvedTheme(applyTheme('system', true, disableTransitionOnChange))
      }
      media.addEventListener('change', handleChange)
      return () => media.removeEventListener('change', handleChange)
    }
  }, [disableTransitionOnChange, enableSystem, setResolvedTheme, theme])

  return <>{children}</>
}

export const useTheme = () => {
  return {
    resolvedTheme: useAtomValue(resolvedThemeAtom),
    setTheme: useSetAtom(themeAtom),
    theme: useAtomValue(themeAtom),
  }
}
