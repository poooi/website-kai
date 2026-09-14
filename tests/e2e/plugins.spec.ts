import { expect, test } from '@playwright/test'

test('renders the official plugin directory and filters without JavaScript', async ({
  browser,
}) => {
  // The page-enter animation moves layout while loading and can exceed
  // Playwright's stability check under load; reduced motion disables it
  // (the app supports it) without changing the interaction under test.
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
  })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:3002/en/plugins')
    const articles = page.getByRole('main').getByRole('article')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Plugins', exact: true }),
    ).toBeVisible()
    await expect(articles).toHaveCount(26)
    await expect(page.getByRole('main')).not.toContainText('v0.0.0')

    const prophet = page
      .getByRole('article')
      .filter({ hasText: 'poi-plugin-prophet' })
    await expect(
      prophet.getByRole('heading', { level: 2 }).getByRole('link'),
    ).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/poi-plugin-prophet',
    )
    await expect(prophet.getByRole('link', { name: 'Chiba' })).toHaveAttribute(
      'href',
      'https://github.com/Chibaheit',
    )

    const akashic = page
      .getByRole('article')
      .filter({ hasText: 'poi-plugin-akashic-records' })
    await expect(akashic).toContainText('1.2.3')
    await expect(akashic.locator('time')).toHaveAttribute(
      'datetime',
      '2024-01-02T23:30:00.000Z',
    )
    await expect(akashic.locator('time')).toContainText('2024')
    await expect(
      page
        .getByRole('article')
        .filter({ hasText: 'poi-plugin-quest-info-2' })
        .locator('time'),
    ).toHaveCount(0)

    const improvement = page
      .getByRole('article')
      .filter({ hasText: 'poi-plugin-item-improvement' })
    await expect(
      improvement.getByRole('link', { name: 'WhoCallsTheFleet' }),
    ).toHaveAttribute('href', 'https://fleet.moe')

    const search = page.getByLabel('Search by name, feature or author')
    await search.fill('poi-plugin-anchorage-repair')
    await search.press('Enter')
    await expect(page).toHaveURL(/q=poi-plugin-anchorage-repair/)
    await expect(articles).toHaveCount(1)
    await expect(page.getByRole('main')).toContainText(
      'poi-plugin-anchorage-repair',
    )
    await expect(page.getByRole('status')).toContainText(
      '1 of 26 official plugins',
    )

    const clear = page.getByRole('link', { name: 'Clear search' })
    await expect(clear).toHaveAttribute('href', '/en/plugins')
    await clear.click()
    await expect(page).toHaveURL('http://127.0.0.1:3002/en/plugins')
    await expect(articles).toHaveCount(26)

    // Numeric queries must survive JSON search parsing as searchable text.
    await search.fill('2')
    await search.press('Enter')
    await expect(search).toHaveValue('2')
    await expect(page.getByRole('main')).toContainText(
      'poi-plugin-quest-info-2',
    )
    const numericResults = await articles.count()
    expect(numericResults).toBeGreaterThan(0)
    expect(numericResults).toBeLessThan(26)

    await page.getByRole('link', { name: 'Clear search' }).click()
    await expect(page).toHaveURL('http://127.0.0.1:3002/en/plugins')
    await expect(articles).toHaveCount(26)
  } finally {
    await context.close()
  }
})

test('localizes plugin names and descriptions', async ({ context, page }) => {
  for (const [cookie, path, name, language] of [
    ['ja', '/plugins', '航海日誌', 'ja-JP'],
    ['zh-Hans', '/zh-Hans/plugins', '航海日志', 'zh-CN'],
    ['zh-Hant', '/zh-Hant/plugins', '航海日誌', 'zh-TW'],
  ] as const) {
    await context.clearCookies()
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: cookie, url: 'http://127.0.0.1:3002' },
    ])
    await page.goto(path)
    const article = page
      .getByRole('article')
      .filter({ hasText: 'poi-plugin-akashic-records' })
    const heading = article.getByRole('heading', { level: 2 })
    await expect(heading).toContainText(name)
    await expect(heading).toHaveAttribute('lang', language)
    await expect(article.locator('.prose')).toHaveAttribute('lang', language)
  }
})

test('uses two columns on desktop, one on mobile, and supports keyboard search', async ({
  page,
}) => {
  await page.goto('/en/plugins')
  const articles = page.getByRole('main').getByRole('article')
  const first = await articles.nth(0).boundingBox()
  const second = await articles.nth(1).boundingBox()
  expect(first && second).toBeTruthy()
  expect(Math.abs(first!.y - second!.y)).toBeLessThan(2)

  const search = page.getByLabel('Search by name, feature or author')
  await search.focus()
  await page.keyboard.type('poi-plugin-prophet')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/q=poi-plugin-prophet/)
  await expect(articles).toHaveCount(1)
  await expect(page.getByRole('main')).toContainText('poi-plugin-prophet')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/plugins')
  const mobileFirst = await articles.nth(0).boundingBox()
  const mobileSecond = await articles.nth(1).boundingBox()
  expect(mobileFirst && mobileSecond).toBeTruthy()
  expect(mobileSecond!.y).toBeGreaterThan(mobileFirst!.y)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

test('navigates from the header and handles empty searches', async ({
  page,
}) => {
  await page.goto('/en/explore')
  const headerNav = page.getByRole('banner').getByRole('navigation')
  const pluginsLink = headerNav.getByRole('link', {
    name: 'Plugins',
    exact: true,
  })
  await expect(pluginsLink).toHaveAttribute('href', '/en/plugins')
  await pluginsLink.click()
  await expect(page).toHaveURL(/\/en\/plugins$/)
  await expect(
    headerNav.getByRole('link', { name: 'Plugins', exact: true }),
  ).toHaveAttribute('aria-current', 'page')

  const search = page.getByLabel('Search by name, feature or author')
  await search.fill('zzz-no-such-plugin')
  await search.press('Enter')
  await expect(page).toHaveURL(/q=zzz-no-such-plugin/)
  await expect(page.getByRole('main').getByRole('article')).toHaveCount(0)
  await expect(page.getByRole('main')).toContainText('No plugins match')
  await expect(page.getByRole('status')).toContainText(
    '0 of 26 official plugins',
  )
  const timeOrigin = await page.evaluate(() => performance.timeOrigin)
  await page.getByRole('link', { name: 'Clear search' }).click()
  await expect(page).toHaveURL(/\/en\/plugins$/)
  await expect(page.getByRole('main').getByRole('article')).toHaveCount(26)
  // Clearing search is client-side navigation: the document is not reloaded.
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin)
})
