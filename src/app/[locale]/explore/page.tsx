import { type Metadata } from 'next'
import { remark } from 'remark'
import html from 'remark-html'

import { Transition } from '~/components/transition'
import { initTranslations } from '~/i18n'

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
    title: `poi | ${t('KanColle Browser')} | ${t('Explore')}`,
  }
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const content =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (await import(`~/contents/explore/${locale}.md`)).default as string
  const processedContent = await remark().use(html).process(content)
  const contentHtml = processedContent.toString()

  return (
    <Transition
      className="prose w-full max-w-none grow dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    ></Transition>
  )
}
