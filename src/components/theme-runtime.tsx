'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { resolvedThemeAtom, themeAtom } from '~/components/theme-atoms'
import {
  getThemeCookie,
  isTheme,
  themeCookieName,
  type Theme,
} from '~/lib/theme'

interface ThemeRuntimeOptions {
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
  enableSystem?: boolean
}

const storageKey = themeCookieName
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

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

export const useThemeRuntime = ({
  defaultTheme = 'system',
  disableTransitionOnChange = false,
  enableSystem = true,
}: ThemeRuntimeOptions = {}) => {
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
}

export const ThemeRuntime = (options: ThemeRuntimeOptions) => {
  useThemeRuntime(options)
  return null
}

export const useTheme = () => {
  return {
    resolvedTheme: useAtomValue(resolvedThemeAtom),
    setTheme: useSetAtom(themeAtom),
    theme: useAtomValue(themeAtom),
  }
}
