import { expect, test, type Page, type Response } from '@playwright/test'

const serverFnPattern = '/_serverFn/'
const creditsSpritePattern = '/api/credits-sprite/'

const isPath = (url: string, prefix: string) =>
  new URL(url).pathname.startsWith(prefix)

const trackRequests = (page: Page, prefixes: string[]) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (prefixes.some((prefix) => isPath(request.url(), prefix)))
      requests.push(request.url())
  })
  return requests
}

// Opening the theme menu confirms React has attached its event handlers.
const waitForHydration = async (page: Page) => {
  await page.getByRole('button', { name: 'Theme', exact: true }).click()
  await expect(
    page.getByRole('menuitemradio', { name: 'Chibaheit' }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('menuitemradio', { name: 'Chibaheit' }),
  ).toBeHidden()
}

const headerLink = (page: Page, name: string) =>
  page.getByRole('banner').getByRole('link', { name, exact: true })

const waitForServerFn = (page: Page): Promise<Response> =>
  page.waitForResponse((response) => isPath(response.url(), serverFnPattern))

test('does not speculatively preload routes while the home page is idle', async ({
  page,
}) => {
  const serverFns = trackRequests(page, [serverFnPattern])
  await page.goto('/en', { waitUntil: 'networkidle' })
  await waitForHydration(page)
  await page.waitForLoadState('networkidle')

  await expect(
    page.getByRole('heading', { level: 1, name: 'poi', exact: true }),
  ).toBeVisible()
  expect(serverFns).toHaveLength(0)
})

test('a brief hover that leaves before the intent delay does not preload', async ({
  page,
}) => {
  const serverFns = trackRequests(page, [serverFnPattern])
  await page.goto('/en', { waitUntil: 'networkidle' })
  await waitForHydration(page)

  // Install after hydration, pause at the current fake time, then drive the
  // 120ms intent delay explicitly.
  await page.clock.install()
  await page.clock.pauseAt(await page.evaluate(() => Date.now()))

  await headerLink(page, 'Download').hover()
  await page.clock.runFor(100)
  expect(serverFns).toHaveLength(0)

  await page.mouse.move(0, 0)
  await page.clock.runFor(1000)
  expect(serverFns).toHaveLength(0)
})

test('intent hover prefetches download data once and click reuses it', async ({
  page,
}) => {
  const serverFns = trackRequests(page, [serverFnPattern])
  await page.goto('/en', { waitUntil: 'networkidle' })
  await waitForHydration(page)

  const download = headerLink(page, 'Download')
  const prefetch = waitForServerFn(page)
  await download.hover()
  await (await prefetch).finished()
  expect(serverFns).toHaveLength(1)

  // A repeat intent reuses the fresh preload instead of refetching.
  await page.mouse.move(0, 0)
  await download.hover()
  await page.waitForLoadState('networkidle')
  expect(serverFns).toHaveLength(1)

  const timeOrigin = await page.evaluate(() => performance.timeOrigin)
  await download.click()
  await expect(page).toHaveURL(/\/en\/download$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Download' }),
  ).toBeVisible()
  expect(serverFns).toHaveLength(1)
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin)
})

test('focusing credits prefetches its data without loading sprite sheets', async ({
  page,
}) => {
  const serverFns = trackRequests(page, [serverFnPattern])
  const sprites = trackRequests(page, [creditsSpritePattern])
  await page.goto('/en', { waitUntil: 'networkidle' })
  await waitForHydration(page)

  const credits = headerLink(page, 'Credits')
  const prefetch = waitForServerFn(page)
  await credits.focus()
  await (await prefetch).finished()
  await page.waitForLoadState('networkidle')

  expect(serverFns).toHaveLength(1)
  expect(sprites).toHaveLength(0)

  await credits.click()
  await expect(page).toHaveURL(/\/en\/credits$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Credits' }),
  ).toBeVisible()
  await expect.poll(() => sprites.length).toBeGreaterThan(0)
})

test('opening the mobile menu does not preload routes, but touch intent preloads the chosen route', async ({
  page,
}) => {
  const serverFns = trackRequests(page, [serverFnPattern])
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en', { waitUntil: 'networkidle' })
  await waitForHydration(page)
  await page.waitForLoadState('networkidle')

  const mobileNav = page.locator('details[data-mobile-nav]')
  await mobileNav.locator('summary').click()
  await expect(mobileNav).toHaveAttribute('open', '')
  expect(serverFns).toHaveLength(0)

  const prefetch = waitForServerFn(page)
  await mobileNav
    .getByRole('link', { name: 'Download', exact: true })
    .dispatchEvent('touchstart')
  await (await prefetch).finished()
})
