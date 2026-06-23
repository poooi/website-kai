import { atom } from 'jotai'

import { type Theme } from '~/lib/theme'

export const themeAtom = atom<Theme>('system')

export const resolvedThemeAtom = atom<'dark' | 'light'>('light')
