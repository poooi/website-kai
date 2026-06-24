'use client'

import {
  forwardRef,
  type ComponentType,
  type ComponentPropsWithoutRef,
} from 'react'
import { useTranslation } from 'react-i18next'

import poiLogo from '~/assets/poi.png'
import { LanguageChooser } from '~/components/language-chooser'
import { ThemeChooser } from '~/components/theme-chooser'
import { Button } from '~/components/ui/button'
import { useI18nPathname } from '~/hooks/use-i18n-pathname'
import { localizePath } from '~/lib/i18n-routing'
import { cn } from '~/lib/utils'

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
  const { i18n, t } = useTranslation()
  const pathname = useI18nPathname()

  const onIndexPage = pathname === '/'

  return (
    <div className="flex h-16 w-full items-center">
      <nav className="flex grow items-center">
        <Button variant="ghost" size="icon" asChild>
          <LinkComponent
            className={cn(onIndexPage && 'cursor-auto opacity-0')}
            href={localizePath('/', i18n.language)}
          >
            <img src={poiLogoSrc} alt="poi" className="h-8 w-8" />
          </LinkComponent>
        </Button>
        <Button variant="ghost" asChild>
          <LinkComponent href={localizePath('/explore', i18n.language)}>
            {t('Explore')}
          </LinkComponent>
        </Button>
        <Button variant="ghost" asChild>
          <LinkComponent href={localizePath('/download', i18n.language)}>
            {t('Download')}
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
