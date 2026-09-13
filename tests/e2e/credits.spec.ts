import { expect, test } from '@playwright/test'

test('renders credits, contributors and the support links', async ({
  page,
}) => {
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

  const avatar = contributors.locator('img').first()
  await expect(avatar).toHaveAttribute('loading', 'lazy')
  await expect(avatar).toHaveAttribute('width', '48')
  await expect(avatar).toHaveAttribute('height', '48')

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
    await expect(contributors).not.toContainText('could not be loaded')
    await expect(
      page.locator('#supporters').getByRole('link', { name: 'Sorayama' }),
    ).toHaveAttribute('href', 'https://opencollective.com/sorayama')
    await expect(page.locator('#supporters')).not.toContainText('Zero Donor')

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
