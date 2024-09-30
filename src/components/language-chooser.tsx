'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { i18nConfig } from '~/i18n-config'
import { GlobeIcon } from '@radix-ui/react-icons'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

export const LanguageChooser = () => {
  const { t, i18n } = useTranslation()
  const currentLocale = i18n.language
  const router = useRouter()
  const currentPathname = usePathname()

  const handleChange = useCallback(
    (newLocale: string) => {
      // set cookie for next-i18n-router
      const days = 30
      const date = new Date()
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      const expires = date.toUTCString()
      document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`

      // redirect to the new locale path
      if (currentLocale === i18nConfig.defaultLocale) {
        router.push('/' + newLocale + currentPathname)
      } else {
        router.push(
          currentPathname.replace(`/${currentLocale}`, `/${newLocale}`),
        )
      }

      router.refresh()
    },
    [currentLocale, currentPathname, router],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title={t('language')}
          aria-label={t('language')}
        >
          <GlobeIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={currentLocale}
          onValueChange={handleChange}
        >
          {i18nConfig.locales.map((locale) => (
            <DropdownMenuRadioItem key={locale} value={locale}>
              {t('language', { lng: locale })}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
