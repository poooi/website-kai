import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ArrowUpRight } from 'lucide-react'
import { z } from 'zod'

import { PageHeader } from '~/components/page-header'
import { PageProse } from '~/components/page-prose'
import { PluginIcon } from '~/components/plugin-icon'
import { Transition } from '~/components/transition'
import { Button } from '~/components/ui/button'
import {
  parsePluginReleaseSnapshot,
  readPluginReleases,
} from '~/lib/plugin-releases.server'
import { fetchPlugins } from '~/lib/plugins.server'
import { m } from '~/paraglide/messages'
import { getLocale, locales, localizeHref } from '~/paraglide/runtime'

const loadPlugins = createServerFn({ method: 'GET' })
  .validator(z.enum(locales))
  .handler(async ({ data }) => {
    const fixture = process.env.TANSTACK_TEST_PLUGIN_RELEASES
    const releases = fixture
      ? parsePluginReleaseSnapshot(fixture)
      : await readPluginReleases(
          (await import('cloudflare:workers')).env.PLUGIN_RELEASES,
        )
    return fetchPlugins(data, { releases })
  })

export const Route = createFileRoute('/plugins')({
  validateSearch: z.object({ q: z.coerce.string().optional() }),
  loaderDeps: () => ({ locale: getLocale() }),
  loader: ({ deps }) => loadPlugins({ data: deps.locale }),
  staleTime: 5 * 60 * 1000,
  head: () => ({ meta: [{ title: `poi | ${m.plugins()}` }] }),
  component: PluginsPage,
})

function PluginsPage() {
  const { plugins, available } = Route.useLoaderData()
  const { q = '' } = Route.useSearch()
  const navigate = Route.useNavigate()
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const results = plugins.filter((plugin) =>
    terms.every((term) => plugin.searchText.includes(term)),
  )

  return (
    <Transition>
      <PageHeader title={m.plugins()} />
      {!available ? (
        <p role="alert" className="leading-8">
          {m.pluginsLoadError()}{' '}
          <Link
            reloadDocument
            preload={false}
            to="/plugins"
            className="text-link"
          >
            {m.reload()}
          </Link>
        </p>
      ) : (
        <>
          <div className="mb-10 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
            <form
              method="get"
              role="search"
              action={localizeHref('/plugins')}
              onSubmit={(event) => {
                event.preventDefault()
                const value = new FormData(event.currentTarget).get('q')
                void navigate({
                  search:
                    typeof value === 'string' && value ? { q: value } : {},
                  resetScroll: false,
                })
              }}
              className="grid max-w-xl gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
            >
              <label
                htmlFor="plugins-search"
                className="field-label min-w-0 sm:col-span-2"
              >
                {m.pluginsSearchLabel()}
              </label>
              <input
                id="plugins-search"
                key={q}
                name="q"
                type="search"
                defaultValue={q}
                className="field-control block w-full"
              />
              <Button type="submit" size="lg">
                {m.pluginsSearch()}
              </Button>
            </form>
            <p className="text-sm leading-6 text-muted-foreground">
              {m.pluginsInstallHint()}
            </p>
          </div>
          <div className="mb-5 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <p role="status" className="text-sm text-muted-foreground">
              {m.pluginsCount({ count: results.length, total: plugins.length })}
            </p>
            {q && (
              <Link
                to="/plugins"
                search={{}}
                resetScroll={false}
                className="text-link text-sm"
              >
                {m.pluginsClearSearch()}
              </Link>
            )}
          </div>
          {results.length === 0 ? (
            <p className="border-t py-10 text-copy">{m.pluginsNoResults()}</p>
          ) : (
            <div className="grid gap-x-12 md:grid-cols-2 lg:gap-x-16">
              {results.map((plugin) => (
                <article
                  key={plugin.id}
                  aria-labelledby={plugin.id}
                  className="grid grid-cols-[1.5rem_minmax(0,1fr)] content-start gap-x-4 border-t py-8 sm:gap-x-5"
                >
                  <PluginIcon name={plugin.icon} />
                  <div className="min-w-0">
                    <h2
                      id={plugin.id}
                      lang={plugin.nameLanguage}
                      className="text-2xl leading-8 font-medium tracking-tight [overflow-wrap:anywhere]"
                    >
                      <a
                        href={plugin.url}
                        className="transition-colors hover:text-navigation"
                      >
                        {plugin.name}{' '}
                        <ArrowUpRight
                          className="inline h-4 w-4 align-baseline text-navigation"
                          aria-hidden="true"
                        />
                      </a>
                    </h2>
                    <p className="mt-2 font-mono text-xs leading-5 [overflow-wrap:anywhere] text-muted-foreground">
                      {plugin.id}
                    </p>
                    {plugin.release && (
                      <p className="mt-1 font-mono text-xs leading-5 text-muted-foreground">
                        {plugin.release.version}
                        {' · '}
                        <time
                          dateTime={plugin.release.publishedAt}
                          title={m.pluginsReleasePublished({
                            date: plugin.release.date,
                          })}
                        >
                          {plugin.release.date}
                        </time>
                      </p>
                    )}
                    <PageProse
                      lang={plugin.descriptionLanguage}
                      className="mt-4 text-base prose-p:my-0 prose-p:leading-7"
                      dangerouslySetInnerHTML={{ __html: plugin.html }}
                    />
                    <p className="mt-5 text-sm text-muted-foreground">
                      <a href={plugin.authorUrl} className="text-link">
                        {plugin.author} ↗
                      </a>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </Transition>
  )
}
