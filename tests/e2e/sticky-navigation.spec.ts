import { expect, test, type Page } from '@playwright/test'

/** Wait for the hydrating header effect to measure and publish its offset. */
const waitForClientReady = (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.style.getPropertyValue(
          '--sticky-header-offset',
        ),
      ),
    )
    .toMatch(/px$/)

test('shows back-to-top after scrolling and restores focus on activation', async ({
  page,
}) => {
  await page.goto('/en/plugins')
  const control = page.getByRole('button', { name: 'Back to top' })
  await expect(control).toHaveCount(0)

  await waitForClientReady(page)
  await page.evaluate(() => window.scrollTo(0, 2000))
  await expect(control).toBeVisible()

  await control.focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await expect(control).toHaveCount(0)
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe(
    'MAIN',
  )
})

test('respects reduced motion and avoids global smooth scrolling', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:3002/en/plugins')
    await waitForClientReady(page)
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe('auto')

    await page.evaluate(() => window.scrollTo(0, 2000))
    const control = page.getByRole('button', { name: 'Back to top' })
    await expect(control).toBeVisible()
    await control.click()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  } finally {
    await context.close()
  }
})

test('keeps the sticky header usable at 320px in French', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto('/fr/plugins')
  await waitForClientReady(page)
  const header = page.getByRole('banner')

  expect((await header.boundingBox())?.y).toBe(0)
  await page.evaluate(() => window.scrollTo(0, 1500))
  expect((await header.boundingBox())?.y).toBe(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)

  const details = header.locator('[data-mobile-nav]')
  await details.locator('summary').click()
  const navigation = details.getByRole('navigation')
  await expect(
    navigation.getByRole('link', { name: 'Journal des modifications' }),
  ).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Crédits' })).toBeVisible()
  for (const link of await navigation.getByRole('link').all())
    expect(
      await link.evaluate(
        (element) => element.scrollWidth <= element.clientWidth + 1,
      ),
    ).toBe(true)
  await expect(
    page.getByRole('button', { name: 'Retour en haut' }),
  ).toBeVisible()
})

test('keeps deep-linked release headings below the sticky header', async ({
  page,
}) => {
  await page.goto('/en/changelog#release-v6.1.3')
  const heading = page.getByRole('heading', {
    name: 'POI v6.1.3',
    exact: true,
  })
  await expect(heading).toBeVisible()
  await expect
    .poll(async () => {
      const headerBox = await page.getByRole('banner').boundingBox()
      const headingBox = await heading.boundingBox()
      if (!headerBox || !headingBox) return -999
      return headingBox.y - (headerBox.y + headerBox.height)
    })
    .toBeGreaterThanOrEqual(-4)
  await expect(
    page
      .getByRole('navigation', { name: 'Version navigation' })
      .getByRole('link', { name: 'v6.1.3', exact: true }),
  ).toHaveAttribute('aria-current', 'location')
})

test('keeps header menus usable above the sticky header while scrolled', async ({
  page,
}) => {
  await page.goto('/en/plugins')
  await waitForClientReady(page)
  await page.evaluate(() => window.scrollTo(0, 2000))

  await page.getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Theme' }).click()
  await expect(page.getByRole('menu')).toBeVisible()
})

for (const { width, locale, url } of [
  { width: 320, locale: 'fr', url: 'http://127.0.0.1:3002/fr/changelog' },
  { width: 390, locale: 'ja', url: 'http://127.0.0.1:3002/changelog' },
] as const) {
  test(`keeps a deep-linked heading visible without JavaScript at ${width}px (${locale})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 844 },
    })
    try {
      await context.addCookies([
        { name: 'NEXT_LOCALE', value: locale, url: 'http://127.0.0.1:3002' },
      ])
      const page = await context.newPage()
      await page.goto(`${url}#release-v6.1.3`)
      const heading = page.getByRole('heading', {
        name: 'POI v6.1.3',
        exact: true,
      })
      await expect(heading).toBeVisible()
      await expect
        .poll(async () => {
          const headerBox = await page.getByRole('banner').boundingBox()
          const headingBox = await heading.boundingBox()
          if (!headerBox || !headingBox) return -999
          return headingBox.y - (headerBox.y + headerBox.height)
        })
        .toBeGreaterThanOrEqual(-4)
      expect((await heading.boundingBox())!.y).toBeLessThan(844)
    } finally {
      await context.close()
    }
  })
}
