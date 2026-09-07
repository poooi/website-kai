import { m } from '~/paraglide/messages'
import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'

export const DownloadError = () => (
  <main>
    <PageHeader title={m.download()} />
    <PageProse>
      <p role="alert">{m.releaseLoadError()}</p>
      <a href="https://github.com/poooi/poi/releases">
        {m.originalReleases()} ↗
      </a>
    </PageProse>
  </main>
)
