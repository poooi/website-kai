import {
  type IconType,
  SiDiscord,
  SiGithub,
  SiOpencollective,
  SiSinaweibo,
  SiTelegram,
} from '@icons-pack/react-simple-icons'
import { type TFunction, type i18n, type CustomTypeOptions } from 'i18next'

import { Button } from './ui/button'

interface FooterProps {
  i18n: i18n
  t: TFunction
}

interface FooterItem {
  url: string
  icon: IconType
  text: keyof CustomTypeOptions['resources']['common']
  skipLocales?: string[] // should be hidden for these locales
  applyLocales?: string[] // should shown for these locales
}

const footerItems = [
  {
    url: 'http://weibo.com/letspoi',
    icon: SiSinaweibo,
    text: 'weibo',
    applyLocales: ['zh-Hans', 'zh-Hant'],
  },
  {
    url: 'https://t.me/poiCN',
    icon: SiTelegram,
    text: 'telegram',
    applyLocales: ['zh-Hans', 'zh-Hant'],
  },
  {
    url: 'https://discord.gg/6u8rZ2P',
    icon: SiDiscord,
    text: 'Discord sub-channel',
    skipLocales: ['zh-Hans', 'zh-Hant'],
  },
  {
    url: 'https://github.com/poooi/poi',
    icon: SiGithub,
    text: 'github',
  },
  {
    url: 'https://opencollective.com/poi',
    icon: SiOpencollective,
    text: 'opencollective',
  },
] satisfies FooterItem[]

export const Footer = ({ i18n, t }: FooterProps) => {
  const { language } = i18n
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
                <span>{t(text)}</span>
              </a>
            </Button>
          ))}
      </div>
    </div>
  )
}
