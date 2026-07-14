import { readFile } from 'node:fs/promises'
import { stdin, stdout, stderr } from 'node:process'
import { decode, type ChainNode, type DecodeInput } from '@decoding/engine'
import { executeOperation, operationById, operations } from '@decoding/operations'

type CliOptions = {
  file?: string
  format: string
  json: boolean
  ndjson: boolean
  listTools: boolean
  help: boolean
  maxDepth?: number
  noLint: boolean
  operationOptions: Record<string, string | number | boolean>
}

const usage = `decoding — local-only universal decoder and 47-tool CLI

Usage:
  cat payload.txt | decoding
  pbpaste | decoding --json
  decoding --file sample.bin
  cat input.txt | decoding --format json-format --option mode=minify

Options:
  --file <path>       Read a local file (positional payloads are rejected)
  --format <id>       auto or one of the 47 operation IDs
  --option k=v        Operation option; repeatable
  --json              Print one JSON document
  --ndjson            Print each chain node as NDJSON
  --max-depth <n>     Override recursive chain depth, 1-8
  --no-lint           Hide lint warnings in human output
  --list-tools        Print all operation IDs
  --help              Show this help

No update check, telemetry, account, or network code is included.`

function parseValue(value: string): string | number | boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  return value
}

function parseArgs(args: string[]): CliOptions {
  const output: CliOptions = {
    format: 'auto',
    json: false,
    ndjson: false,
    listTools: false,
    help: false,
    noLint: false,
    operationOptions: {},
  }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? ''
    const next = args[index + 1]
    if (arg === '--file' && next) {
      output.file = next
      index += 1
    } else if (arg === '--format' && next) {
      output.format = next
      index += 1
    } else if (arg === '--option' && next) {
      const separator = next.indexOf('=')
      if (separator < 1) throw new Error('--option expects key=value.')
      output.operationOptions[next.slice(0, separator)] = parseValue(next.slice(separator + 1))
      index += 1
    } else if (arg === '--max-depth' && next) {
      const value = Number(next)
      if (!Number.isInteger(value) || value < 1 || value > 8)
        throw new Error('--max-depth must be 1-8.')
      output.maxDepth = value
      index += 1
    } else if (arg === '--json') output.json = true
    else if (arg === '--ndjson') output.ndjson = true
    else if (arg === '--list-tools') output.listTools = true
    else if (arg === '--no-lint') output.noLint = true
    else if (arg === '--help' || arg === '-h') output.help = true
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`)
    else
      throw new Error(
        'Positional payloads are disabled to avoid shell-history and process-list leaks. Use stdin or --file.',
      )
  }
  if (output.json && output.ndjson) throw new Error('Choose --json or --ndjson, not both.')
  return output
}

async function readStdin(): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  for await (const chunk of stdin)
    chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk)
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return output
}

function safeValue(value: unknown): unknown {
  if (value instanceof Uint8Array)
    return {
      type: 'bytes',
      hex: [...value].map((byte) => byte.toString(16).padStart(2, '0')).join(''),
    }
  return value
}

function flatten(node: ChainNode): ChainNode[] {
  return [node, ...node.children.flatMap(flatten)]
}

function humanNode(node: ChainNode, noLint: boolean): string {
  const indent = '  '.repeat(node.depth)
  const title = node.selected
    ? `${node.selected.label} ${Math.round(node.selected.confidence * 100)}%`
    : node.status
  const lines = [`${indent}${node.depth === 0 ? '●' : '↳'} ${title} (${node.inputSize} bytes)`]
  if (node.selected) {
    lines.push(`${indent}  ${node.selected.summary}`)
    if (!noLint)
      for (const warning of node.selected.warnings)
        lines.push(
          `${indent}  ${warning.severity.toUpperCase()} ${warning.ruleId}: ${warning.message}`,
        )
    lines.push(
      `${indent}  ${JSON.stringify(safeValue(node.selected.value), null, 2).split('\n').join(`\n${indent}  `)}`,
    )
  }
  if (node.limitReason) lines.push(`${indent}  LIMIT: ${node.limitReason}`)
  return lines.join('\n')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    stdout.write(`${usage}\n`)
    return
  }
  if (options.listTools) {
    stdout.write(
      `${operations.map((operation) => `${operation.id}\t${operation.name}`).join('\n')}\n`,
    )
    return
  }
  const bytes = options.file ? new Uint8Array(await readFile(options.file)) : await readStdin()
  if (!bytes.length) throw new Error('No input received. Pipe data to stdin or use --file.')
  const asText = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  const input: DecodeInput = asText.includes('\ufffd') ? bytes : asText.replace(/\n$/, '')

  if (options.format !== 'auto') {
    if (!operationById.has(options.format))
      throw new Error(`Unknown operation: ${options.format}. Use --list-tools.`)
    const result = await executeOperation(options.format, input, options.operationOptions)
    if (options.json || options.ndjson)
      stdout.write(
        `${JSON.stringify({ operation: options.format, ...result, output: safeValue(result.output) })}\n`,
      )
    else
      stdout.write(
        `${typeof result.output === 'string' ? result.output : JSON.stringify(safeValue(result.output), null, 2)}\n`,
      )
    return
  }

  const result = await decode(input, {
    ...(options.maxDepth === undefined ? {} : { limits: { maxDepth: options.maxDepth } }),
  })
  if (options.json)
    stdout.write(`${JSON.stringify(result, (_key, value) => safeValue(value), 2)}\n`)
  else if (options.ndjson)
    for (const node of flatten(result.root))
      stdout.write(`${JSON.stringify(node, (_key, value) => safeValue(value))}\n`)
  else
    stdout.write(
      `${flatten(result.root)
        .map((node) => humanNode(node, options.noLint))
        .join('\n')}\n`,
    )

  if (result.root.status === 'unsupported') process.exitCode = 3
  else if (result.root.status === 'ambiguous') process.exitCode = 2
  else if (result.root.status === 'limit') process.exitCode = 4
}

main().catch((error: unknown) => {
  stderr.write(`decoding: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
