import { test } from 'next/experimental/testmode/playwright.js'
import { expect } from '@playwright/test'

test('/fcd/meta.json', async ({ request, page, next }) => {
  next.onFetch((request) => {
    if (
      request.url ===
      'https://raw.githubusercontent.com/poooi/poi/master/assets/data/fcd/meta.json'
    ) {
      return new Response(
        JSON.stringify([
          { name: 'map', version: '1000/01/01/01' },
          { name: 'shipavatar', version: '1000/01/01/01' },
          { name: 'shiptag', version: '1000/01/01/01' },
        ]),
      )
    }
    return 'abort'
  })

  await page.goto('/fcd/meta.json')

  const result = (await page.textContent('body')) ?? ''

  expect(JSON.parse(result)).toMatchObject([
    { name: 'map', version: '1000/01/01/01' },
    { name: 'shipavatar', version: '1000/01/01/01' },
    { name: 'shiptag', version: '1000/01/01/01' },
  ])
})
