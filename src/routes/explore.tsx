import { createFileRoute } from '@tanstack/react-router'

import { Transition } from '~/components/transition'
import {
  loadCommonTranslations,
  loadExploreHtml,
} from '~/lib/tanstack-page-data'

export const Route = createFileRoute('/explore')({
  loader: async () => ({
    ...(await loadCommonTranslations()),
    contentHtml: await loadExploreHtml(),
  }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `poi | ${loaderData?.title ?? 'KanColle Browser'} | ${
          loaderData?.explore ?? 'Explore'
        }`,
      },
    ],
  }),
  component: ExplorePage,
})

function ExplorePage() {
  const { contentHtml } = Route.useLoaderData()
  return (
    <Transition
      role="main"
      className="prose w-full max-w-none grow dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  )
}
