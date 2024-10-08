'use client'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ChevronsUpDown } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { osAtom, specAtom } from './store'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { OS, type PlatformSpec, platformToTarget } from '~/lib/target'

interface PlatformSelectProps {
  initialOS?: OS
  initialSpec?: PlatformSpec
}

export const PlatformSelect = ({
  initialOS,
  initialSpec,
}: PlatformSelectProps) => {
  useHydrateAtoms([
    [osAtom, initialOS],
    [specAtom, initialSpec],
  ])

  const [os, setOS] = useAtom(osAtom)
  const [spec, setSpec] = useAtom(specAtom)

  const { t } = useTranslation()
  const osOptions = useMemo(() => {
    return Object.values(OS).map((os) => ({ label: t(os), value: os }))
  }, [t])

  const specOptions = useMemo(() => {
    return Object.keys(platformToTarget[os!] ?? {}).map((spec) => ({
      label: t(spec as PlatformSpec),
      value: spec,
    }))
  }, [t, os])
  return (
    <div className="grid w-fit grid-cols-2 gap-4">
      <div>{t('Operating system')}</div>
      <div>
        <ComboBox
          value={os as string}
          options={osOptions}
          onChange={(value) => {
            setOS(value as OS)
            setSpec(undefined)
          }}
        />
      </div>
      <div>{t('Platform')}</div>
      <div>
        <ComboBox
          value={spec as string}
          options={specOptions}
          onChange={(value) => {
            setSpec(value as PlatformSpec)
          }}
          disabled={!os}
        />
      </div>
    </div>
  )
}

interface ComboBoxProps {
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  disabled?: boolean
}

const ComboBox = ({ options, value, onChange, disabled }: ComboBoxProps) => {
  const currentLabel =
    options.find((option) => option.value === value)?.label ?? ''
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-56">
          <span className="grow text-end">{currentLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
