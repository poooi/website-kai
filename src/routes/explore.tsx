import { createFileRoute } from '@tanstack/react-router'

import { Transition } from '~/components/transition'
import { loadExploreHtml } from '~/lib/tanstack-page-data'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/explore')({
  loader: async () => ({
    contentHtml: await loadExploreHtml(),
  }),
  head: () => ({
    meta: [
      {
        title: `poi | ${m.kanColleBrowser()} | ${m.explore()}`,
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
