import { test } from 'next/experimental/testmode/playwright.js'
import { expect } from '@playwright/test'

test.describe('dist', () => {
  test('/dist/poi-10.9.2-arm64-win.7z', async ({ page, next }) => {
    next.onFetch(() => {
      return new Response('')
    })

    const downloadPromise = page.waitForEvent('download')
    try {
      await page.goto('/dist/poi-10.9.2-arm64-win.7z')
    } catch (e) {
      /* do nothing */
    }
    const file = await downloadPromise

    expect(file.url()).toContain('poi-10.9.2-arm64-win.7z')
  })

  test('/dist/latest.yml', async ({ page, next }) => {
    const timestamp = Date.now().toString()
    next.onFetch((request) => {
      if (
        request.url ===
        'https://raw.githubusercontent.com/poooi/website/master/packages/data/update/latest.json'
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
        'https://raw.githubusercontent.com/poooi/website/master/packages/data/update/latest.json'
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
        'https://raw.githubusercontent.com/poooi/website/master/packages/data/update/latest.json'
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

    try {
      await page.goto('/dist/latest.yml')
    } catch (e) {
      expect(e instanceof Error).toBeTruthy()
      if (e instanceof Error) {
        expect(e.message).toContain('ERR_HTTP_RESPONSE_CODE_FAILURE')
      }
    }
  })
})
