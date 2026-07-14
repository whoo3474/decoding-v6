import { expect, test } from '@playwright/test'

test('auto-detects a nested Base64 JSON payload locally', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Paste anything/i })).toBeVisible()
  const input = page.getByLabel('Paste text or drop a file')
  await input.fill('eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==')
  await expect(page.getByText('Base64', { exact: false }).first()).toBeVisible()
  await expect(page.getByText('JSON', { exact: false }).first()).toBeVisible()
  await expect(page.getByText('0 bytes uploaded')).toBeVisible()
})

test('lists exactly 47 searchable tools', async ({ page }) => {
  await page.goto('/tools/')
  await expect(page.locator('.catalog-shell')).toHaveAttribute('data-hydrated', 'true')
  await expect(page.getByText('47 of 47 tools')).toBeVisible()
  await expect(page.locator('.tool-card')).toHaveCount(47)
  await page.getByPlaceholder(/format JSON/).fill('certificate')
  await expect(page.locator('.tool-card')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: /Certificate Decoder/ })).toBeVisible()
})

test('command palette focus, favorites, and recent tools store slugs only', async ({ page }) => {
  await page.goto('/tools/')
  const catalog = page.locator('.catalog-shell')
  await expect(catalog).toHaveAttribute('data-hydrated', 'true')
  const search = page.getByPlaceholder(/format JSON/)
  await page.keyboard.press('Control+k')
  await expect(search).toBeFocused()
  await page.getByRole('button', { name: 'Add JSON Format / Validate to favorites' }).click()
  const stored = await page.evaluate(() => ({
    favorites: localStorage.getItem('decoding-favorite-tools'),
    keys: Object.keys(localStorage),
  }))
  expect(stored.favorites).toBe('["json-format"]')
  expect(stored.keys).toEqual(['decoding-favorite-tools'])
  await page.getByRole('link', { name: /JSON Format \/ Validate/ }).click()
  await page.goto('/tools/')
  await expect(page.getByRole('heading', { name: 'Recent tools' })).toBeVisible()
  await expect(
    page.locator('.recent-links').getByRole('link', { name: 'JSON Format / Validate' }),
  ).toBeVisible()
})

test('runs a dedicated JSON formatter operation', async ({ page }) => {
  await page.goto('/json-format/')
  await expect(page.locator('.tool-workbench')).toHaveAttribute('data-hydrated', 'true')
  await page.locator('.operation-pane textarea').first().fill('{"answer":42,"local":true}')
  await page.getByRole('button', { name: 'Run locally' }).click()
  await expect(page.locator('.output-view')).toContainText('"answer": 42')
  await expect(page.getByText('Valid JSON')).toBeVisible()
})

test('renders HTML preview inside a locked sandbox', async ({ page }) => {
  await page.goto('/html-preview/')
  await expect(page.locator('.tool-workbench')).toHaveAttribute('data-hydrated', 'true')
  await page.getByRole('button', { name: 'Run locally' }).click()
  const frame = page.locator('iframe.safe-preview')
  await expect(frame).toHaveAttribute('sandbox', '')
  await expect(frame).toHaveAttribute('srcdoc', /default-src 'none'/)
})
