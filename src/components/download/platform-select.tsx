'use client'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ChevronsUpDown } from 'lucide-react'

import { osAtom, specAtom } from './store'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { getPlatformLabels, getPlatformSpecLabel } from '~/lib/platform-labels'
import { OS, type PlatformSpec, platformToTarget } from '~/lib/target'
import { m } from '~/paraglide/messages'

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
  const platformLabels = getPlatformLabels()

  const osOptions = Object.values(OS).map((os) => ({
    label: platformLabels.os[os],
    value: os,
  }))

  const specOptions = Object.keys(platformToTarget[os!] ?? {}).map((spec) => ({
    label: getPlatformSpecLabel(os!, spec as PlatformSpec),
    value: spec,
  }))

  return (
    <div className="grid w-fit grid-cols-2 gap-4">
      <div>{m.operatingSystem()}</div>
      <div>
        <ComboBox
          placeholder={m.operatingSystem()}
          value={os as string}
          options={osOptions}
          onChange={(value) => {
            setOS(value as OS)
            setSpec(undefined)
          }}
        />
      </div>
      <div>{m.platform()}</div>
      <div>
        <ComboBox
          placeholder={m.platform()}
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
  placeholder: string
}

const ComboBox = ({
  disabled,
  onChange,
  options,
  placeholder,
  value,
}: ComboBoxProps) => {
  const currentLabel =
    options.find((option) => option.value === value)?.label ?? placeholder
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-80 max-w-full justify-between"
          aria-label={currentLabel}
          title={currentLabel}
        >
          <span className="min-w-0 grow truncate text-end">{currentLabel}</span>
          <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]">
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
