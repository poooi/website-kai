import { expect, test } from '@playwright/test'

test('renders credits, contributors and the support links', async ({
  page,
}) => {
  const sheetRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/credits-sprite/'))
      sheetRequests.push(request.url())
  })
  const sheetResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/credits-sprite/avatars-0.') &&
      response.status() === 200,
  )

  await page.goto('/en/credits')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Credits', exact: true }),
  ).toBeVisible()

  const contributors = page.locator('#contributors')
  await expect(
    contributors.getByRole('heading', { level: 2, name: 'Contributors' }),
  ).toBeVisible()

  // Upstream order, hand-added artist kept, display-name fallbacks applied.
  const names = await contributors
    .locator('ul')
    .getByRole('link')
    .allTextContents()
  expect(names).toEqual(['Season千', 'Maggie', 'noname', 'blank'])
  await expect(
    contributors.getByRole('link', { name: 'Season千' }),
  ).toHaveAttribute('href', 'http://www.pixiv.net/member.php?id=3991162')
  await expect(
    contributors.getByRole('link', { name: 'Maggie' }),
  ).toHaveAttribute('href', 'https://github.com/hanzhao')
  await expect(contributors.getByRole('link', { name: 'noname' })).toBeVisible()
  await expect(contributors.getByRole('link', { name: 'blank' })).toBeVisible()

  const contributorSprite = contributors.locator('[data-credits-sprite]')
  await expect(contributorSprite).toHaveCount(1)
  await expect(contributors.locator('[data-sprite-placeholder]')).toHaveCount(3)
  expect(
    await contributorSprite
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toContain('/api/credits-sprite/avatars-0.0123456789abcdef.png')

  // The sheet is a real, decodable 96x288 webp served by the proxy.
  expect((await sheetResponse).status()).toBe(200)
  expect(
    await page.evaluate(async (src) => {
      const image = new Image()
      image.src = src
      await image.decode()
      return { width: image.naturalWidth, height: image.naturalHeight }
    }, '/api/credits-sprite/avatars-0.0123456789abcdef.png'),
  ).toEqual({ width: 96, height: 288 })

  await expect(
    page.getByRole('link', { name: 'Contribution guide' }),
  ).toHaveAttribute('href', 'https://github.com/poooi/poi#development')
  await expect(page.getByRole('link', { name: 'Support poi' })).toHaveAttribute(
    'href',
    'https://opencollective.com/poi',
  )

  const supporters = page.locator('#supporters')
  await expect(
    supporters.getByRole('heading', { level: 2, name: 'Supporters' }),
  ).toBeVisible()
  await expect(supporters).toContainText('supported poi financially')
  const supporterLinks = supporters.locator('ul').getByRole('link')
  await expect(supporterLinks).toHaveCount(4)
  await expect(
    supporters.getByRole('link', { name: 'Sorayama' }),
  ).toHaveAttribute('href', 'https://opencollective.com/sorayama')
  await expect(
    supporters.getByRole('link', { name: 'magica' }),
  ).toHaveAttribute('href', 'https://opencollective.com/magicae')
  await expect(
    supporters.getByRole('link', { name: 'Jennings Wu' }),
  ).toHaveAttribute('href', 'https://opencollective.com/jenningswu')
  await expect(supporterLinks.filter({ hasText: 'Ada' })).toHaveCount(1)
  await expect(supporters).not.toContainText('Zero Donor')

  // One sprite sheet serves both sections; no per-avatar remote requests.
  const supporterSprite = supporters.locator('[data-credits-sprite]')
  await expect(supporterSprite).toHaveCount(1)
  expect(
    await supporterSprite
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toBe(
    await contributorSprite
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundImage),
  )
  // Missing avatars are a neutral circle with the poi character cut out via a
  // two-layer CSS mask, never images; fixture: 3 contributors + 3 supporters.
  await expect(page.locator('#contributors img, #supporters img')).toHaveCount(
    0,
  )
  const placeholderMasks = await page
    .locator(
      '#contributors [data-sprite-placeholder], #supporters [data-sprite-placeholder]',
    )
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          image:
            style.getPropertyValue('mask-image') ||
            style.getPropertyValue('-webkit-mask-image'),
          composite:
            style.getPropertyValue('mask-composite') ||
            style.getPropertyValue('-webkit-mask-composite'),
        }
      }),
    )
  expect(placeholderMasks).toHaveLength(6)
  for (const { image, composite } of placeholderMasks) {
    expect(image).not.toBe('none')
    expect(image).toContain('url(')
    expect(composite).toContain('exclude')
  }
  expect(
    await page
      .locator(
        '#contributors [data-credits-sprite], #supporters [data-credits-sprite]',
      )
      .evaluateAll((elements) =>
        elements.map((element) => (element as HTMLElement).style.width),
      ),
  ).toEqual(['48px', '48px'])

  // Both sections share a single network request for the one sheet.
  expect(
    sheetRequests.filter((url) =>
      url.endsWith('avatars-0.0123456789abcdef.png'),
    ),
  ).toHaveLength(1)

  const jump = page.locator('[data-credits-jump]')
  await expect(jump.getByRole('link')).toHaveText([
    'Supporters',
    'Contributors',
    'Special thanks',
  ])
  await expect(
    jump.getByRole('link', { name: 'Special thanks' }),
  ).toHaveAttribute('href', '#special-thanks')

  expect(
    await page
      .locator('main section[id]')
      .evaluateAll((elements) => elements.map((element) => element.id)),
  ).toEqual(['supporters', 'contributors', 'special-thanks'])

  const special = page.locator('#special-thanks')
  await expect(
    special.getByRole('heading', { level: 2, name: 'Special thanks' }),
  ).toBeVisible()
  await expect(special.locator('ul').getByRole('link')).toHaveText([
    'KCwiki',
    'TaoNPM',
    'Kancolle English Wikia',
    'Type 74 Electronic Observer',
    'Who Calls The Fleet',
    'Kensuke Tanaka',
  ])
  await expect(special.getByRole('link', { name: 'KCwiki' })).toHaveAttribute(
    'href',
    'https://zh.kcwiki.moe/wiki/%E8%88%B0%E5%A8%98%E7%99%BE%E7%A7%91',
  )
  await expect(
    special.getByRole('link', { name: 'Kensuke Tanaka' }),
  ).toHaveAttribute('href', 'https://www.facebook.com/kensuke.tanaka.790')
  await expect(special).toContainText('enjoyed a lot, sincerely')

  // Six local icons, decorative and never remote.
  const logos = special.locator('img')
  await expect(logos).toHaveCount(6)
  for (const logo of await logos.all()) {
    await expect(logo).toHaveAttribute('alt', '')
    await expect(logo).toHaveAttribute('loading', 'lazy')
    expect((await logo.getAttribute('src')) ?? '').not.toMatch(
      /^(?:https?:)?\/\//,
    )
  }

  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Credits' }),
  ).toHaveAttribute('aria-current', 'page')

  await page.setViewportSize({ width: 320, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

test('renders credits without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:3002/en/credits')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Credits', exact: true }),
    ).toBeVisible()

    const contributors = page.locator('#contributors')
    await expect(
      contributors.getByRole('link', { name: 'Season千' }),
    ).toHaveAttribute('href', 'http://www.pixiv.net/member.php?id=3991162')
    await expect(
      contributors.getByRole('link', { name: 'noname' }),
    ).toBeVisible()
    await expect(contributors.locator('[data-credits-sprite]')).toHaveCount(1)
    await expect(contributors).not.toContainText('could not be loaded')
    await expect(
      page.locator('#supporters').getByRole('link', { name: 'Sorayama' }),
    ).toHaveAttribute('href', 'https://opencollective.com/sorayama')
    await expect(page.locator('#supporters')).not.toContainText('Zero Donor')

    await expect(
      page.locator('[data-credits-jump]').getByRole('link'),
    ).toHaveText(['Supporters', 'Contributors', 'Special thanks'])
    await expect(
      page
        .locator('#special-thanks')
        .getByRole('link', { name: 'Kensuke Tanaka' }),
    ).toHaveAttribute('href', 'https://www.facebook.com/kensuke.tanaka.790')
    await expect(page.locator('#special-thanks img')).toHaveCount(6)

    await expect(
      page.getByRole('link', { name: 'Contribution guide' }),
    ).toHaveAttribute('href', 'https://github.com/poooi/poi#development')
    await expect(
      page.getByRole('link', { name: 'Support poi' }),
    ).toHaveAttribute('href', 'https://opencollective.com/poi')
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Credits' }),
    ).toHaveAttribute('href', '/en/credits')
    await expect(
      page
        .getByRole('contentinfo')
        .getByRole('link', { name: /poi Contributors/ }),
    ).toHaveAttribute('href', '/en/credits')
  } finally {
    await context.close()
  }
})
