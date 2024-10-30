import { type Metadata } from 'next'
import { remark } from 'remark'
import html from 'remark-html'

import { Transition } from '~/components/transition'
import { initTranslations } from '~/i18n'

export const runtime = 'edge'

export const generateMetadata = async (
  props: Readonly<{
    params: Promise<{
      locale: string
    }>
    previousMetadata: Metadata
  }>,
): Promise<Metadata> => {
  const params = await props.params

  const { locale } = params

  const { previousMetadata } = props

  const { t } = await initTranslations(locale, ['common'])
  return {
    ...previousMetadata,
    title: `poi | ${t('KanColle Browser')} | ${t('Explore')}`,
  }
}

export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const { locale } = params

  console.log(locale)

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
