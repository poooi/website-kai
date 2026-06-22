import { createFileRoute } from '@tanstack/react-router'

import {
  loadCommonTranslations,
  loadExploreHtml,
  requireSupportedLocale,
} from '~/lib/tanstack-page-data'

export const Route = createFileRoute('/$locale/explore')({
  loader: async ({ params }) => {
    const locale = requireSupportedLocale(params.locale)
    return {
      ...(await loadCommonTranslations(locale)),
      contentHtml: await loadExploreHtml(locale),
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `poi | ${loaderData?.title ?? 'KanColle Browser'} | ${
          loaderData?.explore ?? 'Explore'
        }`,
      },
    ],
  }),
  component: LocalizedExplorePage,
})

function LocalizedExplorePage() {
  const { contentHtml } = Route.useLoaderData()
  return (
    <main
      className="prose mx-auto min-h-screen max-w-[960px] p-4 dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  )
}
