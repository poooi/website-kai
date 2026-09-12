import { expect, test } from '@playwright/test'

test('does not hide the SSR content again when hydration arrives late', async ({
  page,
}) => {
  let releaseScripts!: () => void
  const scriptGate = new Promise<void>((resolve) => {
    releaseScripts = resolve
  })
  await page.route('**/assets/*.js', async (route) => {
    await scriptGate
    await route.continue()
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/en', { waitUntil: 'commit' })
  const complete = [1, 1, 1, 1, 1, 1, 1, 0.18, 1, 1]
  await expect(page.locator('main')).toHaveCSS('opacity', '1')
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

  const frames = page.evaluate(async () => {
    const samples: { opacity: string; transform: string; layers: number[] }[] =
      []
    const main = document.querySelector('main')!
    const object = document.querySelector<HTMLObjectElement>(
      '.harbour-chart object',
    )!
    let sampling = true
    window.addEventListener(
      'hydration-sampled',
      () => {
        sampling = false
      },
      { once: true },
    )
    while (sampling) {
      samples.push({
        opacity: getComputedStyle(main).opacity,
        transform: getComputedStyle(main).transform,
        layers: Array.from(
          object.contentDocument!.querySelectorAll('#geography > *'),
          (layer) => Number(getComputedStyle(layer).opacity),
        ),
      })
      await new Promise(requestAnimationFrame)
    }
    return samples
  })
  releaseScripts()
  await expect
    .poll(async () =>
      (await page.context().cookies()).some(({ name }) => name === 'theme'),
    )
    .toBe(true)
  // A working menu confirms React has attached its event handlers.
  await page.getByRole('button', { name: 'Theme', exact: true }).click()
  await expect(
    page.getByRole('menuitemradio', { name: 'Chibaheit' }),
  ).toBeVisible()
  await page.evaluate(() =>
    window.dispatchEvent(new Event('hydration-sampled')),
  )
  const samples = await frames
  expect(samples.length).toBeGreaterThan(0)
  for (const sample of samples) {
    expect(sample).toEqual({
      opacity: '1',
      transform: 'none',
      layers: complete,
    })
  }
  expect(errors).toEqual([])
})

for (const preference of [
  { system: 'dark', cookie: undefined, stored: undefined, expected: 'dark' },
  { system: 'dark', cookie: 'light', stored: 'dark', expected: 'light' },
  { system: 'light', cookie: 'dark', stored: 'light', expected: 'dark' },
  { system: 'light', cookie: undefined, stored: 'dark', expected: 'dark' },
  { system: 'dark', cookie: 'system', stored: 'light', expected: 'dark' },
] as const) {
  test(`applies the first-paint theme before hydration: ${JSON.stringify(preference)}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: preference.system })
    if (preference.cookie) {
      await page.context().addCookies([
        {
          name: 'theme',
          value: preference.cookie,
          url: 'http://127.0.0.1:3002',
        },
      ])
    }
    if (preference.stored) {
      await page.addInitScript(
        (theme) => localStorage.setItem('theme', theme),
        preference.stored,
      )
    }
    // Force the server to render without a system color hint.
    await page.route('**/en', async (route) => {
      const headers = { ...route.request().headers() }
      delete headers['sec-ch-prefers-color-scheme']
      await route.continue({ headers })
    })
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('/en')
    await expect(page.locator('html')).toHaveCSS(
      'color-scheme',
      preference.expected,
    )
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
      .toBe(
        preference.expected === 'dark'
          ? 'rgb(18, 30, 41)'
          : 'rgb(245, 240, 223)',
      )
  })
}

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
