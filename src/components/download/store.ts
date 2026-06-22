import { atom } from 'jotai'

import { type OS, type PlatformSpec } from '~/lib/target'

export const osAtom = atom<OS>()

export const specAtom = atom<PlatformSpec>()
