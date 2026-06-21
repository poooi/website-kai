import { expect } from '@playwright/test'
import { test } from 'next/experimental/testmode/playwright.js'

test.describe('dist', () => {
  test('/dist/poi-10.9.2-arm64-win.7z', async ({ request }) => {
    const response = await request.get('/dist/poi-10.9.2-arm64-win.7z', {
      maxRedirects: 0,
    })

    expect(response.status()).toBe(301)
    expect(response.headers().location).toContain('poi-10.9.2-arm64-win.7z')
  })

  test('/dist/latest.yml', async ({ page, next }) => {
    const timestamp = Date.now().toString()
    next.onFetch((request) => {
      if (
        request.url ===
        'https://raw.githubusercontent.com/poooi/poi-release/master/latest.json'
      ) {
        return new Response(
          JSON.stringify({
            version: 'v10.9.2',
            betaVersion: 'v99.99.99',
          }),
        )
      }
      if (
        request.url ===
        'https://github.com/poooi/poi/releases/download/v10.9.2/latest.yml'
      ) {
        return new Response(timestamp)
      }
      return new Response('', { status: 404 })
    })

    await page.goto('/dist/latest.yml')

    const result = (await page.textContent('body')) ?? ''

    expect(result).toEqual(timestamp)
  })

  test('/dist/beta.yml', async ({ page, next }) => {
    const timestamp = Date.now().toString()
    next.onFetch((request) => {
      if (
        request.url ===
        'https://raw.githubusercontent.com/poooi/poi-release/master/latest.json'
      ) {
        return new Response(
          JSON.stringify({
            version: 'v10.9.2',
            betaVersion: 'v99.99.99',
          }),
        )
      }
      if (
        request.url ===
        'https://github.com/poooi/poi/releases/download/v99.99.99/latest.yml'
      ) {
        return new Response(timestamp)
      }
      return new Response('', { status: 404 })
    })

    await page.goto('/dist/beta.yml')

    const result = (await page.textContent('body')) ?? ''

    expect(result).toEqual(timestamp)
  })

  test('404', async ({ page, next }) => {
    next.onFetch((request) => {
      if (
        request.url ===
        'https://raw.githubusercontent.com/poooi/poi-release/master/latest.json'
      ) {
        return new Response(
          JSON.stringify({
            version: 'v10.9.2',
            betaVersion: 'v11.0.0-beta.6',
          }),
        )
      }
      return new Response('', { status: 404 })
    })

    let error: unknown
    try {
      await page.goto('/dist/latest.yml')
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(Error)
    if (error instanceof Error) {
      expect(error.message).toContain('ERR_HTTP_RESPONSE_CODE_FAILURE')
    }
  })
})
