import { chromium } from '@playwright/test'

const baseURL = process.argv
  .slice(2)
  .find((argument) => argument !== '--')
  ?.replace(/\/$/, '')

if (!baseURL) {
  throw new Error('Usage: node scripts/verify-deploy.mjs <base-url>')
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const canary = 'DECODING_DEPLOY_CANARY_6b4761e7_secret'
const canaryLeaks = []
const externalOrigins = new Set()

page.on('request', (request) => {
  const requestURL = new URL(request.url())
  if (requestURL.origin !== new URL(baseURL).origin) externalOrigins.add(requestURL.origin)

  const material = [
    request.url(),
    request.postData() ?? '',
    JSON.stringify(request.headers()),
  ].join('\n')
  if (material.includes(canary) || material.includes(encodeURIComponent(canary))) {
    canaryLeaks.push(`${request.method()} ${request.url()}`)
  }
})

try {
  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' })
  await page.getByLabel('Paste text or drop a file').fill(btoa(JSON.stringify({ secret: canary })))
  await page.getByText('Base64', { exact: false }).first().waitFor()
  await page.getByText('JSON', { exact: false }).first().waitFor()
  await page.getByText('0 bytes uploaded').waitFor()

  const storage = await page.evaluate(async () => {
    const databases = 'databases' in indexedDB ? await indexedDB.databases() : []
    return JSON.stringify({
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
      databases,
      history: history.state,
    })
  })

  if (storage.includes(canary)) throw new Error('Synthetic canary was persisted in browser storage')
  if (canaryLeaks.length > 0) throw new Error(`Synthetic canary leaked: ${canaryLeaks.join(', ')}`)

  await page.goto(`${baseURL}/tools/`, { waitUntil: 'networkidle' })
  await page.getByText('47 of 47 tools').waitFor()
  if ((await page.locator('.tool-card').count()) !== 47)
    throw new Error('Expected exactly 47 tools')

  await page.goto(`${baseURL}/json-format/`, { waitUntil: 'networkidle' })
  await page.locator('.operation-pane textarea').first().fill('{"answer":42,"local":true}')
  await page.getByRole('button', { name: 'Run locally' }).click()
  await page
    .locator('.output-view')
    .getByText(/"answer": 42/)
    .waitFor()

  if (externalOrigins.size > 0) {
    throw new Error(`Unexpected external request origins: ${[...externalOrigins].join(', ')}`)
  }

  console.log(
    JSON.stringify(
      {
        baseURL,
        autoDetection: 'passed',
        toolCount: 47,
        localOperation: 'passed',
        canaryEgress: 'none',
        canaryStorage: 'none',
        externalRequestOrigins: [],
      },
      null,
      2,
    ),
  )
} finally {
  await browser.close()
}
