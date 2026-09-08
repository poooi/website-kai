import { expect, test } from '@playwright/test'

test('keeps the mobile layout stable when web fonts arrive late', async ({
  browser,
}) => {
  const page = await browser.newPage({
    viewport: { width: 412, height: 823 },
    isMobile: true,
    deviceScaleFactor: 1.75,
    userAgent:
      'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
  })
  try {
    // Installed desktop fonts must not bypass the download under test.
    await page.route('**/fonts/**/*.css', async (route) => {
      const response = await route.fetch()
      await route.fulfill({
        response,
        body: (await response.text()).replace(/local\([^)]*\),?\s*/g, ''),
      })
    })
    let releaseFonts!: () => void
    const fontGate = new Promise<void>((resolve) => {
      releaseFonts = resolve
    })
    await page.route('**/*.woff2', async (route) => {
      await fontGate
      await route.continue()
    })
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.harbour-home')).toBeVisible()
    await expect
      .poll(() =>
        page
          .locator('.harbour-home img')
          .evaluate((image: HTMLImageElement) => image.currentSrc),
      )
      .toMatch(/\/assets\/poi-[^/]+\.svg$/)
    // Let the optional font's short blocking period and page entrance finish.
    await page.waitForTimeout(1000)
    const chart = page.locator('.harbour-chart')
    const before = await chart.boundingBox()
    releaseFonts()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(250)
    expect(await chart.boundingBox()).toEqual(before)
  } finally {
    await page.close()
  }
})
