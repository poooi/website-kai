import {
  type IconType,
  SiDiscord,
  SiGithub,
  SiOpencollective,
  SiSinaweibo,
  SiTelegram,
  SiX,
} from '@icons-pack/react-simple-icons'

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
    <footer className="site-footer">
      <span className="shrink-0">
        © {new Date().getFullYear()} poi Contributors
      </span>
      <div className="items-center">
        {footerItems
          .filter(({ applyLocales, skipLocales }) => {
            if (applyLocales) return applyLocales.includes(language)
            if (skipLocales) return !skipLocales.includes(language)
            return true
          })
          .map(({ url, icon: Icon, text }) => (
            <a
              className="inline-flex items-center gap-1.5 whitespace-nowrap"
              href={url}
              key={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{text()}</span>
            </a>
          ))}
      </div>
    </footer>
  )
}
