import { m } from '~/paraglide/messages'
import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'

export const DownloadError = () => (
  <main className="mx-auto w-full max-w-[960px] flex-1 px-8 pb-[72px] pt-12 max-[700px]:px-[6%] max-[700px]:pb-12 max-[700px]:pt-8">
    <PageHeader title={m.download()} />
    <PageProse>
      <p role="alert">{m.releaseLoadError()}</p>
      <a href="https://github.com/poooi/poi/releases">
        {m.originalReleases()} ↗
      </a>
    </PageProse>
  </main>
)
