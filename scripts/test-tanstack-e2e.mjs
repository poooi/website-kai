import { execa } from 'execa'

const env = {
  ...process.env,
  NO_PROXY: [process.env.NO_PROXY, '127.0.0.1', 'localhost']
    .filter(Boolean)
    .join(','),
  no_proxy: [process.env.no_proxy, '127.0.0.1', 'localhost']
    .filter(Boolean)
    .join(','),
  TANSTACK_TEST_POI_VERSIONS: JSON.stringify({
    betaVersion: 'v10.10.0-beta.1',
    version: 'v10.9.2',
  }),
}

await execa('vite', ['build', '--config', 'vite.config.ts'], {
  env,
  stdio: 'inherit',
})
await execa('playwright', ['test', '--config=playwright.tanstack.config.ts'], {
  env,
  stdio: 'inherit',
})
