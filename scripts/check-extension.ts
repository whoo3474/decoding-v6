import { readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync('apps/extension/public/manifest.json', 'utf8')) as {
  permissions?: string[]
  host_permissions?: string[]
  content_security_policy?: { extension_pages?: string }
}
const permissions = [...(manifest.permissions ?? [])].sort()
if (permissions.join(',') !== ['activeTab', 'contextMenus', 'storage'].sort().join(','))
  throw new Error(`Extension permissions changed: ${permissions.join(',')}`)
if (manifest.host_permissions?.length)
  throw new Error('Extension host permissions must remain empty.')
if (!manifest.content_security_policy?.extension_pages?.includes("connect-src 'none'"))
  throw new Error('Extension CSP must block network connections.')
console.log(
  'Extension boundary passed: contextMenus + activeTab + storage, no host permissions, connect-src none.',
)
