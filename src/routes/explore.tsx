import { createFileRoute } from '@tanstack/react-router'

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
    <main
      className="prose mx-auto min-h-screen max-w-[960px] p-4 dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  )
}
