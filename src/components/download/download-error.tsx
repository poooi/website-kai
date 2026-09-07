import { m } from '~/paraglide/messages'
import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'

export const DownloadError = () => (
  <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 bg-background px-6 pt-10 pb-20 sm:px-10 sm:pt-14 lg:px-16">
    <PageHeader title={m.download()} />
    <PageProse>
      <p role="alert">{m.releaseLoadError()}</p>
      <a href="https://github.com/poooi/poi/releases">
        {m.originalReleases()} ↗
      </a>
    </PageProse>
  </main>
)
