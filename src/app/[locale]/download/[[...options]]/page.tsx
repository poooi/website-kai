import get from 'lodash/get'
import Link from 'next/link'
import { useMemo } from 'react'

import { Button } from '~/components/ui/button'
import { initTranslations } from '~/i18n'
import {
  OS,
  type CPU,
  platformToTarget,
  type DistributionType,
  type LinuxPackageFormat,
} from '~/lib/target'

export const runtime = 'edge'

export default async function DownloadPage({
  params: { locale, options = [] },
}: {
  params: {
    locale: string
    options?: [OS?, CPU?, (DistributionType | LinuxPackageFormat)?]
  }
}) {
  const { t } = await initTranslations(locale, ['common'])
  const [os, cpu, pacakgeFormatOrDistributionType] = options
  console.log(os, cpu, pacakgeFormatOrDistributionType)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const possibleOptions = get(platformToTarget, [os!, cpu!], {})

  console.log(
    possibleOptions,
    Object.keys(possibleOptions as object).length,
    typeof possibleOptions,
    pacakgeFormatOrDistributionType,
  )

  const shouldShowOptions =
    os === undefined || (cpu === undefined && os !== OS.macos)
  return (
    <div>
      <h2>{t('Operating system')}</h2>
      {os === undefined && (
        <div>
          {Object.keys(platformToTarget).map((system) => (
            <Button key={system} asChild>
              <Link href={`./${system}`}>{t(system as OS)}</Link>
            </Button>
          ))}
        </div>
      )}
      <h2>{t('Platform')}</h2>
      {os !== undefined &&
        cpu === undefined &&
        Object.keys(platformToTarget[os] ?? {}).map((platform) => (
          <Button key={platform} asChild>
            <Link href={`./${platform}`}>{t(platform as CPU)}</Link>
          </Button>
        ))}

      {shouldShowOptions && (
        <>
          <h2>{t('Options')}</h2>
          {pacakgeFormatOrDistributionType === undefined && (
            <div>
              {Object.keys(possibleOptions as object).map((option) => (
                <Button key={option} asChild>
                  <Link href={`./${option}`}>
                    {t(option as DistributionType | LinuxPackageFormat)}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
