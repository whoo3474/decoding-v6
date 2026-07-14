import { expect, test } from '@playwright/test'

test('synthetic canary never enters requests or browser storage', async ({ page }) => {
  const canary = 'DECODING_CANARY_8f31b7b7_secret'
  const leaks: string[] = []
  page.on('request', (request) => {
    const material = [
      request.url(),
      request.postData() ?? '',
      JSON.stringify(request.headers()),
    ].join('\n')
    if (material.includes(canary) || material.includes(encodeURIComponent(canary)))
      leaks.push(`${request.method()} ${request.url()}`)
  })
  await page.goto('/')
  await page.getByLabel('Paste text or drop a file').fill(btoa(JSON.stringify({ secret: canary })))
  await expect(page.getByText('JSON', { exact: false }).first()).toBeVisible()
  await page.waitForTimeout(500)

  const storage = await page.evaluate(async () => {
    const local = { ...localStorage }
    const session = { ...sessionStorage }
    const databases = 'databases' in indexedDB ? await indexedDB.databases() : []
    const cacheKeys = 'caches' in globalThis ? await caches.keys() : []
    return JSON.stringify({ local, session, databases, cacheKeys, history: history.state })
  })
  expect(storage).not.toContain(canary)
  expect(leaks).toEqual([])
})

test('all network destinations remain same-origin before ads', async ({ page }) => {
  const origins = new Set<string>()
  page.on('request', (request) => origins.add(new URL(request.url()).origin))
  await page.goto('/curl-to-code/')
  await expect(page.locator('.tool-workbench')).toHaveAttribute('data-hydrated', 'true')
  await page.getByRole('button', { name: 'Run locally' }).click()
  await expect(page.locator('.output-view')).toContainText('fetch')
  expect([...origins]).toEqual(['http://127.0.0.1:4321'])
})

test('workspace stores only redacted structure and clear deletes it', async ({ page }) => {
  const secret = 'WORKSPACE_CANARY_raw_secret_92f1'
  await page.goto('/workspace/')
  await expect(page.locator('.workspace-manager')).toHaveAttribute('data-hydrated', 'true')
  await page.getByLabel('Name').fill('Local test')
  await page
    .getByLabel('Structure JSON')
    .fill(JSON.stringify({ userId: 42, token: secret, nested: { value: secret } }))
  await page.getByRole('button', { name: 'Save redacted structure' }).click()
  await expect(page.getByText('Redacted structure saved')).toBeVisible()
  const persisted = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('decoding-local-workspace')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = database.transaction('redacted-records')
    const records = await new Promise<unknown[]>((resolve, reject) => {
      const request = transaction.objectStore('redacted-records').getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return JSON.stringify(records)
  })
  expect(persisted).not.toContain(secret)
  expect(persisted).toContain('[redacted]')
  await page.getByRole('button', { name: 'Clear workspace' }).click()
  await expect(page.getByText('0 redacted records')).toBeVisible()
})
