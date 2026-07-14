import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

const forbidden = /\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b|\bfetch\s*\(/
const candidates = [
  ...globSync('apps/web/src/**/*.{ts,tsx,astro}'),
  ...globSync('apps/desktop/src/**/*.{ts,tsx}'),
  ...globSync('apps/extension/src/**/*.{ts,tsx}'),
]
const violations: string[] = []
for (const file of candidates) {
  const source = readFileSync(file, 'utf8')
  if (forbidden.test(source)) violations.push(file)
}
if (violations.length)
  throw new Error(`Unexpected product network primitive: ${violations.join(', ')}`)
console.log(
  `Network allowlist passed: ${candidates.length} UI/runtime source files contain no network primitive.`,
)
