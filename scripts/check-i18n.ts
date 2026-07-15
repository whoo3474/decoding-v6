import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  decoderMessages,
  toolMessages,
  workbenchLocales,
} from '../packages/workbench-ui/src/messages'
import {
  catalogMessages,
  detectorPageMessages,
  homeMessages,
  layoutMessages,
  supportedLocales,
  toolPageMessages,
} from '../apps/web/src/i18n/catalog'
import { infoMessages } from '../apps/web/src/i18n/info'

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function keys(value: object): string[] {
  return Object.keys(value).sort()
}

function assertCatalog(name: string, catalog: Record<string, object>): void {
  const baseline = keys(catalog.en)
  for (const locale of supportedLocales) {
    invariant(catalog[locale], `${name}: missing ${locale}`)
    invariant(
      JSON.stringify(keys(catalog[locale])) === JSON.stringify(baseline),
      `${name}: ${locale} keys do not match English`,
    )
    for (const [key, value] of Object.entries(catalog[locale])) {
      invariant(
        typeof value === 'function' || (typeof value === 'string' && value.trim().length > 0),
        `${name}.${locale}.${key} is empty`,
      )
    }
  }
}

invariant(
  JSON.stringify([...supportedLocales]) === JSON.stringify([...workbenchLocales]),
  'Web and workbench locale lists differ',
)

assertCatalog('layout', layoutMessages)
assertCatalog('home', homeMessages)
assertCatalog('decoder', decoderMessages)
assertCatalog('tool', toolMessages)
assertCatalog('catalog', catalogMessages)
assertCatalog('detectorPage', detectorPageMessages)
assertCatalog('toolPage', toolPageMessages)

for (const locale of supportedLocales) {
  for (const page of ['methodology', 'privacy', 'about'] as const) {
    const content = infoMessages[locale][page]
    invariant(
      content.title && content.description && content.heading && content.lead,
      `${locale}/${page} is incomplete`,
    )
    invariant(content.sections.length > 0, `${locale}/${page} has no sections`)
  }
}

const routeFiles = [
  'apps/web/src/pages/[locale]/index.astro',
  'apps/web/src/pages/[locale]/tools.astro',
  'apps/web/src/pages/[locale]/[tool].astro',
  'apps/web/src/pages/[locale]/detect/[detector].astro',
  'apps/web/src/pages/[locale]/methodology.astro',
  'apps/web/src/pages/[locale]/privacy.astro',
  'apps/web/src/pages/[locale]/about.astro',
]
for (const route of routeFiles)
  invariant(readFileSync(resolve(route), 'utf8').length > 0, `Missing ${route}`)

const literalChecks = [
  [
    'packages/workbench-ui/src/DecoderWorkbench.tsx',
    ['Paste text or drop a file', 'Checking formats locally', 'Possible formats'],
  ],
  [
    'packages/workbench-ui/src/ToolWorkbench.tsx',
    ['This operation runs locally', 'Run locally', 'Operation failed'],
  ],
] as const
for (const [file, forbidden] of literalChecks) {
  const source = readFileSync(resolve(file), 'utf8')
  for (const phrase of forbidden)
    invariant(
      !source.includes(phrase),
      `${file}: UI literal escaped the message catalog: ${phrase}`,
    )
}

console.log(
  `i18n: ${supportedLocales.length} locales, typed catalogs, localized routes, and UI literal guard OK`,
)
