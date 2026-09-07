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
      <PageProse
        className="lg:max-w-none prose-p:max-w-prose prose-ul:grid prose-ul:list-none prose-ul:gap-x-12 prose-ul:gap-y-6 prose-ul:pl-0 sm:prose-ul:grid-cols-2 prose-li:m-0 prose-li:border-t prose-li:pt-5 prose-li:pl-0"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </Transition>
  )
}
