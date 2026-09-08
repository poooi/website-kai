# website-kai

Production website for poi, built with TanStack Start and deployed to Cloudflare Workers.

## Development

- `pnpm run dev` starts the TanStack dev server.
- `pnpm run build` creates the Cloudflare Worker build output under `dist/`.
- `pnpm run test:e2e` runs the Playwright end-to-end suite.

## Repository layout

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

## Deploy

`pnpm run deploy` builds and deploys the TanStack Worker using the generated
`dist/server/wrangler.json` config.
