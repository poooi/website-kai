'use client'

import {
  forwardRef,
  type ComponentType,
  type ComponentPropsWithoutRef,
} from 'react'

import poiLogo from '~/assets/poi.png'
import { LanguageChooser } from '~/components/language-chooser'
import { ThemeChooser } from '~/components/theme-chooser'
import { Button } from '~/components/ui/button'
import { useI18nPathname } from '~/hooks/use-i18n-pathname'
import { cn } from '~/lib/utils'
import { getLocale, localizeHref } from '~/paraglide/runtime'
import { m } from '~/paraglide/messages'

const poiLogoSrc = typeof poiLogo === 'string' ? poiLogo : poiLogo.src

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

  const onIndexPage = pathname === '/'

  return (
    <div className="flex h-16 w-full items-center">
      <nav className="flex grow items-center">
        <Button variant="ghost" size="icon" asChild>
          <LinkComponent
            className={cn(onIndexPage && 'cursor-auto opacity-0')}
            href={localizeHref('/', { locale })}
          >
            <img src={poiLogoSrc} alt="poi" className="h-8 w-8" />
          </LinkComponent>
        </Button>
        <Button variant="ghost" asChild>
          <LinkComponent href={localizeHref('/explore', { locale })}>
            {m.explore()}
          </LinkComponent>
        </Button>
        <Button variant="ghost" asChild>
          <LinkComponent href={localizeHref('/download', { locale })}>
            {m.download()}
          </LinkComponent>
        </Button>
      </nav>
      <div className="flex shrink-0 gap-4">
        <ThemeChooser />
        <LanguageChooser />
      </div>
    </div>
  )
}
