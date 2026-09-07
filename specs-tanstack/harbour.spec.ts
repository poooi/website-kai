import { expect, test } from '@playwright/test'

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
      const object = document.querySelector<HTMLObjectElement>('.chart-light')
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
  for (const theme of ['light', 'dark']) {
    await page.evaluate(
      (theme) =>
        document.documentElement.classList.toggle('dark', theme === 'dark'),
      theme,
    )
    await expect
      .poll(() =>
        page
          .locator('.chart-' + theme)
          .evaluate((object: HTMLObjectElement) =>
            Array.from(
              object.contentDocument?.querySelectorAll('#geography > *') ?? [],
              (layer) => Number(getComputedStyle(layer).opacity),
            ),
          ),
      )
      .toEqual(complete)
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
