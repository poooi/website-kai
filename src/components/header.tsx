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

  const onIndexPage = pathname === '/'

  return (
    <div className="flex h-16 items-center">
      <Button variant="ghost" size="icon" asChild>
        <Link className={cn(onIndexPage && 'cursor-auto opacity-0')} href="/">
          <img src={poiLogo.src} alt="poi" className="h-8 w-8" />
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/explore">{t('Explore')}</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/downloads" passHref>
          {t('Downloads')}
        </Link>
      </Button>
      <ThemeChooser />
      <LanguageChooser />
    </div>
  )
}
