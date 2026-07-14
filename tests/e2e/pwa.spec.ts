import { expect, test } from '@playwright/test'

test('core shell and decoder reload offline after explicit service worker install', async ({
  context,
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    if (registration.installing)
      await new Promise((resolve) =>
        registration.installing?.addEventListener('statechange', resolve, { once: true }),
      )
  })
  await page.goto('/tools/')
  await expect(page.getByText('47 of 47 tools')).toBeVisible()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText('47 of 47 tools')).toBeVisible()
  await context.setOffline(false)
})
