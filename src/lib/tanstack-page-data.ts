import { remark } from 'remark'
import html from 'remark-html'

import { initTranslations } from '~/i18n'
import {
  defaultLocale,
  isSupportedLocale,
  type SupportedLocale,
} from '~/lib/i18n-routing'

const exploreContentByLocale = import.meta.glob<string>(
  '../contents/explore/*.md',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

export const requireSupportedLocale = (locale: string): SupportedLocale => {
  if (!isSupportedLocale(locale)) {
    // TanStack route loaders consume thrown Responses for HTTP status control.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response('', { status: 404 })
  }

  return locale
}

export const loadCommonTranslations = async (
  locale: string = defaultLocale,
) => {
  const supportedLocale = requireSupportedLocale(locale)
  const { t } = await initTranslations(supportedLocale, ['common'])
  return {
    description: t('description'),
    download: t('Download'),
    downloadOptions: t('Download options'),
    explore: t('Explore'),
    httpsUpdateSupported: t('HTTPS game update supported!'),
    language: t('language'),
    mobileHint: t('mobile-hint'),
    name: t('name'),
    nightlyBuilds: t('Nightly builds'),
    oldVersions: t('Old versions'),
    sourceCode: t('Source code'),
    title: t('KanColle Browser'),
  }
}

export const loadExploreHtml = async (locale: string = defaultLocale) => {
  const supportedLocale = requireSupportedLocale(locale)
  const content =
    exploreContentByLocale[`../contents/explore/${supportedLocale}.md`]
  if (!content) {
    // TanStack route loaders consume thrown Responses for HTTP status control.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response('', { status: 404 })
  }

  return (await remark().use(html).process(content)).toString()
}
