import { expect, test } from '@playwright/test'

test('renders the isolated TanStack preview route', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'poi TanStack preview' }),
  ).toBeVisible()
  await expect(page.getByText('proves the scaffold builds')).toBeVisible()
})
