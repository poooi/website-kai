import { devices } from '@playwright/test'
import { defineConfig } from 'next/experimental/testmode/playwright.js'

// @ts-expect-error - NODE_ENV is set for the test environment
process.env.NODE_ENV = 'test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'corepack pnpm dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
})
