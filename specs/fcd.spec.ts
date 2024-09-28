import { test } from 'next/experimental/testmode/playwright.js'
import { expect } from '@playwright/test'

const mockMetaJson = [
  { name: 'map', version: '1000/01/01/01' },
  { name: 'shipavatar', version: '1000/01/01/01' },
  { name: 'shiptag', version: '1000/01/01/01' },
]

test.describe('fcd', () => {
  test('/fcd/meta.json', async ({ page, next }) => {
    next.onFetch((request) => {
      if (
        request.url ===
        'https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/meta.json'
      ) {
        return new Response(JSON.stringify(mockMetaJson))
      }
      return 'abort'
    })

    await page.goto('/fcd/meta.json')

    const result = (await page.textContent('body')) ?? ''

    expect(JSON.parse(result)).toMatchObject(mockMetaJson)
  })

  test('404', async ({ page, next }) => {
    next.onFetch((request) => {
      if (
        request.url ===
        'https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/meta.json'
      ) {
        return new Response('', { status: 404 })
      }
      return 'abort'
    })
    await page.goto('/')

    try {
      await page.goto('/fcd/meta.json')
    } catch (e) {
      expect(e instanceof Error).toBeTruthy()
      if (e instanceof Error) {
        expect(e.message).toContain('ERR_HTTP_RESPONSE_CODE_FAILURE')
      }
    }
  })
})
