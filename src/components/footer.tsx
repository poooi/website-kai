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
    <footer className="mx-[2.7%] flex min-h-[62px] items-center justify-between gap-5 border-t border-border py-4 text-sm/normal text-muted-foreground max-[700px]:mx-[6%] max-[700px]:flex-wrap max-[700px]:gap-3 max-[700px]:text-xs/normal">
      <span className="shrink-0">
        © {new Date().getFullYear()} poi Contributors
      </span>
      <div className="flex flex-wrap items-center gap-6 max-[700px]:gap-4">
        {footerItems
          .filter(({ applyLocales, skipLocales }) => {
            if (applyLocales) return applyLocales.includes(language)
            if (skipLocales) return !skipLocales.includes(language)
            return true
          })
          .map(({ url, icon: Icon, text }) => (
            <a
              className="inline-flex items-center gap-1.5 whitespace-nowrap hover:underline hover:underline-offset-[5px]"
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
