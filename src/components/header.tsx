/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import poiLogo from '~/assets/poi.png'
import { LanguageChooser } from '~/components/language-chooser'
import { ThemeChooser } from '~/components/theme-chooser'
import { Button } from '~/components/ui/button'
import { useI18nPathname } from '~/hooks/use-i18n-pathname'
import { cn } from '~/lib/utils'

export const Header = () => {
  const { t } = useTranslation()
  const pathname = useI18nPathname()

  return (
    <div className="flex h-16 items-center">
      <Link href="/" passHref>
        <Button variant="ghost" className={cn(pathname === '/' && 'opacity-0')}>
          <img src={poiLogo.src} alt="poi" className="h-8 w-8" />
        </Button>
      </Link>
      <Link href="/explore" passHref>
        <Button variant="ghost">{t('Explore')}</Button>
      </Link>
      <Link href="/downloads" passHref>
        <Button variant="ghost">{t('Downloads')}</Button>
      </Link>
      <ThemeChooser />
      <LanguageChooser />
    </div>
  )
}
