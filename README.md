# website-kai

Production website for poi, built with TanStack Start and deployed to Cloudflare Workers.

## Development

- `pnpm run dev` starts the TanStack dev server.
- `pnpm run build` creates the Cloudflare Worker build output under `dist/`.
- `pnpm run test:e2e` runs the Playwright end-to-end suite.

## Repository layout

UI conventions and component usage are defined in [the website VI guide](docs/visual-identity.md).

- `src/routes/`: page loaders, pages, and public HTTP endpoints.
- `src/worker.ts`: Cloudflare entry point and request dispatch.
- `src/server/`: locale routing, asset serving, and response header policies.
- `src/lib/`: shared application logic and page data loading.
- `src/**/*.test.ts`: unit tests; `tests/e2e/`: browser and HTTP tests.
- `scripts/`: i18n generation, runtime/build checks, and the E2E runner.

Run `pnpm run lint`, `pnpm run typecheck`, and `pnpm run test:unit` for
source checks. After `pnpm run build`, run `pnpm run check:imports` and
`pnpm run check:build` to validate runtime compatibility and bundle budgets.
The E2E runner builds with fixed release versions before starting preview.

## Release history

The changelog and comparison pages read only `poooi/poi-release/main/history/stable.json`.
This complete archive includes the latest stable release; the website does not
fetch, merge or give precedence to root channel Markdown. Entries fall back to
English individually when a translation is unavailable, and version headings
link to GitHub Releases. Original sources and reconstruction metadata remain in
the archive. Beta and special compatibility builds are excluded. Historical
beta announcements are combined into stable notes during archive generation.
Recovered Weibo images and plugin updates remain in `poi-release`; the website
renders only main application notes.

Archive maintenance and reconstruction instructions live in
[`poi-release/history/README.md`](https://github.com/poooi/poi-release/blob/main/history/README.md).
Publish the archive there before deploying this consumer. Its CI checks that
current stable channel notes are included in the archive. If the archive cannot
be loaded and no valid cached snapshot is available, the page shows an error and
a retry link. Root stable/beta Markdown remains available through the existing
application update endpoints, independently of website history rendering.

The history page shows a continuous timeline with a sticky version directory,
grouped by publication year. Scrolling highlights the current version and opens
its year group; anchor links work without JavaScript. The directory collapses
into a disclosure on mobile and has no internal scrollbars. v10.2.1 uses its
annotated tag timestamp from the archive.
`/changelog/compare?from=v6.0.1&to=v6.1.3` summarizes the upgrade range, including
the newer endpoint and excluding the older one. Reversed selections are
normalized. Comparison requires the archive to be available so an incomplete
range is never presented as complete. Both directory links and the comparison
form work without JavaScript.

Public release source documents use the Cloudflare Workers Cache API (no KV
binding required). Freshness follows upstream `s-maxage`/`max-age` or `Expires`,
accounting for `Age` and `Date`; the fallback when no lifetime is supplied is
five minutes. ETags are revalidated with `If-None-Match`. A validated snapshot
is retained for up to seven days for upstream errors, with a one-minute retry
backoff; `no-store`, `private`, `no-cache` and revalidation requirements are
respected. Missing-language 404s are cached for at most one minute. Invalid
responses do not replace a valid snapshot. The cache stores public source text,
not visitor-specific page HTML. Cache availability is per Cloudflare location
and entries may be evicted; cold misses still contact GitHub. There is no
claim of a globally persistent copy or a guaranteed cache hit.

The E2E runner injects `tests/fixtures/release-history.json` at build time through
`TANSTACK_TEST_RELEASE_HISTORY`, alongside the existing fixed release-version
fixture. Production builds leave this variable unset and fetch the archive.

## Deploy

`pnpm run deploy` builds and deploys the TanStack Worker using the generated
`dist/server/wrangler.json` config.
