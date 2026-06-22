'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

export type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps extends PropsWithChildren {
  attribute?: 'class'
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
  enableSystem?: boolean
}

interface ThemeContextValue {
  setTheme: (theme: Theme) => void
  theme: Theme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const storageKey = 'theme'

const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const applyTheme = (theme: Theme, enableSystem: boolean) => {
  const resolvedTheme =
    theme === 'system' && enableSystem ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey) as Theme | null
    const initialTheme = storedTheme ?? defaultTheme
    setThemeState(initialTheme)
    applyTheme(initialTheme, enableSystem)
  }, [defaultTheme, enableSystem])

  useEffect(() => {
    if (!enableSystem || theme !== 'system') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system', true)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [enableSystem, theme])

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      window.localStorage.setItem(storageKey, nextTheme)
      setThemeState(nextTheme)
      applyTheme(nextTheme, enableSystem)
    },
    [enableSystem],
  )

  const value = useMemo(() => ({ setTheme, theme }), [setTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
