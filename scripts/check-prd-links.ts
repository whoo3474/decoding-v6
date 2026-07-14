import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { globSync } from 'node:fs'

const files = globSync('docs/**/*.md')
const missing: string[] = []
for (const file of files) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/\[[^\]]*]\(([^)]+)\)/g)) {
    const target = match[1]?.split('#')[0]
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue
    if (!existsSync(resolve(dirname(file), decodeURIComponent(target))))
      missing.push(`${file} -> ${target}`)
  }
}
if (missing.length) throw new Error(`Broken local documentation links:\n${missing.join('\n')}`)
console.log(`PRD link check passed: ${files.length} Markdown files.`)
