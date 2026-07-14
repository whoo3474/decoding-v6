import { gzipSync } from 'node:zlib'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const assetDir = 'apps/web/dist/_astro'
const files = readdirSync(assetDir).filter((file) => file.endsWith('.js'))
const baseFiles = files.filter((file) =>
  /WebDecoder|client\.|hooks|signals|preact|jsxRuntime|decoder\.worker/.test(file),
)
const gzipBytes = baseFiles.reduce(
  (sum, file) => sum + gzipSync(readFileSync(join(assetDir, file))).length,
  0,
)
const budget = 170 * 1024
if (gzipBytes > budget)
  throw new Error(`Initial decoder JS ${gzipBytes} exceeds ${budget} bytes gzip.`)

const heavy = files.filter((file) =>
  /format-|generate-|encode-|convert-|inspect-|babel-|postcss-|estree-|html-/.test(file),
)
if (!heavy.length) throw new Error('Expected heavy operation chunks to remain lazy.')
for (const file of files) {
  const size = statSync(join(assetDir, file)).size
  if (size > 400 * 1024) throw new Error(`${file} exceeds the 400 KiB local chunk ceiling.`)
}
console.log(
  `Bundle budget passed: ${(gzipBytes / 1024).toFixed(1)} KiB initial gzip; ${heavy.length} heavy local chunks stay lazy.`,
)
