import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { operations } from '@decoding/operations'
import { detectorSpecs } from '@decoding/spec-registry'

const ids = new Set(operations.map((operation) => operation.id))
if (operations.length !== 47 || ids.size !== 47)
  throw new Error('Expected exactly 47 unique operation IDs.')
const packs = [1, 2, 3, 4].map(
  (pack) => operations.filter((operation) => operation.pack === pack).length,
)
if (packs.join(',') !== '16,11,10,10') throw new Error(`Pack coverage mismatch: ${packs.join('+')}`)

for (const operation of operations) {
  if (!operation.description.endsWith('.'))
    throw new Error(`${operation.id} description must be a sentence.`)
  if (!operation.aliases.length) throw new Error(`${operation.id} needs search aliases.`)
}

const requiredPages = [
  'index.astro',
  'tools.astro',
  'privacy.astro',
  'methodology.astro',
  'download.astro',
  'workspace.astro',
  '[tool].astro',
  'detect/[detector].astro',
]
for (const page of requiredPages) {
  if (!existsSync(resolve('apps/web/src/pages', page))) throw new Error(`Missing page: ${page}`)
}

if (
  detectorSpecs.length !== 8 ||
  detectorSpecs.some((spec) => spec.examples.length < 3 || !spec.references.length)
) {
  throw new Error('Every detector needs a page, three safe examples, and an official reference.')
}

const extension = JSON.parse(readFileSync('apps/extension/public/manifest.json', 'utf8')) as {
  permissions?: string[]
  host_permissions?: string[]
}
if (
  [...(extension.permissions ?? [])].sort().join(',') !==
    ['activeTab', 'contextMenus', 'storage'].sort().join(',') ||
  extension.host_permissions?.length
) {
  throw new Error('Extension permission boundary changed.')
}

const desktop = readFileSync('apps/desktop/src-tauri/capabilities/main.json', 'utf8')
for (const forbidden of ['shell:', 'fs:', 'http:', 'sql:']) {
  if (desktop.includes(forbidden)) throw new Error(`Forbidden desktop capability: ${forbidden}`)
}

console.log(
  `Content validation passed: 47 tools, Pack ${packs.join('+')}, 8 detector pages, least-privilege desktop and extension.`,
)
