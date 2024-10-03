import { PlatformSelect } from './platform-select'

import { initTranslations } from '~/i18n'
import { type OS, type PlatformSpec } from '~/lib/target'

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
