import { expect, test, type BrowserContext, type Page } from '@playwright/test'

type CdpSession = Awaited<ReturnType<BrowserContext['newCDPSession']>>

const platformFonts = async (cdp: CdpSession, selector: string) => {
  const { root } = await cdp.send('DOM.getDocument')
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector,
  })
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId })
  return fonts.map((font) => ({
    familyName: font.familyName,
    isCustomFont: font.isCustomFont,
    glyphCount: font.glyphCount,
  }))
}

const trackWoff2 = (page: Page) => {
  const requests: string[] = []
  page.on('request', (request) => {
    const { pathname } = new URL(request.url())
    if (pathname.endsWith('.woff2')) requests.push(pathname)
  })
  return requests
}

test('cold Japanese load uses the preloaded UI subset and stays consistent when warm', async ({
  browser,
}) => {
  const context = await browser.newContext({
    locale: 'ja-JP',
    reducedMotion: 'reduce',
  })
  try {
    const page = await context.newPage()
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: 'ja', url: 'http://127.0.0.1:3002' },
    ])
    const cdp = await context.newCDPSession(page)
    await cdp.send('DOM.enable')
    await cdp.send('CSS.enable')
    // A locally installed IBM Plex must not be able to satisfy the test.
    await cdp.send('CSS.setLocalFontsEnabled', { enabled: false })

    const brand = page.locator('#brand')
    const paragraph = page.locator('main section > p').first()
    const woff2 = trackWoff2(page)

    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'poi', exact: true }),
    ).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForLoadState('networkidle')

    // Cold: the UI subset is the only font download; split shards stay cold.
    const subsetDownloads = () =>
      woff2.filter((path) => path.includes('/ui-jp-'))
    const shardDownloads = () =>
      woff2.filter((path) =>
        path.includes('/fonts/plex-sans-jp/IBMPlexSansJP-Regular-'),
      )
    expect(subsetDownloads()).toHaveLength(1)
    expect(shardDownloads()).toHaveLength(0)

    const coldBrandFonts = await platformFonts(cdp, '#brand')
    const coldParagraphFonts = await platformFonts(cdp, 'main section > p')
    for (const fonts of [coldBrandFonts, coldParagraphFonts]) {
      expect(fonts.length).toBeGreaterThan(0)
      expect(fonts.every((font) => font.isCustomFont)).toBe(true)
      expect(
        fonts.some((font) => font.familyName.includes('IBM Plex Sans')),
      ).toBe(true)
    }
    const coldBrandBox = await brand.boundingBox()
    const coldParagraphBox = await paragraph.boundingBox()

    await page.reload()
    await expect(
      page.getByRole('heading', { level: 1, name: 'poi', exact: true }),
    ).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForLoadState('networkidle')

    // Warm: identical platform fonts and geometry, still no split shards.
    expect(await platformFonts(cdp, '#brand')).toEqual(coldBrandFonts)
    expect(await platformFonts(cdp, 'main section > p')).toEqual(
      coldParagraphFonts,
    )
    expect(await brand.boundingBox()).toEqual(coldBrandBox)
    expect(await paragraph.boundingBox()).toEqual(coldParagraphBox)
    expect(shardDownloads()).toHaveLength(0)
  } finally {
    await context.close()
  }
})

test('serves the split fallback stylesheets and shards only off the home page', async ({
  browser,
}) => {
  const context = await browser.newContext({
    locale: 'ja-JP',
    reducedMotion: 'reduce',
  })
  try {
    const page = await context.newPage()
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: 'ja', url: 'http://127.0.0.1:3002' },
    ])
    const cdp = await context.newCDPSession(page)
    await cdp.send('DOM.enable')
    await cdp.send('CSS.enable')
    // Installed IBM fonts must not be able to bypass the shard under test.
    await cdp.send('CSS.setLocalFontsEnabled', { enabled: false })

    const stylesheets: string[] = []
    const shards: string[] = []
    page.on('request', (request) => {
      const { pathname } = new URL(request.url())
      if (pathname.includes('/fonts/') && pathname.endsWith('.css'))
        stylesheets.push(pathname)
      if (
        pathname.endsWith('.woff2') &&
        pathname.includes('IBMPlexSansJP-Regular-')
      )
        shards.push(pathname)
    })

    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'poi', exact: true }),
    ).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    // The home page never requests the render-blocking split stylesheets.
    expect(stylesheets).toHaveLength(0)
    expect(shards).toHaveLength(0)

    const changelogStylesheet = page.waitForRequest((request) =>
      new URL(request.url()).pathname.endsWith(
        '/fonts/plex-sans-jp/IBMPlexSansJP-Regular.css',
      ),
    )
    await page
      .getByRole('banner')
      .getByRole('link', { name: '変更履歴', exact: true })
      .click()
    await expect(page).toHaveURL(/\/changelog$/)
    await changelogStylesheet

    // Off the home page the split shards are available again. These glyphs are
    // absent from the generated UI subset and present in the source font, so
    // rendering them must pull a shard.
    const shard = page.waitForRequest((request) => {
      const { pathname } = new URL(request.url())
      return (
        pathname.endsWith('.woff2') &&
        pathname.includes('IBMPlexSansJP-Regular-')
      )
    })
    await page.evaluate(() => {
      const paragraph = document.createElement('p')
      paragraph.textContent = '龍鎮'
      document.querySelector('main')?.appendChild(paragraph)
    })
    await shard

    expect(stylesheets.length).toBeGreaterThan(0)
    expect(shards.length).toBeGreaterThan(0)
  } finally {
    await context.close()
  }
})
