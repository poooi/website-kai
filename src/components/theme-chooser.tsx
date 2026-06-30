'use client'

import { MoonIcon, SunIcon } from 'lucide-react'

import { useTheme } from '~/components/theme-runtime'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { type Theme } from '~/lib/theme'
import { m } from '~/paraglide/messages'

export const ThemeChooser = () => {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (value: string) => {
    if (value === 'dark' || value === 'light' || value === 'system') {
      setTheme(value satisfies Theme)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title={m.theme()}
          aria-label={m.theme()}
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{m.theme()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          <DropdownMenuRadioItem value="light">
            {m.lilywhite()}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            {m.chibaheit()}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            {m.system()}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
