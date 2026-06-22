import { createFileRoute, Link } from '@tanstack/react-router'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { loadCommonTranslations } from '~/lib/tanstack-page-data'

export const Route = createFileRoute('/')({
  loader: () => loadCommonTranslations(),
  head: ({ loaderData }) => ({
    meta: [{ title: `poi | ${loaderData?.title ?? '艦これ専ブラ'}` }],
  }),
  component: HomePage,
})

function HomePage() {
  const t = Route.useLoaderData()
  return (
    <main className="mx-auto flex min-h-screen max-w-[960px] flex-col items-start justify-center gap-6 bg-background p-4 text-foreground">
      <h1 className="text-7xl leading-loose">{t.name}</h1>
      <p className="text-2xl">{t.description}</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/download">{t.download}</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/explore">{t.explore}</Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-500 text-white">
          {t.newLabel}
        </Badge>
        <span>{t.httpsUpdateSupported}</span>
      </div>
    </main>
  )
}
