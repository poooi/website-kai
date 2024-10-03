import { remark } from 'remark'
import html from 'remark-html'

import { Transition } from '~/components/transition'

export const runtime = 'edge'

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
      className="prose dark:prose-invert w-full max-w-none grow"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    ></Transition>
  )
}
