import { expect, test } from '@playwright/test'

test('renders stable release history and GitHub Release links without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:3002/en/changelog')
    await expect(
      page.getByRole('heading', { level: 2, name: /^POI v12\.0\.1\b/ }),
    ).toHaveCount(1)
    const firstRelease = page.getByRole('region', {
      name: 'POI v1.0.0',
      exact: true,
    })
    await expect(firstRelease).toContainText(
      'Hello world! This is the first version of poi.',
    )
    await expect(firstRelease.getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/poooi/poi/releases/tag/v1.0.0',
    )
    const translated = page.getByRole('region', {
      name: 'POI v6.0.0',
      exact: true,
    })
    await expect(translated).toContainText('Add message history')
    await expect(translated).not.toContainText(
      'Reconstructed from version changes',
    )
    await expect(translated).not.toContainText('kcwiki')
    const versions = await page.locator('main section h2').allTextContents()
    expect(versions.at(-1)).toBe('POI v1.0.0')
    expect(versions.some((version) => /beta|win7/.test(version))).toBe(false)
    const recovered = page.getByRole('region', {
      name: 'POI v10.6.0',
      exact: true,
    })
    await expect(recovered).toContainText(
      'Fix mute setting not working on some devices',
    )
    await expect(recovered.getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/poooi/poi/releases/tag/v10.6.0',
    )
    await expect(recovered).not.toContainText(
      'Reconstructed from version changes',
    )
    await expect(page.getByRole('main')).toHaveCSS('opacity', '1')
    const directory = page.getByRole('navigation', {
      name: 'Version navigation',
    })
    await directory.locator('summary').filter({ hasText: '2016' }).click()
    await directory.getByRole('link', { name: 'v6.1.3', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'POI v6.1.3', exact: true }),
    ).toBeInViewport()
  } finally {
    await context.close()
  }
})

test('renders recovered and newly translated Chinese history', async ({
  page,
}) => {
  await page.goto('/zh-Hans/changelog')
  const recovered = page.getByRole('region', {
    name: 'POI v6.0.0',
    exact: true,
  })
  await expect(recovered).toContainText('点击消息栏即可弹出历史记录')
  await expect(recovered).not.toContainText('根据版本间变更重建')
  await expect(recovered).not.toContainText('kcwiki 语音字幕')
  await expect(recovered.locator('.prose')).toHaveAttribute('lang', 'zh-CN')
  await expect(
    recovered.getByRole('link', { name: 'POI v6.0.0', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/poooi/poi/releases/tag/v6.0.0')
  const applicationNotes = page.getByRole('region', {
    name: 'POI v7.4.0',
    exact: true,
  })
  await expect(applicationNotes).toContainText('增加插件自动更新')
  await expect(applicationNotes).not.toContainText('星级争霸')
  await expect(applicationNotes).not.toContainText('鬼怒改二')
  const firstRelease = page.getByRole('region', {
    name: 'POI v1.0.0',
    exact: true,
  })
  await expect(firstRelease).toContainText('这是 poi 的第一个版本')
  await expect(firstRelease.locator('.prose')).toHaveAttribute('lang', 'zh-CN')
  const oldServerNotes = page.getByRole('region', {
    name: 'POI v7.7.0',
    exact: true,
  })
  await expect(oldServerNotes).toContainText('基地航空队支持')
  await expect(oldServerNotes.locator('.prose')).toHaveAttribute(
    'lang',
    'zh-CN',
  )
  await expect(oldServerNotes.getByRole('link')).toHaveAttribute(
    'href',
    'https://github.com/poooi/poi/releases/tag/v7.7.0',
  )
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

for (const [locale, language, historyText, pluginName] of [
  ['ja', 'ja-JP', '通知の履歴機能を追加', 'kcwiki'],
  ['zh-Hant', 'zh-TW', '增加訊息歷史記錄', 'kcwiki'],
] as const) {
  test(`renders complete ${locale} history with plugin details hidden`, async ({
    page,
  }) => {
    await page
      .context()
      .addCookies([
        { name: 'NEXT_LOCALE', value: locale, url: 'http://127.0.0.1:3002' },
      ])
    await page.goto(`/${locale}/changelog`)
    const recovered = page.getByRole('region', {
      name: 'POI v6.0.0',
      exact: true,
    })
    await expect(recovered).toContainText(historyText)
    await expect(recovered).not.toContainText(pluginName)
    await expect(recovered.locator('.prose')).toHaveAttribute('lang', language)
    const first = page.getByRole('region', {
      name: 'POI v1.0.0',
      exact: true,
    })
    await expect(first.locator('.prose')).toHaveAttribute('lang', language)
    await expect(first).toBeVisible()
    await expect(recovered.getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/poooi/poi/releases/tag/v6.0.0',
    )
    await page.setViewportSize({ width: 390, height: 844 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  })
}

test('hides new plugin announcements in all four archive languages', async ({
  page,
}) => {
  for (const locale of ['en', 'zh-Hans', 'zh-Hant', 'ja']) {
    await page.context().clearCookies()
    await page.goto(`/${locale}/changelog`)
    const latest = page.getByRole('region', {
      name: 'POI v10.7.0',
      exact: true,
    })
    await expect(latest).toContainText('Electron@15')
    await expect(latest).not.toContainText(
      /poi-plugin-quest-info-2|任务信息2|任務資訊2/,
    )
    await expect(
      page.getByRole('region', { name: 'POI v10.2.0', exact: true }),
    ).not.toContainText(/New Ship Reminder|新舰力保|新艦力保/)
  }
})

test('groups versions by year and synchronizes navigation with scrolling', async ({
  page,
}) => {
  await page.goto('/zh-Hans/changelog')
  const directory = page.getByRole('navigation', { name: '版本目录' })
  await expect(page.getByRole('main').getByRole('region')).toHaveCount(79)
  await expect(page.getByRole('main')).toHaveCSS('opacity', '1')
  await directory.locator('summary').filter({ hasText: '2016' }).click()
  const versionLink = directory.getByRole('link', {
    name: 'v6.1.3',
    exact: true,
  })
  await versionLink.click()
  await expect(page).toHaveURL(/#release-v6\.1\.3$/)
  await expect(
    page.getByRole('heading', { name: 'POI v6.1.3', exact: true }),
  ).toBeInViewport()
  await expect(versionLink).toHaveAttribute('aria-current', 'location')
  const tagged = page.getByRole('region', { name: 'POI v10.2.1', exact: true })
  await tagged
    .getByRole('heading')
    .evaluate((element) => element.scrollIntoView())
  await expect(
    directory.getByRole('link', { name: 'v10.2.1', exact: true }),
  ).toHaveAttribute('aria-current', 'location')
  await expect(
    directory
      .locator('details')
      .filter({ has: page.locator('summary').filter({ hasText: '2019' }) }),
  ).toHaveAttribute('open', '')
  await expect(tagged).toContainText('更新内容与 v10.2.2 相同')
  await expect(tagged.locator('time')).toHaveAttribute(
    'datetime',
    '2019-02-10T18:07:39Z',
  )
  await page.screenshot({
    path: 'artifacts/changelog-timeline-desktop.png',
    animations: 'disabled',
  })
  expect(
    await directory.evaluate(
      (nav) =>
        nav.scrollHeight === nav.clientHeight &&
        nav.scrollWidth === nav.clientWidth,
    ),
  ).toBe(true)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('details[data-mobile-directory] > summary').click()
  const mobileDirectory = page.getByRole('navigation', { name: '版本目录' })
  await mobileDirectory.locator('summary').filter({ hasText: '2016' }).click()
  await mobileDirectory
    .getByRole('link', { name: 'v6.1.3', exact: true })
    .click()
  await expect(
    page.locator('details[data-mobile-directory]'),
  ).not.toHaveAttribute('open', '')
  await expect(
    page.getByRole('heading', { name: 'POI v6.1.3', exact: true }),
  ).toBeInViewport()
  await page.screenshot({
    path: 'artifacts/changelog-timeline-mobile.png',
    animations: 'disabled',
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

test('compares the full upgrade range with shareable selections and useful empty states', async ({
  page,
}) => {
  await page.goto('/zh-Hans/changelog/compare?from=v6.0.1&to=v6.1.3')
  await expect(page.getByRole('main').getByRole('region')).toHaveCount(3)
  await expect(
    page.getByRole('region', { name: 'POI v6.1.1', exact: true }),
  ).toContainText('增加禁用面板切换动画')
  await expect(
    page.getByRole('region', { name: 'POI v6.1.2', exact: true }),
  ).toContainText('任务追踪记录')
  await expect(
    page.getByRole('region', { name: 'POI v6.1.3', exact: true }),
  ).toContainText('死循环')
  await expect(
    page.getByRole('region', { name: 'POI v6.0.1', exact: true }),
  ).toHaveCount(0)
  await page.screenshot({
    path: 'artifacts/changelog-compare-desktop.png',
    animations: 'disabled',
    fullPage: true,
  })
  await page.getByLabel('起始版本').selectOption('v6.1.3')
  await page.getByLabel('目标版本').selectOption('v6.0.1')
  await page.getByRole('button', { name: '查看更新' }).click()
  await expect(page).toHaveURL(/from=v6\.1\.3&to=v6\.0\.1/)
  await expect(page.getByRole('main').getByRole('region')).toHaveCount(3)
  await page.getByLabel('目标版本').selectOption('v6.1.3')
  await page.getByRole('button', { name: '查看更新' }).click()
  await expect(page.getByRole('status')).toContainText('两个版本相同')
  await page.goto('/zh-Hans/changelog/compare?from=v99.0.0&to=v6.1.3')
  await expect(
    page.getByRole('alert').filter({ hasText: '请选择归档' }),
  ).toBeVisible()
  await page.goto('/zh-Hans/changelog/compare?from=v5.2.0&to=v6.1.3')
  await expect(page.getByRole('main')).not.toContainText('kcwiki')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: 'artifacts/changelog-compare-mobile.png',
    animations: 'disabled',
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

test('comparison form works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(
      'http://127.0.0.1:3002/en/changelog/compare?from=v6.0.1&to=v6.1.3',
    )
    await expect(page.getByRole('main').getByRole('region')).toHaveCount(3)
    await page.getByLabel('Starting version').selectOption('v6.1.2')
    await expect(page.getByRole('main')).toHaveCSS('opacity', '1')
    await page.getByRole('button', { name: 'Show updates' }).click()
    await expect(page.getByRole('main').getByRole('region')).toHaveCount(1)
    await expect(
      page.getByRole('region', { name: 'POI v6.1.3', exact: true }),
    ).toBeVisible()
  } finally {
    await context.close()
  }
})
