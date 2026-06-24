# website-kai

Production website for poi, built with TanStack Start and deployed to Cloudflare Workers.

## Development

- `pnpm run dev` starts the TanStack dev server.
- `pnpm run build` creates the Cloudflare Worker build output under `dist/`.
- `pnpm run test:e2e:tanstack` runs the Playwright parity suite.

## Deploy

`pnpm run deploy` builds and deploys the TanStack Worker using the generated
`dist/server/wrangler.json` config.
