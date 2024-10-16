import { type Metadata } from 'next'
import { headers } from 'next/headers'

import { DownloadLinks } from './download-links'
import { PlatformSelect } from './platform-select'

import { Transition } from '~/components/transition'
import { Button } from '~/components/ui/button'
import { initTranslations } from '~/i18n'
import { fetchPoiVersions } from '~/lib/fetch-poi-versions'
import { detectTargetFromRequest } from '~/lib/target'

export const runtime = 'edge'

export const generateMetadata = async ({
  params: { locale },
  previousMetadata,
}: Readonly<{
  params: {
    locale: string
  }
  previousMetadata: Metadata
}>): Promise<Metadata> => {
  const { t } = await initTranslations(locale, ['common'])
  return {
    ...previousMetadata,
    title: `poi | ${t('KanColle Browser')} | ${t('Download')}`,
  }
}

export default async function DownloadPage({
  params: { locale },
}: {
  params: {
    locale: string
  }
}) {
  const { t } = await initTranslations(locale, ['common'])
  const poiVersions = await fetchPoiVersions()
  const { os: initialOS, spec: initialSpec } =
    await detectTargetFromRequest(headers())

  return (
    <Transition className="prose flex w-full max-w-none grow flex-col dark:prose-invert">
      <h2 className="">{t('Download')}</h2>
      <section className="">
        <PlatformSelect initialOS={initialOS} initialSpec={initialSpec} />
        <DownloadLinks poiVersions={poiVersions} />
      </section>
      <h2>{t('Others')}</h2>
      <section className="flex w-fit flex-col items-center">
        <div>
          <Button variant="link" asChild>
            <a
              href="https://registry.npmmirror.com/binary.html?path=poi/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="old-versions"
            >
              {t('Old versions')}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://nightly.poi.moe/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Nightly builds')}
            </a>
          </Button>
          <Button variant="link" asChild>
            <a
              href="https://github.com/poooi/poi"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Source code')}
            </a>
          </Button>
        </div>
      </section>
    </Transition>
  )
}
