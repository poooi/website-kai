'use client'

import { GlobeIcon } from '@radix-ui/react-icons'
import { useCallback } from 'react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { m } from '~/paraglide/messages'
import {
  getLocale,
  isLocale,
  locales,
  setLocale,
  type Locale,
} from '~/paraglide/runtime'

export const LanguageChooser = () => {
  const currentLocale = getLocale()

  const handleChange = useCallback((newLocale: string) => {
    if (isLocale(newLocale)) {
      void setLocale(newLocale)
    }
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title={m.language()}
          aria-label={m.language()}
        >
          <GlobeIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">{m.language()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={currentLocale}
          onValueChange={handleChange}
        >
          {locales.map((locale: Locale) => (
            <DropdownMenuRadioItem key={locale} value={locale}>
              {m.language({}, { locale })}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
