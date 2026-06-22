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
  await expect(page.getByRole('link', { name: 'ダウンロード' })).toBeVisible()
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
  const trailingSlashResponse = await request.get('/en/download/', {
    maxRedirects: 0,
  })

  expect(defaultLocaleResponse.status()).toBe(308)
  expect(defaultLocaleResponse.headers().location).toBe(
    'http://127.0.0.1:3002/download',
  )
  expect(trailingSlashResponse.status()).toBe(308)
  expect(trailingSlashResponse.headers().location).toBe(
    'http://127.0.0.1:3002/en/download',
  )
})

test('serves localized non-default content', async ({ page }) => {
  await page.goto('/en')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('poi | KanColle Browser')
  await expect(
    page.getByText('Scalable KanColle browser and tool.'),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Download' })).toBeVisible()
})

test('serves localized download and explore pages', async ({ page }) => {
  await page.goto('/en/download')
  await expect(page.getByRole('heading', { name: 'Download' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Old versions' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Nightly builds' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Source code' })).toBeVisible()

  await page.goto('/en/explore')
  await expect(page.locator('main')).toContainText('poi')
})

test('rejects unsupported locale-like prefixes', async ({ request }) => {
  const response = await request.get('/es/download')

  expect(response.status()).toBe(404)
})

test('does not localize API, proxy, asset, or generated image routes', async ({
  request,
}) => {
  const statusResponse = await request.get('/status', {
    headers: { Cookie: 'NEXT_LOCALE=en' },
  })
  const assetResponse = await request.get('/favicon.ico', {
    headers: { Cookie: 'NEXT_LOCALE=en' },
  })
  const imageResponse = await request.get('/opengraph-image', {
    headers: { Cookie: 'NEXT_LOCALE=en' },
  })

  expect(statusResponse.status()).toBe(200)
  expect(assetResponse.status()).toBe(200)
  expect(imageResponse.status()).toBe(200)
  expect(imageResponse.headers()['content-type']).toBe('image/png')
})
