'use client'

import {
  forwardRef,
  type ComponentType,
  type ComponentPropsWithoutRef,
} from 'react'

import { LanguageChooser } from '~/components/language-chooser'
import { ThemeChooser } from '~/components/theme-chooser'
import { useI18nPathname } from '~/hooks/use-i18n-pathname'
import { getLocale, localizeHref } from '~/paraglide/runtime'
import { m } from '~/paraglide/messages'

export interface HeaderLinkProps extends ComponentPropsWithoutRef<'a'> {
  href: string
}

const AnchorLink = forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ children, ...props }, ref) => {
    return (
      <a ref={ref} {...props}>
        {children}
      </a>
    )
  },
)
AnchorLink.displayName = 'AnchorLink'

interface HeaderProps {
  LinkComponent?: ComponentType<HeaderLinkProps>
}

export const Header = ({ LinkComponent = AnchorLink }: HeaderProps) => {
  const pathname = useI18nPathname()
  const locale = getLocale()

  const links = [
    { path: '/explore', label: m.explore() },
    { path: '/download', label: m.download() },
    { path: '/changelog', label: m.changelog() },
  ]

  return (
    <header className="relative z-10 mx-[2.7%] grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-x-8 border-b px-[2.2%] font-semibold max-[900px]:grid-cols-[auto_1fr] max-[900px]:gap-y-1 max-[900px]:pt-3 max-[700px]:mx-[6%] max-[700px]:px-0">
      <LinkComponent
        href={localizeHref('/', { locale })}
        aria-label={m.returnToHomepage()}
        aria-current={pathname === '/' ? 'page' : undefined}
        className="inline-flex w-fit items-center py-2 transition-colors hover:text-[var(--harbour-teal)]"
      >
        <span className="text-2xl font-bold tracking-tight">poi</span>
      </LinkComponent>
      <nav className="flex items-stretch gap-6 self-stretch max-[900px]:order-3 max-[900px]:col-span-2 max-[900px]:grid max-[900px]:grid-cols-3 max-[900px]:gap-2">
        {links.map(({ path, label }) => (
          <LinkComponent
            key={path}
            href={localizeHref(path, { locale })}
            aria-current={pathname === path ? 'page' : undefined}
            className="inline-flex items-center justify-center border-b-2 border-transparent px-1 py-4 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-[var(--harbour-teal)] aria-[current=page]:text-[var(--harbour-teal)] max-[900px]:py-3 max-[900px]:text-center"
          >
            {label}
          </LinkComponent>
        ))}
      </nav>
      <div className="header-tools ml-auto shrink-0">
        <a
          className="header-github"
          href="https://github.com/poooi/poi"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
        <LanguageChooser />
        <ThemeChooser />
      </div>
    </header>
  )
}
