import { expect, test } from '@playwright/test'

test('serves default locale content at unprefixed root', async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'NEXT_LOCALE',
      url: 'http://127.0.0.1:3002',
      value: 'ja',
    },
  ])
  await page.goto('/')

  await expect(page.getByText(/拡張可能/)).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'ダウンロードオプション' }),
  ).toBeVisible()
})

test('redirects locale preference to non-default locale path', async ({
  request,
}) => {
  const rootResponse = await request.get('/', {
    headers: {
      Cookie: 'NEXT_LOCALE=en',
    },
    maxRedirects: 0,
  })
  const response = await request.get('/download?x=1', {
    headers: {
      Cookie: 'NEXT_LOCALE=fr',
    },
    maxRedirects: 0,
  })

  expect(rootResponse.status()).toBe(307)
  expect(rootResponse.headers().location).toBe('http://127.0.0.1:3002/en')
  expect(response.status()).toBe(307)
  expect(response.headers().location).toBe(
    'http://127.0.0.1:3002/fr/download?x=1',
  )
  expect(response.headers()['cache-control']).toBe('no-store')
  expect(response.headers().vary).toContain('Cookie')
  expect(response.headers().vary).toContain('Accept-Language')
})

test('does not redirect non-GET page requests for locale negotiation', async ({
  request,
}) => {
  const response = await request.post('/download', {
    data: '',
    headers: {
      Cookie: 'NEXT_LOCALE=fr',
    },
    maxRedirects: 0,
  })

  expect(response.status()).not.toBe(307)
  expect(response.status()).not.toBe(308)
})

test('canonicalizes default locale prefixes and trailing slashes', async ({
  request,
}) => {
  const defaultLocaleResponse = await request.get('/ja/download', {
    maxRedirects: 0,
  })
  const defaultLocaleSlashResponse = await request.get('/ja/download/', {
    maxRedirects: 0,
  })
  const trailingSlashResponse = await request.get('/en/download/', {
    maxRedirects: 0,
  })

  expect(defaultLocaleResponse.status()).toBe(308)
  expect(defaultLocaleResponse.headers().location).toBe(
    'http://127.0.0.1:3002/download',
  )
  expect(defaultLocaleSlashResponse.status()).toBe(308)
  expect(defaultLocaleSlashResponse.headers().location).toBe(
    'http://127.0.0.1:3002/download',
  )
  expect(trailingSlashResponse.status()).toBe(308)
  expect(trailingSlashResponse.headers().location).toBe(
    'http://127.0.0.1:3002/en/download',
  )
  expect(defaultLocaleResponse.headers()['cache-control']).toBeUndefined()
  expect(trailingSlashResponse.headers()['cache-control']).toBeUndefined()
  expect(defaultLocaleResponse.headers()['content-type']).toContain(
    'text/plain',
  )
})

test('serves localized non-default content', async ({ page }) => {
  await page.goto('/en')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('poi | KanColle Browser')
  await expect(
    page.getByText('An extensible KanColle', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('browser and tool.', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Download options' }),
  ).toBeVisible()
  await expect(page.getByText(/v10\.10\.0-beta\.1 · Beta/)).toBeVisible()
})

test('serves localized download and explore pages', async ({ page }) => {
  await page.goto('/en/download')
  await expect(page.getByRole('heading', { name: 'Download' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Others' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Nightly builds' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Source code' })).toBeVisible()

  await page.goto('/en/explore')
  await expect(page.getByRole('heading', { name: 'what is poi' })).toBeVisible()
})

test('serves script-cased Chinese localized download pages', async ({
  page,
}) => {
  const simplifiedResponse = await page.goto('/zh-Hans/download')
  expect(simplifiedResponse?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
  await expect(page.getByRole('heading', { name: '下载' })).toBeVisible()
  await expect(page.getByRole('link', { name: '每夜构建' })).toBeVisible()

  const traditionalResponse = await page.goto('/zh-Hant/download')
  expect(traditionalResponse?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant')
  await expect(page.getByRole('heading', { name: '下載' })).toBeVisible()
  await expect(page.getByRole('link', { name: '每夜構建' })).toBeVisible()
})

test('serves framework-neutral header navigation controls', async ({
  page,
}) => {
  await page.goto('/en')

  const header = page.getByRole('banner')
  await expect(
    header.getByRole('link', { name: 'Return to home page' }),
  ).toHaveAttribute('href', '/en')
  await expect(header.getByRole('link', { name: 'Explore' })).toHaveAttribute(
    'href',
    '/en/explore',
  )
  await expect(
    header.getByRole('link', { name: 'Download', exact: true }),
  ).toHaveAttribute('href', '/en/download')
  await expect(header.getByRole('link', { name: 'Changelog' })).toHaveAttribute(
    'href',
    '/en/changelog',
  )
  await expect(page.getByRole('main').locator('img')).toHaveAttribute('alt', '')
})

test('keeps harbour map present through client navigation without a reload', async ({
  page,
}) => {
  const mapRequests: string[] = []
  page.on('request', (request) => {
    if (/\/assets\/maizuru-[^/]+\.svg$/.test(new URL(request.url()).pathname))
      mapRequests.push(request.url())
  })
  await page.goto('/en')
  const header = page.getByRole('banner')
  const harbourMap = page.locator('.harbour-chart object')

  await expect(harbourMap).toBeVisible()
  await expect
    .poll(() =>
      harbourMap.evaluate(
        (object) =>
          object instanceof HTMLObjectElement &&
          object.contentDocument?.documentElement.localName === 'svg',
      ),
    )
    .toBe(true)
  const headerGeometryBefore = await header.boundingBox()
  const timeOriginBefore = await page.evaluate(() => performance.timeOrigin)
  const mapDocument = await harbourMap.evaluateHandle(
    (object: HTMLObjectElement) => object.contentDocument,
  )

  await header.getByRole('link', { name: 'Download', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:3002/en/download')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Download' }),
  ).toBeVisible()
  await expect(harbourMap).toHaveCount(1)
  await expect(harbourMap).toBeHidden()

  await header.getByRole('link', { name: 'Return to home page' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:3002/en')
  await expect(harbourMap).toBeVisible()
  await expect
    .poll(() =>
      harbourMap.evaluate(
        (object) =>
          object instanceof HTMLObjectElement &&
          object.contentDocument?.documentElement.localName === 'svg',
      ),
    )
    .toBe(true)
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(
    timeOriginBefore,
  )
  expect(
    await harbourMap.evaluate(
      (object: HTMLObjectElement, previousDocument) =>
        object.contentDocument === previousDocument,
      mapDocument,
    ),
  ).toBe(true)
  expect(mapRequests).toHaveLength(1)
  const mapResponse = await page.request.get(mapRequests[0]!)
  expect(mapResponse.headers()['cache-control']).toBe(
    'public,max-age=31536000,immutable',
  )
  await mapDocument.dispose()

  const headerGeometryAfter = await header.boundingBox()
  expect(headerGeometryAfter?.width).toBe(headerGeometryBefore?.width)
  expect(headerGeometryAfter?.height).toBe(headerGeometryBefore?.height)
})

test('keeps layout coherent across routes with prose typography', async ({
  page,
}) => {
  await page.goto('/en')
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('main')).toHaveClass(/harbour-home/)
  await expect(page.locator('main.bg-background')).toHaveCount(0)

  await page.goto('/en/download')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Download' }),
  ).toBeVisible()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('main')).not.toHaveClass(/harbour-home/)

  await page.goto('/en/explore')
  await expect(page.locator('main.prose')).toHaveCount(0)
  await expect(page.getByRole('main')).toBeVisible()
  const exploreContent = page.getByRole('heading', {
    name: 'what is poi',
  })
  await expect(exploreContent).toBeVisible()
  await expect(
    exploreContent.locator('xpath=ancestor::div[contains(@class, "prose")]'),
  ).toHaveClass(/max-w-prose/)
})

test('keeps header pathname current after client history changes', async ({
  page,
}) => {
  await page.goto('/en')
  const header = page.getByRole('banner')
  await expect(
    header.getByRole('link', { name: 'Return to home page' }),
  ).toHaveAttribute('aria-current', 'page')

  await page.evaluate(() => {
    window.history.pushState({}, '', '/en/download')
  })

  await expect(
    header.getByRole('link', { name: 'Download', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'English' }).click()
  await page.getByRole('menuitemradio', { name: 'français' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:3002/fr/download')
})

test('loads localized download pages with hash fragments', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3002',
    extraHTTPHeaders: {
      'Sec-CH-UA-Arch': '"x86"',
      'Sec-CH-UA-Bitness': '"64"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
    },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()

  await page.goto('/en/download#download')

  await expect(page).toHaveURL('http://127.0.0.1:3002/en/download#download')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Download' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Download v\d/ })).toHaveCount(0)

  const main = page.getByRole('main')
  const stableSection = main.locator('section').filter({ hasText: 'v10.9.2' })
  await expect(
    stableSection.getByRole('link', { name: 'Download', exact: true }),
  ).toHaveAttribute('href', '/dist/poi-setup-10.9.2.exe')
  await expect(
    main.locator('section').filter({ hasText: 'v10.10.0-beta.1' }),
  ).toBeVisible()

  await context.close()
})

test('switches language with NEXT_LOCALE and canonical URL', async ({
  page,
}) => {
  await page.goto('/en')

  await page.getByRole('button', { name: 'English' }).click()
  await page.getByRole('menuitemradio', { name: 'français' }).click()

  await expect(page).toHaveURL('http://127.0.0.1:3002/fr')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  const cookies = await page.context().cookies('http://127.0.0.1:3002')
  expect(cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value).toBe(
    'fr',
  )
})

test('switches theme with the TanStack runtime', async ({ page }) => {
  await page.goto('/en')

  await page.getByRole('button', { name: 'Theme' }).click()
  await page.getByRole('menuitemradio', { name: 'Chibaheit' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(
    page.evaluate(() => localStorage.getItem('theme')),
  ).resolves.toBe('dark')
  const darkCookies = await page.context().cookies('http://127.0.0.1:3002')
  expect(darkCookies.find((cookie) => cookie.name === 'theme')?.value).toBe(
    'dark',
  )

  await page.getByRole('button', { name: 'Theme' }).click()
  await page.getByRole('menuitemradio', { name: 'Lilywhite' }).click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('uses theme cookie for server-rendered explicit dark theme', async ({
  page,
  request,
}) => {
  const response = await request.get('/en', {
    headers: {
      Cookie: 'theme=dark',
    },
  })

  expect(await response.text()).toContain("classList.add('dark')")
  await page.context().addCookies([
    {
      name: 'theme',
      url: 'http://127.0.0.1:3002',
      value: 'dark',
    },
  ])
  await page.goto('/en')
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('uses Sec-CH-Prefers-Color-Scheme for server-rendered system theme', async ({
  browser,
  request,
}) => {
  const response = await request.get('/en', {
    headers: {
      'Sec-CH-Prefers-Color-Scheme': '"dark"',
    },
  })

  expect(await response.text()).toContain("classList.add('dark')")
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3002',
    colorScheme: 'dark',
    extraHTTPHeaders: {
      'Sec-CH-Prefers-Color-Scheme': '"dark"',
    },
  })
  const page = await context.newPage()
  await page.setExtraHTTPHeaders({
    'Sec-CH-Prefers-Color-Scheme': '"dark"',
  })
  await page.goto('/en')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await context.close()
})

test('keeps system theme selected after client-hint dark SSR', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3002',
    colorScheme: 'dark',
    extraHTTPHeaders: {
      'Sec-CH-Prefers-Color-Scheme': '"dark"',
    },
  })
  const page = await context.newPage()

  await page.goto('/en')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('button', { name: 'Theme' }).click()
  await expect(
    page.getByRole('menuitemradio', { name: 'System' }),
  ).toHaveAttribute('aria-checked', 'true')

  const harbourMap = page.locator('.harbour-chart object')
  await expect
    .poll(() =>
      harbourMap.evaluate((object: HTMLObjectElement) => {
        const background = object.contentDocument?.querySelector('svg > rect')
        return background ? getComputedStyle(background).fill : undefined
      }),
    )
    .toBe('rgb(18, 30, 41)')

  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect
    .poll(() =>
      harbourMap.evaluate((object: HTMLObjectElement) => {
        const background = object.contentDocument?.querySelector('svg > rect')
        return background ? getComputedStyle(background).fill : undefined
      }),
    )
    .toBe('rgb(245, 240, 223)')

  await context.close()
})

test('ignores malformed theme cookies during SSR', async ({ request }) => {
  const response = await request.get('/en', {
    headers: {
      Cookie: 'theme=%',
    },
  })

  expect(response.status()).toBe(200)
})

test('ignores invalid stored theme values', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3002',
  })
  await context.addInitScript(() => {
    localStorage.setItem('theme', 'invalid')
  })
  try {
    const page = await context.newPage()

    await page.goto('/en')

    const themeButton = page.getByRole('button', { name: 'Theme' })
    const darkThemeItem = page.getByRole('menuitemradio', {
      name: 'Chibaheit',
    })
    await expect(themeButton).toBeVisible()
    await themeButton.click()
    await expect(darkThemeItem).toBeVisible()
    await darkThemeItem.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
  } finally {
    await context.close()
  }
})

test('theme switching works when localStorage is unavailable', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3002',
  })
  await context.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('localStorage disabled')
    }
    Storage.prototype.setItem = () => {
      throw new Error('localStorage disabled')
    }
  })
  try {
    const page = await context.newPage()

    await page.goto('/en')
    const themeButton = page.getByRole('button', { name: 'Theme' })
    const darkThemeItem = page.getByRole('menuitemradio', {
      name: 'Chibaheit',
    })
    await expect(themeButton).toBeVisible()
    await themeButton.click()
    await expect(darkThemeItem).toBeVisible()
    await darkThemeItem.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    const cookies = await page.context().cookies('http://127.0.0.1:3002')
    expect(cookies.find((cookie) => cookie.name === 'theme')?.value).toBe(
      'dark',
    )
  } finally {
    await context.close()
  }
})

test('shows the harbour map on small screens without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 500, height: 800 })
  await page.goto('/en')

  await expect(page.locator('.harbour-chart object')).toBeVisible()
  const fitsViewport = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )
  expect(fitsViewport).toBe(true)
})

test('renders desktop request-aware download links', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3002',
    extraHTTPHeaders: {
      'Sec-CH-UA-Arch': '"x86"',
      'Sec-CH-UA-Bitness': '"64"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
    },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()

  await page.goto('/en')
  const main = page.getByRole('main')
  await expect(
    main.locator('a[href="/dist/poi-setup-10.9.2.exe"]'),
  ).toHaveAccessibleName('Download')
  await expect(
    main.locator('a[href="/dist/poi-setup-10.10.0-beta.1.exe"]'),
  ).toHaveAccessibleName('Download')
  await expect(
    page.getByText(/v10\.9\.2 · Stable · Windows installer \(recommended\)/),
  ).toBeVisible()
  await expect(
    page.getByText(
      /v10\.10\.0-beta\.1 · Beta · Windows installer \(recommended\)/,
    ),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Download options' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:3002/en/download')
  await expect(
    main.getByRole('heading', { level: 1, name: 'Download' }),
  ).toBeVisible()
  const stableSection = main.locator('section').filter({ hasText: 'v10.9.2' })
  const betaSection = main
    .locator('section')
    .filter({ hasText: 'v10.10.0-beta.1' })
  await expect(
    stableSection.getByRole('link', { name: 'Download', exact: true }),
  ).toHaveAttribute('href', '/dist/poi-setup-10.9.2.exe')
  await expect(
    betaSection.getByRole('link', { name: 'Download', exact: true }),
  ).toHaveAttribute('href', '/dist/poi-setup-10.10.0-beta.1.exe')
  await expect(
    page.getByText('Operating system', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Architecture & package', { exact: true }),
  ).toBeVisible()

  const platformControls = page.getByTestId('platform-select')
  const platformButtons = platformControls.getByRole('button')
  await expect(platformButtons).toHaveCount(2)
  await platformButtons.first().click()
  const linuxItem = page.getByRole('menuitemradio', {
    name: 'Linux',
    exact: true,
  })
  await expect(linuxItem).toBeVisible()
  await linuxItem.click()
  await expect(main.locator('a[href^="/dist/"]')).toHaveCount(0)
  await platformButtons.nth(1).click()
  const portableItem = page.getByRole('menuitemradio', {
    name: 'Linux 64-bit portable',
    exact: true,
  })
  await expect(portableItem).toBeVisible()
  await portableItem.click()
  await expect(
    stableSection.getByRole('link', { name: 'Download', exact: true }),
  ).toHaveAttribute('href', '/dist/poi-10.9.2.7z')

  await context.close()
})

test('renders mobile request-aware hint without download links', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3002',
    extraHTTPHeaders: {
      'Sec-CH-UA-Mobile': '?1',
      'Sec-CH-UA-Platform': '"iOS"',
    },
    isMobile: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })
  const page = await context.newPage()

  await page.goto('/en')
  await expect(
    page.getByText('poi is designed for desktop devices'),
  ).toBeVisible()
  await expect(page.getByRole('main').locator('a[href^="/dist/"]')).toHaveCount(
    0,
  )

  await page.goto('/en/download')
  await expect(
    page.getByText('poi is designed for desktop devices'),
  ).toBeVisible()
  await expect(page.getByRole('main').locator('a[href^="/dist/"]')).toHaveCount(
    0,
  )

  await context.close()
})

test('does not leak SSR platform state between download requests', async ({
  request,
}) => {
  const windowsResponse = await request.get('/en/download', {
    headers: {
      'Sec-CH-UA-Arch': '"x86"',
      'Sec-CH-UA-Bitness': '"64"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })
  const linuxArmResponse = await request.get('/en/download', {
    headers: {
      'Sec-CH-UA-Arch': '"arm"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Linux"',
      'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36',
    },
  })

  const windowsHtml = await windowsResponse.text()
  const linuxArmHtml = await linuxArmResponse.text()
  expect(windowsHtml).toContain('/dist/poi-setup-10.9.2.exe')
  expect(linuxArmHtml).toContain('/dist/poi-10.9.2-arm64.7z')
  expect(linuxArmHtml).not.toContain('/dist/poi-setup-10.9.2.exe')
})

test('labels detected macOS architecture as Intel or Apple Silicon', async ({
  request,
}) => {
  const macIntelResponse = await request.get('/en', {
    headers: {
      'Sec-CH-UA-Arch': '"x86"',
      'Sec-CH-UA-Bitness': '"64"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"macOS"',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })
  const appleSiliconResponse = await request.get('/en', {
    headers: {
      'Sec-CH-UA-Arch': '"arm"',
      'Sec-CH-UA-Bitness': '"64"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"macOS"',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })

  const macIntelHtml = await macIntelResponse.text()
  const appleSiliconHtml = await appleSiliconResponse.text()
  expect(macIntelHtml).toContain('Intel Mac')
  expect(macIntelHtml).toContain('/dist/poi-10.9.2.dmg')
  expect(appleSiliconHtml).toContain('Apple Silicon Mac')
  expect(appleSiliconHtml).toContain('/dist/poi-10.9.2-arm64.dmg')
})

test('rejects unsupported locale-like prefixes', async ({ request }) => {
  const localeResponse = await request.get('/es/download')
  const unknownPageResponse = await request.get('/about')
  const unknownNestedPageResponse = await request.get('/about/team', {
    headers: { Cookie: 'NEXT_LOCALE=fr' },
    maxRedirects: 0,
  })
  const unknownNestedKnownPageResponse = await request.get('/download/foo', {
    headers: { Cookie: 'NEXT_LOCALE=fr' },
    maxRedirects: 0,
  })
  const unknownNestedKnownPageSlashResponse = await request.get(
    '/download/foo/',
    {
      headers: { Cookie: 'NEXT_LOCALE=fr' },
      maxRedirects: 0,
    },
  )
  const unknownDefaultLocaleNestedResponse = await request.get(
    '/ja/download/foo',
    {
      maxRedirects: 0,
    },
  )
  const unknownDefaultLocaleProxyResponse = await request.get('/ja/dist/en', {
    maxRedirects: 0,
  })

  expect(localeResponse.status()).toBe(404)
  expect(unknownPageResponse.status()).toBe(404)
  expect(unknownNestedPageResponse.status()).toBe(404)
  expect(unknownNestedPageResponse.headers().location).toBeUndefined()
  expect(unknownNestedKnownPageResponse.status()).toBe(404)
  expect(unknownNestedKnownPageResponse.headers().location).toBeUndefined()
  expect(unknownNestedKnownPageSlashResponse.status()).toBe(404)
  expect(unknownNestedKnownPageSlashResponse.headers().location).toBeUndefined()
  expect(unknownDefaultLocaleNestedResponse.status()).toBe(404)
  expect(unknownDefaultLocaleNestedResponse.headers().location).toBeUndefined()
  expect(unknownDefaultLocaleProxyResponse.status()).toBe(404)
  expect(unknownDefaultLocaleProxyResponse.headers().location).toBeUndefined()
})

test('does not localize API, proxy, asset, or generated image routes', async ({
  request,
}) => {
  const statusResponse = await request.get('/status', {
    headers: { Cookie: 'NEXT_LOCALE=en' },
  })
  const distResponse = await request.get('/dist/en', {
    headers: { Cookie: 'NEXT_LOCALE=fr' },
    maxRedirects: 0,
  })
  const distRootResponse = await request.get('/dist', {
    headers: { Cookie: 'NEXT_LOCALE=fr' },
    maxRedirects: 0,
  })
  const distRootSlashResponse = await request.get('/dist/', {
    headers: { Cookie: 'NEXT_LOCALE=fr' },
    maxRedirects: 0,
  })
  const assetResponse = await request.get('/favicon.ico', {
    headers: { Cookie: 'NEXT_LOCALE=en' },
  })
  const imageResponse = await request.get('/opengraph-image', {
    headers: { Cookie: 'NEXT_LOCALE=en' },
  })

  expect(statusResponse.status()).toBe(200)
  expect(distResponse.status()).toBe(404)
  expect(distResponse.headers().location).toBeUndefined()
  expect(distRootResponse.status()).toBe(404)
  expect(distRootResponse.headers().location).toBeUndefined()
  expect(distRootSlashResponse.status()).toBe(404)
  expect(distRootSlashResponse.headers().location).toBeUndefined()
  expect(assetResponse.status()).toBe(200)
  expect(imageResponse.status()).toBe(200)
  expect(imageResponse.headers()['content-type']).toBe('image/png')
})
