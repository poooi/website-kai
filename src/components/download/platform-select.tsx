'use client'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ChevronsUpDown } from 'lucide-react'
import { useMemo } from 'react'

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
  labels: {
    operatingSystem: string
    os: Record<OS, string>
    platform: string
    spec: Record<PlatformSpec, string>
  }
}

export const PlatformSelect = ({
  initialOS,
  initialSpec,
  labels,
}: PlatformSelectProps) => {
  useHydrateAtoms([
    [osAtom, initialOS],
    [specAtom, initialSpec],
  ])

  const [os, setOS] = useAtom(osAtom)
  const [spec, setSpec] = useAtom(specAtom)

  const osOptions = useMemo(() => {
    return Object.values(OS).map((os) => ({ label: labels.os[os], value: os }))
  }, [labels.os])

  const specOptions = useMemo(() => {
    return Object.keys(platformToTarget[os!] ?? {}).map((spec) => ({
      label: labels.spec[spec as PlatformSpec],
      value: spec,
    }))
  }, [labels.spec, os])

  return (
    <div className="grid w-fit grid-cols-2 gap-4">
      <div>{labels.operatingSystem}</div>
      <div>
        <ComboBox
          placeholder={labels.operatingSystem}
          value={os as string}
          options={osOptions}
          onChange={(value) => {
            setOS(value as OS)
            setSpec(undefined)
          }}
        />
      </div>
      <div>{labels.platform}</div>
      <div>
        <ComboBox
          placeholder={labels.platform}
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
          className="w-56"
          aria-label={currentLabel}
          title={currentLabel}
        >
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
