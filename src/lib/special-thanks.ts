import { m } from '~/paraglide/messages'

export interface SpecialThanksEntry {
  name: string
  url: string
  description: () => string
}

// Names, links and reasons mirror poi's assets/data/constant.cson (order kept);
// descriptions are localized and rendered without the legacy remote logos.
export const specialThanks: SpecialThanksEntry[] = [
  {
    name: 'KCwiki',
    url: 'https://zh.kcwiki.moe/wiki/%E8%88%B0%E5%A8%98%E7%99%BE%E7%A7%91',
    description: m.specialThanksKcwiki,
  },
  {
    name: 'TaoNPM',
    url: 'https://npmmirror.com/',
    description: m.specialThanksTaoNpm,
  },
  {
    name: 'Kancolle English Wikia',
    url: 'http://kancolle.wikia.com/wiki/Kancolle_Wiki',
    description: m.specialThanksKancolleWikia,
  },
  {
    name: 'Type 74 Electronic Observer',
    url: 'https://github.com/andanteyk/ElectronicObserver',
    description: m.specialThanksElectronicObserver,
  },
  {
    name: 'Who Calls The Fleet',
    url: 'http://fleet.moe',
    description: m.specialThanksWhoCallsTheFleet,
  },
  {
    name: 'Kensuke Tanaka',
    url: 'https://www.facebook.com/kensuke.tanaka.790',
    description: m.specialThanksTanaka,
  },
]
