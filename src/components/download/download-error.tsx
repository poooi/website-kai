import { m } from '~/paraglide/messages'
import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'

export const DownloadError = () => (
  <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-10 sm:px-10 sm:pt-14 lg:px-16">
    <PageHeader title={m.download()} />
    <PageProse>
      <p role="alert">{m.releaseLoadError()}</p>
      <a href="https://github.com/poooi/poi/releases">
        {m.originalReleases()} ↗
      </a>
    </PageProse>
  </main>
)
