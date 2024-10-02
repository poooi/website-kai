import get from 'lodash/get'
import Link from 'next/link'

import { Button } from '~/components/ui/button'
import { initTranslations } from '~/i18n'
import {
  OS,
  type CPU,
  platformToTarget,
  type DistributionType,
  type LinuxPackageFormat,
  PlatformSpec,
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
      <h2>
        <Link href="/download">{t('Operating system')}</Link>
      </h2>
      {os === undefined && (
        <div>
          {Object.keys(platformToTarget).map((system) => (
            <Button key={system} asChild>
              <Link href={`./${system}`}>{t(system as OS)}</Link>
            </Button>
          ))}
        </div>
      )}
      <h2>
        <Link href={`/download/${os}`}>{t('Platform')}</Link>
      </h2>
      {os !== undefined &&
        spec === undefined &&
        Object.keys(platformToTarget[os] ?? {}).map((platform) => (
          <Button key={platform} asChild>
            <Link href={`./${platform}`}>{t(platform as PlatformSpec)}</Link>
          </Button>
        ))}
    </div>
  )
}
