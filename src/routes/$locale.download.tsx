import { createFileRoute } from '@tanstack/react-router'

import { Button } from '~/components/ui/button'
import {
  loadCommonTranslations,
  requireSupportedLocale,
} from '~/lib/tanstack-page-data'

export const Route = createFileRoute('/$locale/download')({
  loader: ({ params }) =>
    loadCommonTranslations(requireSupportedLocale(params.locale)),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `poi | ${loaderData?.title ?? 'KanColle Browser'} | ${
          loaderData?.download ?? 'Download'
        }`,
      },
    ],
  }),
  component: LocalizedDownloadPage,
})

function LocalizedDownloadPage() {
  const t = Route.useLoaderData()
  return (
    <main className="prose mx-auto flex min-h-screen max-w-[960px] flex-col justify-center p-4 dark:prose-invert">
      <h1>{t.download}</h1>
      <p>{t.mobileHint}</p>
      <h2>{t.oldVersions}</h2>
      <div>
        <Button variant="link" asChild>
          <a
            href="https://registry.npmmirror.com/binary.html?path=poi/"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t.oldVersions}
          </a>
        </Button>
        <Button variant="link" asChild>
          <a
            href="https://nightly.poi.moe/"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t.nightlyBuilds}
          </a>
        </Button>
        <Button variant="link" asChild>
          <a
            href="https://github.com/poooi/poi"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t.sourceCode}
          </a>
        </Button>
      </div>
    </main>
  )
}
