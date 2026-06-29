import { expect, test } from '@playwright/test'

test('renders the isolated TanStack preview route', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.context().addCookies([
    {
      name: 'NEXT_LOCALE',
      url: 'http://127.0.0.1:3002',
      value: 'ja',
    },
  ])
  const response = await page.goto('/')

  await expect(page.getByRole('heading', { name: 'poi' })).toBeVisible()
  await expect(page.getByText(/拡張可能/)).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'ダウンロードオプション' }),
  ).toBeVisible()
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  )
  expect(response).not.toBeNull()
  const headers = response!.headers()
  expect(headers['x-poi-codename']).toBe('Shiratsuyu')
  expect(headers['x-poi-greetings']).toBe('poi?')
  expect(headers['accept-ch']).toContain('Sec-CH-UA-Platform')
  expect(headers['accept-ch']).toContain('Sec-CH-Prefers-Color-Scheme')
  expect(headers['critical-ch']).toContain('Sec-CH-UA-Platform')
  expect(headers['critical-ch']).toContain('Sec-CH-Prefers-Color-Scheme')
  expect(headers.vary).toContain('Sec-CH-UA-Platform')
  expect(headers.vary).toContain('Sec-CH-Prefers-Color-Scheme')
  expect(headers['cache-control']).toBe('no-store')
})

test('marks HEAD page responses as no-store', async ({ request }) => {
  const response = await request.head('/')

  expect(response.status()).toBe(200)
  expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
  expect(response.headers()['cache-control']).toBe('no-store')
})

test('keeps request-personalized pages uncacheable and varied by request hints', async ({
  request,
}) => {
  for (const path of ['/', '/en', '/en/download']) {
    const response = await request.get(path, {
      headers: {
        'Sec-CH-Prefers-Color-Scheme': 'dark',
        'Sec-CH-UA-Arch': '"arm"',
        'Sec-CH-UA-Bitness': '"64"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"macOS"',
      },
    })
    const headers = response.headers()

    expect(response.status()).toBe(200)
    expect(headers['cache-control']).toBe('no-store')
    expect(headers['accept-ch']).toContain('Sec-CH-UA-Platform')
    expect(headers['accept-ch']).toContain('Sec-CH-Prefers-Color-Scheme')
    for (const value of [
      'Sec-CH-UA-Platform',
      'Sec-CH-UA-Arch',
      'Sec-CH-UA-Bitness',
      'Sec-CH-UA-Mobile',
      'Sec-CH-Prefers-Color-Scheme',
    ]) {
      expect(headers.vary).toContain(value)
    }
  }
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
  const cssPath = '/fonts/plex-sans/IBMPlexSans-Regular.css'
  const response = await request.get(cssPath)

  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toBe('public,max-age=3600')
  const css = await response.text()
  expect(css).toContain('IBM Plex Sans')

  const fontPath = /url\(["']?(.+?\.woff2)["']?\)/.exec(css)?.[1]
  expect(fontPath).toBeTruthy()
  const fontUrl = new URL(fontPath!, `https://example.test${cssPath}`).pathname
  const fontResponse = await request.get(fontUrl)

  expect(fontResponse.status()).toBe(200)
  expect(fontResponse.headers()['cache-control']).toBe('public,max-age=3600')
  expect(fontResponse.headers()['content-type']).toContain('font/woff2')
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
  for (const path of [
    '/opengraph-image',
    '/opengraph-image/',
    '/twitter-image',
    '/twitter-image/',
  ]) {
    const response = await request.get(path)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
    expect(response.headers()['cache-control']).toBe('public,max-age=3600')
    expect(response.headers()['accept-ch']).toBeUndefined()
    expect(response.headers().vary).not.toContain('Sec-CH-UA-Platform')
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

  const malformedResponse = await request.post('/api/monitoring', {
    data: 'not-json',
  })
  expect(malformedResponse.status()).toBe(400)
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

test('keeps proxy subroutes out of page locale/header handling', async ({
  request,
}) => {
  const response = await request.get('/dist/en', {
    headers: {
      Cookie: 'NEXT_LOCALE=fr',
    },
    maxRedirects: 0,
  })

  expect(response.status()).toBe(404)
  expect(response.headers().location).toBeUndefined()
  expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
  expect(response.headers()['accept-ch']).toBeUndefined()
  expect(response.headers()['critical-ch']).toBeUndefined()
  expect(response.headers()['cache-control']).not.toBe('no-store')
  expect(response.headers().vary).not.toContain('Sec-CH-UA-Platform')
})

test('keeps proxy collection roots reserved before locale redirects', async ({
  request,
}) => {
  for (const path of [
    '/dist',
    '/dist/',
    '/fcd',
    '/fcd/',
    '/update',
    '/update/',
  ]) {
    const response = await request.get(path, {
      headers: {
        Cookie: 'NEXT_LOCALE=en',
      },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(404)
    expect(response.headers().location).toBeUndefined()
    expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
  }
})

test('returns 404 for unknown localized page shapes', async ({ request }) => {
  for (const path of [
    '/missing',
    '/en/missing',
    '/xx/download',
    '/fr/download/extra',
  ]) {
    const response = await request.get(path, {
      maxRedirects: 0,
    })

    expect(response.status()).toBe(404)
    expect(response.headers().location).toBeUndefined()
    expect(response.headers()['x-poi-codename']).toBe('Shiratsuyu')
  }
})
