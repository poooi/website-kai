import { expect, test } from '@playwright/test'

test('loads release versions on the server during client navigation', async ({
  page,
}) => {
  const upstreamRequests: string[] = []
  const serverRequests: string[] = []
  await page.route(
    'https://raw.githubusercontent.com/poooi/poi-release/**',
    (route) => {
      upstreamRequests.push(route.request().url())
      return route.abort()
    },
  )
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/_serverFn/'))
      serverRequests.push(request.url())
  })
  await page.goto('/en/explore', { waitUntil: 'networkidle' })
  await expect(page.locator('.harbour-chart object')).toHaveCount(0)
  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Download', exact: true })
    .click()
  await expect(page.locator('main a[href^="/dist/"]').first()).toBeVisible()
  expect(upstreamRequests).toEqual([])
  expect(serverRequests.length).toBeGreaterThan(0)
})

test('offers direct downloads without retired ia32 packages', async ({
  page,
}) => {
  await page.goto('/en/download', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /^Operating system/ }).click()
  await page
    .getByRole('menuitemradio', { name: 'Windows', exact: true })
    .click()
  await page.getByRole('button', { name: /^Architecture & package/ }).click()
  await expect(page.getByRole('menuitemradio')).toHaveCount(3)
  await expect(
    page.getByRole('menuitemradio').filter({ hasText: /ia32|32.bit|x86/i }),
  ).toHaveCount(0)
  await page.getByRole('menuitemradio').first().click()
  await expect(page.locator('main a[href^="/dist/"]').first()).toBeVisible()
})

test('reveals map layers in sequence and respects reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/en/download')
  await page.locator('.site-shell > header a').first().click()
  await page.waitForSelector('.harbour-chart object')
  const frames = await page.evaluate(async () => {
    const frames: number[][] = []
    const start = performance.now()
    while (performance.now() - start < 2000) {
      const object = document.querySelector<HTMLObjectElement>(
        '.harbour-chart object',
      )
      const layers = object?.contentDocument?.querySelectorAll('#geography > *')
      if (layers?.length)
        frames.push(
          Array.from(layers, (layer) =>
            Number(getComputedStyle(layer).opacity),
          ),
        )
      await new Promise(requestAnimationFrame)
    }
    return frames
  })
  expect(
    frames.some(
      (frame) => frame[0]! > 0 && frame[0]! < 1 && frame[9]! < frame[0]!,
    ),
  ).toBe(true)
  const complete = [1, 1, 1, 1, 1, 1, 1, 0.18, 1, 1]
  expect(frames.at(-1)).toEqual(complete)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.harbour-chart object')).toHaveCount(1)
  for (const theme of ['light', 'dark']) {
    await page.getByRole('button', { name: 'Theme', exact: true }).click()
    await page
      .getByRole('menuitemradio', {
        name: theme === 'dark' ? 'Chibaheit' : 'Lilywhite',
      })
      .click()
    await expect
      .poll(() =>
        page
          .locator('.harbour-chart object')
          .evaluate((object: HTMLObjectElement) =>
            Array.from(
              object.contentDocument?.querySelectorAll('#geography > *') ?? [],
              (layer) => Number(getComputedStyle(layer).opacity),
            ),
          ),
      )
      .toEqual(complete)
    await expect
      .poll(() =>
        page
          .locator('.harbour-chart object')
          .evaluate((object: HTMLObjectElement) => {
            const background =
              object.contentDocument?.querySelector('svg > rect')
            return background && getComputedStyle(background).fill
          }),
      )
      .toBe(theme === 'dark' ? 'rgb(18, 30, 41)' : 'rgb(245, 240, 223)')
  }
})

test('renders changelog content on the server, visibly without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  const response = await page.goto('http://127.0.0.1:3002/en/changelog')
  expect(response?.status()).toBe(200)
  await expect(page.locator('main')).toContainText(/POI v\d+\.\d+/)
  await expect(page.locator('main')).toHaveCSS('opacity', '1')
  await expect(page.locator('main button[aria-pressed]')).toHaveCount(0)
  await context.close()
})

test('preserves localized social links and attributes the map directly', async ({
  page,
}) => {
  for (const locale of ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr']) {
    await page.context().clearCookies()
    await page.goto('/' + locale)
    const footer = page.locator('footer')
    const chinese = locale.startsWith('zh-')
    await expect(
      footer.locator('a[href="http://weibo.com/letspoi"]'),
    ).toHaveCount(chinese ? 1 : 0)
    await expect(footer.locator('a[href="https://t.me/poiCN"]')).toHaveCount(
      chinese ? 1 : 0,
    )
    await expect(
      footer.locator('a[href="https://discord.gg/6u8rZ2P"]'),
    ).toHaveCount(chinese ? 0 : 1)
    for (const url of [
      'https://github.com/poooi/poi',
      'https://opencollective.com/poi',
      'https://x.com/KochiyaOcean',
    ]) {
      await expect(footer.locator('a[href="' + url + '"]')).toHaveCount(1)
    }
    await expect(footer.locator('a[href*="map-sources"]')).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: '© OpenStreetMap contributors' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: '© OpenStreetMap contributors' }),
    ).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright')
  }
})
