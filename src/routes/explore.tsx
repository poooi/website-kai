import { createFileRoute } from '@tanstack/react-router'

import { Transition } from '~/components/transition'
import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'
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
    <Transition>
      <PageHeader title={m.explore()} />
      <PageProse dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Transition>
  )
}
