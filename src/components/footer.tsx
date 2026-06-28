import {
  type IconType,
  SiDiscord,
  SiGithub,
  SiOpencollective,
  SiSinaweibo,
  SiTelegram,
  SiX,
} from '@icons-pack/react-simple-icons'

import { Button } from './ui/button'

import { m } from '~/paraglide/messages'
import { getLocale, type Locale } from '~/paraglide/runtime'

interface FooterItem {
  url: string
  icon: IconType
  text: () => string
  skipLocales?: Locale[]
  applyLocales?: Locale[]
}

const footerItems: FooterItem[] = [
  {
    url: 'http://weibo.com/letspoi',
    icon: SiSinaweibo,
    text: m.weibo,
    applyLocales: ['zh-Hans', 'zh-Hant'],
  },
  {
    url: 'https://t.me/poiCN',
    icon: SiTelegram,
    text: m.telegram,
    applyLocales: ['zh-Hans', 'zh-Hant'],
  },
  {
    url: 'https://discord.gg/6u8rZ2P',
    icon: SiDiscord,
    text: m.discordSubChannel,
    skipLocales: ['zh-Hans', 'zh-Hant'],
  },
  {
    url: 'https://github.com/poooi/poi',
    icon: SiGithub,
    text: m.github,
  },
  {
    url: 'https://opencollective.com/poi',
    icon: SiOpencollective,
    text: m.opencollective,
  },
  {
    url: 'https://x.com/KochiyaOcean',
    icon: SiX,
    text: m.x,
  },
]

export const Footer = () => {
  const language = getLocale()
  return (
    <div className="inline-flex w-fit flex-wrap items-center gap-x-8 gap-y-2 text-nowrap py-4 md:flex md:flex-nowrap">
      <span className="px-4">{`© ${new Date().getFullYear()} poi Contributors`}</span>
      <div className="grid grid-cols-2 place-items-start xl:flex">
        {footerItems
          .filter(({ applyLocales, skipLocales }) => {
            if (applyLocales) {
              return applyLocales.includes(language)
            }
            if (skipLocales) {
              return !skipLocales.includes(language)
            }
            return true
          })
          .map(({ url, icon: Icon, text }) => (
            <Button variant="link" asChild key={url}>
              <a
                className="inline-flex gap-1"
                href={url}
                target="_blank"
                rel="noopener"
              >
                <Icon className="h-4 w-4" />
                <span>{text()}</span>
              </a>
            </Button>
          ))}
      </div>
    </div>
  )
}
