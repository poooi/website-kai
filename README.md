# website-kai

Production website for poi, built with TanStack Start and deployed to Cloudflare Workers.

## Development

- `pnpm run dev` starts the TanStack dev server.
- `pnpm run build` creates the Cloudflare Worker build output under `dist/`.
- `pnpm run test:e2e` runs the Playwright end-to-end suite.

Cloudflare binding types are committed in `cloudflare-env.d.ts`. Run
`pnpm run cf-typegen` after changing `wrangler.toml` bindings, triggers or the
compatibility date, and commit the regenerated file; do not hand-edit it.
`pnpm run typecheck` runs `pnpm run cf-typegen:check` (the same Wrangler command
with `--check`) so a stale generated file fails before `tsc`, and CI typechecks
before linting and building. Because the file is committed, lint and typecheck
work on a clean checkout without regenerating it.

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

## Web fonts

The interface uses IBM Plex. `scripts/generate-critical-fonts.ts` runs at Vite
config startup and writes one UI subset and one attribution text per script —
everything in the message catalogs (including platform labels and the language
chooser's names), ASCII and the UI's literal symbols — into the ignored
`src/assets/fonts/generated/`. Restart the dev server after changing
`messages/*.json` so the subsets regenerate; a build always regenerates them.
The subsets are produced by the `cn-font-split` WASM engine, pinned to
`wasm32-wasip1@7.6.8` so every build uses the same toolchain; run
`pnpm run fonts:wasm` to install it, or let the generator do it when the version
marker is missing. The WOFF2 files are imported with `?url`, so Vite
content-hashes them. Keeping every font feature and the whole UI glyph set makes
these larger than a minimal subset — about 208 KiB for Japanese, 98 KiB
Simplified Chinese, 75 KiB Traditional Chinese, 37 KiB Korean and 70 KiB Latin —
but each locale preloads exactly one file. Pinning the engine does not make its
output byte-reproducible: Simplified and Traditional Chinese outputs can vary
between runs, including extra character mappings outside the requested UI set.
The requested UI coverage, outlines and advance widths have been verified;
content-hashed URLs keep each generated file distinct.

Each locale's font stack starts with the preloaded `Poi UI <script>` face
(`font-display: block`, no `local()`, and only that locale's file is preloaded
with `crossorigin`) to give the web font time to arrive before showing UI text.
Glyphs the subset omits fall through to the original split IBM Plex shards,
which use `font-display: swap` and load on demand for arbitrary release and
plugin content. Those split stylesheets are render-blocking, so they are served
only off the home page; the home page relies solely on the critical subset, and
navigating to another route adds the split stylesheets there. On a slow
connection the browser blocks briefly on the critical face and may still show a
fallback before a later swap; this is not guaranteed flash-free on every
network.

IBM Plex is SIL OFL 1.1 with Reserved Font Name "Plex". The engine reports the
original embedded metadata, so the generated attribution text (copyright,
trademark, designers, licence and project links) is inlined as a `/*! */`
comment next to the face, and the license text is served at
`/ibm-plex-OFL.txt`. All shaping features are retained and the original split
fonts remain the fallback for glyphs the subset omits.

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

The E2E runner sets `TANSTACK_TEST_RELEASE_HISTORY=1` so Vite reads and injects
`tests/fixtures/release-history.json` at build time, alongside the existing fixed
release-version fixture. The JSON stays out of child process environments.
Production builds leave this variable unset and fetch the archive.

## Plugins

The plugins page server-renders the official catalog from
`poooi/poi/master/assets/data/plugin.json` through the same public-document cache
as the release sources. Names and descriptions are localized per field with an
English fallback, Markdown descriptions are sanitized before rendering, and each
entry links to its real npm package and author page. Plugin icons render the
catalog's Font Awesome class directly through Font Awesome 7's packaged CSS and
official v4 shims, matching poi without a per-plugin icon map.

An hourly Worker Cron refreshes one compact snapshot of each plugin's npm
`dist-tags.latest` version and that version's publication time into the
`PLUGIN_RELEASES` KV namespace, stored at the single key
`official-plugin-releases:v1`. Page requests only read that key and never call
the npm registry. Per-package npm failures keep the previous entry; a failed
catalog fetch or an unreadable prior snapshot aborts the refresh before any
write; entries removed from the catalog drop out. Missing or unreadable KV still
renders the catalog with the version and date omitted. Dates are formatted in
UTC.

A GET search form filters by package id, name, description or author and works
without JavaScript; the same filter is keyboard accessible. The directory is a
simple two-column list on desktop and one column on mobile. The E2E runner sets
`TANSTACK_TEST_PLUGINS=1` so Vite reads and injects `tests/fixtures/plugins.json`
and `tests/fixtures/plugin-releases.json` at build time instead of contacting
GitHub or the npm registry.

## Deploy

`pnpm run deploy` builds and deploys the TanStack Worker using the generated
`dist/server/wrangler.json` config.
