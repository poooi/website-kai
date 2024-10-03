import get from 'lodash/get'
import Link from 'next/link'

import { PlatformSelect } from './platform-select'

import { Button } from '~/components/ui/button'
import { initTranslations } from '~/i18n'
import {
  type OS,
  type CPU,
  platformToTarget,
  type DistributionType,
  type LinuxPackageFormat,
  type PlatformSpec,
} from '~/lib/target'
import { cn } from '~/lib/utils'

export const runtime = 'edge'

export default async function DownloadPage({
  params: { locale, options = [] },
}: {
  params: {
    locale: string
    options?: [OS?, PlatformSpec?]
  }
}) {
  const { t } = await initTranslations(locale, ['common'])
  const [os, spec] = options
  console.log(os, spec)

  return (
    <div>
      <PlatformSelect os={os} spec={spec} />
    </div>
  )
}
