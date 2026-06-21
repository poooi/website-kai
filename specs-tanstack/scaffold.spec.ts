import { expect, test } from '@playwright/test'

test('renders the isolated TanStack preview route', async ({ page }) => {
  const response = await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'poi TanStack preview' }),
  ).toBeVisible()
  await expect(page.getByText('proves the scaffold builds')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Status route' })).toBeVisible()
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  )
  expect(response).not.toBeNull()
  const headers = response!.headers()
  expect(headers['x-poi-codename']).toBe('Shiratsuyu')
  expect(headers['x-poi-greetings']).toBe('poi?')
  expect(headers['accept-ch']).toContain('Sec-CH-UA-Platform')
  expect(headers['critical-ch']).toContain('Sec-CH-UA-Platform')
  expect(headers.vary).toContain('Sec-CH-UA-Platform')
  expect(headers['cache-control']).toBe('no-store')
})

test('marks HEAD page responses as no-store', async ({ request }) => {
  const response = await request.head('/')

  expect(response.status()).toBe(200)
  expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
  expect(response.headers()['cache-control']).toBe('no-store')
})

test('serves static assets before SSR with cache headers', async ({
  request,
}) => {
  const response = await request.get('/favicon.ico')

  expect(response.status()).toBe(200)
  expect(response.headers()['x-poi-codename']).toBeUndefined()
  expect(response.headers()['accept-ch']).toBeUndefined()
  expect(response.headers()['cache-control']).toContain('public')
})

test('serves copied IBM Plex font assets', async ({ request }) => {
  const response = await request.get('/fonts/plex-sans/IBMPlexSans-Regular.css')

  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toBe('public,max-age=3600')
  await expect(response.text()).resolves.toContain('IBM Plex Sans')
})

test('serves hashed Vite assets with immutable cache headers', async ({
  page,
  request,
}) => {
  await page.goto('/')
  const scriptSrc = await page
    .locator('script[src^="/assets/"]')
    .first()
    .getAttribute('src')

  expect(scriptSrc).toBeTruthy()
  const response = await request.get(scriptSrc!)

  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toBe(
    'public,max-age=31536000,immutable',
  )
})

test('serves static social image routes', async ({ request }) => {
  for (const path of ['/opengraph-image', '/twitter-image']) {
    const response = await request.get(path)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
    expect(response.headers()['cache-control']).toBe('public,max-age=3600')
  }
})

test('reserves monitoring route without locale/page headers', async ({
  request,
}) => {
  for (const path of ['/api/monitoring', '/api/monitoring/']) {
    const response = await request.get(path)

    expect(response.status()).toBe(405)
    expect(response.headers().allow).toBe('POST')
    expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
    expect(response.headers()['accept-ch']).toBeUndefined()
  }
})

test('serves status through the TanStack Worker route', async ({ request }) => {
  const response = await request.get('/status', {
    headers: {
      'CF-IPCountry': 'JP',
    },
  })

  expect(response.status()).toBe(200)
  expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
  expect(response.headers()['accept-ch']).toBeUndefined()
  await expect(response.json()).resolves.toEqual({
    message: 'poi poi poi!',
    region: 'JP',
  })
})

test('serves dist artifact redirects through the TanStack Worker route', async ({
  request,
}) => {
  const response = await request.get('/dist/poi-10.9.2-win.7z', {
    maxRedirects: 0,
  })

  expect(response.status()).toBe(301)
  expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
  expect(response.headers().location).toBe(
    'https://github.com/poooi/poi/releases/download/v10.9.2/poi-10.9.2-win.7z',
  )
})

test('serves invalid proxy route inputs as 404 through TanStack', async ({
  request,
}) => {
  const fcdResponse = await request.get('/fcd/meta.md')
  const updateResponse = await request.get('/update/file.exe')
  const distResponse = await request.get('/dist/file.exe')

  for (const response of [fcdResponse, updateResponse, distResponse]) {
    expect(response.status()).toBe(404)
    expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
  }
})
