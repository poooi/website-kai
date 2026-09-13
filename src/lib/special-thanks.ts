import electronicObserverLogo from '~/assets/credits/electronic-observer.png?url'
import kancolleWikiaLogo from '~/assets/credits/kancolle-wikia.webp?url'
import kcwikiLogo from '~/assets/credits/kcwiki.png?url'
import kensukeTanakaLogo from '~/assets/credits/kensuke-tanaka.jpg?url'
import taonpmLogo from '~/assets/credits/taonpm.png?url'
import whoCallsTheFleetLogo from '~/assets/credits/who-calls-the-fleet.png?url'
import { m } from '~/paraglide/messages'

interface SpecialThanksLogo {
  src: string
  boxClassName: string
  imgClassName: string
}

export interface SpecialThanksEntry {
  name: string
  url: string
  description: () => string
  logo?: SpecialThanksLogo
}

// Every logo uses the same 64x64 slot. Wide banners are left-aligned and
// clipped by the slot so the left emblem shows; square marks and the portrait
// are contained, with the portrait cover-cropped to the face. No copied
// percentage margins or clip paths from the old layout.
const cropBox =
  'relative flex h-16 w-16 shrink-0 items-center justify-start overflow-hidden rounded bg-muted'
const containBox =
  'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-muted'
const bannerImage = 'h-full w-auto max-w-none'
// KCwiki's banner keeps a stray word at its right edge; clip past it and nudge
// the emblem toward the slot centre.
const kcwikiImage =
  'h-full w-auto max-w-none translate-x-1.5 [clip-path:inset(0_78%_0_0)]'
const containImage = 'h-full w-full object-contain'
const portraitImage = 'h-full w-full object-cover object-[35%_30%]'

export const specialThanks: SpecialThanksEntry[] = [
  {
    name: 'KCwiki',
    url: 'https://zh.kcwiki.moe/wiki/%E8%88%B0%E5%A8%98%E7%99%BE%E7%A7%91',
    description: m.specialThanksKcwiki,
    logo: {
      src: kcwikiLogo,
      boxClassName: cropBox,
      imgClassName: kcwikiImage,
    },
  },
  {
    name: 'TaoNPM',
    url: 'https://npmmirror.com/',
    description: m.specialThanksTaoNpm,
    logo: {
      src: taonpmLogo,
      boxClassName: containBox,
      imgClassName: containImage,
    },
  },
  {
    name: 'Kancolle English Wikia',
    url: 'http://kancolle.wikia.com/wiki/Kancolle_Wiki',
    description: m.specialThanksKancolleWikia,
    logo: {
      src: kancolleWikiaLogo,
      boxClassName: cropBox,
      imgClassName: bannerImage,
    },
  },
  {
    name: 'Type 74 Electronic Observer',
    url: 'https://github.com/andanteyk/ElectronicObserver',
    description: m.specialThanksElectronicObserver,
    logo: {
      src: electronicObserverLogo,
      boxClassName: containBox,
      imgClassName: containImage,
    },
  },
  {
    name: 'Who Calls The Fleet',
    url: 'http://fleet.moe',
    description: m.specialThanksWhoCallsTheFleet,
    logo: {
      src: whoCallsTheFleetLogo,
      boxClassName: containBox,
      imgClassName: containImage,
    },
  },
  {
    name: 'Kensuke Tanaka',
    url: 'https://www.facebook.com/kensuke.tanaka.790',
    description: m.specialThanksTanaka,
    logo: {
      src: kensukeTanakaLogo,
      boxClassName: containBox,
      imgClassName: portraitImage,
    },
  },
]
