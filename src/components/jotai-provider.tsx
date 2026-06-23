'use client'

import { Provider as JotaiProvider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { type PropsWithChildren } from 'react'

import { resolvedThemeAtom, themeAtom } from '~/components/theme-atoms'
import { type Theme } from '~/lib/theme'

interface JotaiRootProviderProps extends PropsWithChildren {
  initialResolvedTheme?: 'dark' | 'light'
  initialTheme?: Theme
}

const HydrateAtoms = ({
  children,
  initialResolvedTheme = 'light',
  initialTheme = 'system',
}: JotaiRootProviderProps) => {
  useHydrateAtoms([
    [themeAtom, initialTheme],
    [resolvedThemeAtom, initialResolvedTheme],
  ])

  return <>{children}</>
}

export const JotaiRootProvider = ({
  children,
  initialResolvedTheme,
  initialTheme,
}: JotaiRootProviderProps) => {
  return (
    <JotaiProvider>
      <HydrateAtoms
        initialResolvedTheme={initialResolvedTheme}
        initialTheme={initialTheme}
      >
        {children}
      </HydrateAtoms>
    </JotaiProvider>
  )
}
