import { expect, test } from '@playwright/test'

test('home and catalog remain usable without horizontal overflow', async ({ page }) => {
  for (const route of ['/', '/tools/', '/json-format/']) {
    await page.goto(route)
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
  }
})

test('captures representative desktop and mobile visual evidence', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Paste anything/i })).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath(`home-${testInfo.project.name}.png`),
    fullPage: true,
  })
  await page.goto('/tools/')
  await page.screenshot({
    path: testInfo.outputPath(`tools-${testInfo.project.name}.png`),
    fullPage: true,
  })
})
