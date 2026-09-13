'use client'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ChevronsUpDown } from 'lucide-react'

import { osAtom, specAtom } from './store'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { getPlatformLabels, getPlatformSpecLabel } from '~/lib/platform-labels'
import {
  OS,
  type PlatformSpec,
  platformToTarget,
  type Target,
} from '~/lib/target'
import { m } from '~/paraglide/messages'

interface PlatformSelectProps {
  initialOS?: OS
  initialSpec?: PlatformSpec
  availableTargets: Target[]
}

export const PlatformSelect = ({
  initialOS,
  initialSpec,
  availableTargets,
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

  const specOptions = Object.keys(platformToTarget[os!] ?? {})
    .filter((spec) => {
      const target = platformToTarget[os!]?.[spec as PlatformSpec]
      return target !== undefined && availableTargets.includes(target)
    })
    .map((spec) => ({
      label: getPlatformSpecLabel(os!, spec as PlatformSpec),
      value: spec,
    }))

  return (
    <div className="flex min-w-0 flex-col gap-7" data-testid="platform-select">
      <div className="flex flex-col gap-3">
        <span id="download-os-label" className="field-label">
          {m.operatingSystem()}
        </span>
        <ComboBox
          labelledBy="download-os-label"
          placeholder={m.operatingSystem()}
          value={os as string}
          options={osOptions}
          onChange={(value) => {
            setOS(value as OS)
            setSpec(undefined)
          }}
        />
      </div>
      <div className="flex flex-col gap-3">
        <span id="download-package-label" className="field-label">
          {m.downloadPackage()}
        </span>
        <ComboBox
          labelledBy="download-package-label"
          placeholder={m.downloadPackage()}
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
  labelledBy: string
}

const ComboBox = ({
  disabled,
  onChange,
  options,
  placeholder,
  value,
  labelledBy,
}: ComboBoxProps) => {
  const currentLabel =
    options.find((option) => option.value === value)?.label ?? placeholder
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          disabled={disabled}
          className="field-control w-full justify-between gap-3 px-4 font-normal"
          aria-labelledby={labelledBy + ' ' + labelledBy + '-value'}
          title={currentLabel}
        >
          <span
            id={labelledBy + '-value'}
            className="min-w-0 grow text-left whitespace-normal"
          >
            {currentLabel}
          </span>
          <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuRadioGroup value={value ?? ''} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="py-3"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
