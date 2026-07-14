import type {
  OperationDescriptor,
  OperationInput,
  OperationOptions,
  OperationResult,
} from '@decoding/operations'
import { useEffect, useMemo, useState } from 'preact/hooks'

export type ToolWorkbenchProps = {
  operation: OperationDescriptor
  execute: (
    id: string,
    input: OperationInput,
    options?: OperationOptions,
  ) => Promise<OperationResult>
}

const examples: Record<string, string> = {
  'json-format': '{"project":"decod.ing","local":true,"tools":47}',
  'jwt-debugger':
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJleGFtcGxlIiwiZXhwIjoyMDAwMDAwMDAwfQ.',
  'base64-string': 'Hello from decod.ing',
  'number-base': '255',
  'url-parser': 'https://example.invalid/api?q=decoder&safe=true',
  'unix-time': '1767225600',
  'regex-tester': 'one two 123 four 456',
  'text-diff': 'first line\nsecond line',
  'cron-parser': '*/15 * * * *',
  'color-converter': '#6D5EF7',
  'yaml-to-json': 'project: decod.ing\nlocal: true\ntools: 47',
  'csv-to-json': 'name,value\nlocal,true\ntools,47',
  'html-preview': '<main><h1>Safe preview</h1><p>Scripts and network are blocked.</p></main>',
  'markdown-preview': '# Local Markdown\n\n**Raw HTML is escaped.**',
  'curl-to-code': "curl 'https://example.invalid/api' -H 'Accept: application/json'",
  'json-to-code': '{"name":"decod.ing","local":true,"count":47}',
  'svg-to-css':
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="12" fill="#6D5EF7"/></svg>',
}

function defaultOptions(operation: OperationDescriptor): OperationOptions {
  const options: OperationOptions = {}
  if (operation.directions?.length) options.mode = operation.directions[0]
  if (operation.id === 'number-base') Object.assign(options, { from: 10, to: 16 })
  if (operation.id === 'regex-tester') Object.assign(options, { pattern: '\\d+', flags: 'g' })
  if (operation.id === 'text-diff') options.compareTo = 'first line\nchanged line'
  if (operation.id === 'uuid-ulid-generator') options.kind = 'uuid-v4'
  if (operation.id === 'hash-generator') options.algorithm = 'sha256'
  if (operation.id === 'curl-to-code') options.language = 'javascript'
  if (operation.id === 'json-to-code') options.language = 'typescript'
  if (operation.id === 'string-case') options.mode = 'camel'
  if (operation.id === 'qr-code') options.mode = 'generate'
  return options
}

function resultText(result: OperationResult | null): string {
  if (!result) return ''
  if (result.output instanceof Uint8Array)
    return [...result.output].map((byte) => byte.toString(16).padStart(2, '0')).join(' ')
  if (typeof result.output === 'string') return result.output
  return JSON.stringify(result.output, null, 2)
}

export function ToolWorkbench({ operation, execute }: ToolWorkbenchProps) {
  const [hydrated, setHydrated] = useState(false)
  const [source, setSource] = useState(examples[operation.id] ?? '')
  const [options, setOptions] = useState<OperationOptions>(() => defaultOptions(operation))
  const [result, setResult] = useState<OperationResult | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const output = useMemo(() => resultText(result), [result])

  useEffect(() => setHydrated(true), [])

  const run = async (input: OperationInput = source, override = options) => {
    setStatus('processing')
    setMessage('Running locally…')
    try {
      const next = await execute(operation.id, input, override)
      setResult(next)
      setStatus('done')
      setMessage(next.summary ?? '')
    } catch (error) {
      setResult(null)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Operation failed.')
    }
  }

  const handleFile = async (file?: File) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setStatus('error')
      setMessage('File exceeds the 10 MiB local limit.')
      return
    }
    if (operation.id === 'qr-code' && file.type.startsWith('image/')) {
      const bitmap = await createImageBitmap(file)
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const context = canvas.getContext('2d')
      context?.drawImage(bitmap, 0, 0)
      const pixels = context?.getImageData(0, 0, bitmap.width, bitmap.height)
      if (!pixels) throw new Error('Unable to read image pixels.')
      const nextOptions = { ...options, mode: 'read', width: bitmap.width, height: bitmap.height }
      setOptions(nextOptions)
      await run(new Uint8Array(pixels.data), nextOptions)
      return
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    if (operation.id === 'base64-image' || operation.id === 'x509-decoder') await run(bytes)
    else {
      const value = new TextDecoder().decode(bytes)
      setSource(value)
      await run(value)
    }
  }

  const setOption = (key: string, value: string | number | boolean) =>
    setOptions((current) => ({ ...current, [key]: value }))

  return (
    <section class="tool-workbench" data-hydrated={hydrated} aria-label={`${operation.name} tool`}>
      <div class="privacy-line">
        <span class="privacy-dot" aria-hidden="true" />
        This operation runs locally. Input is never uploaded.
      </div>
      <div class="tool-options">
        {operation.directions?.length ? (
          <label>
            Direction
            <select
              value={String(options.mode ?? '')}
              onChange={(event) => setOption('mode', event.currentTarget.value)}
            >
              {operation.directions.map((direction) => (
                <option value={direction}>{direction}</option>
              ))}
            </select>
          </label>
        ) : null}
        {operation.id === 'number-base' ? (
          <>
            <label>
              From base
              <input
                type="number"
                min="2"
                max="36"
                value={Number(options.from)}
                onInput={(event) => setOption('from', event.currentTarget.valueAsNumber)}
              />
            </label>
            <label>
              To base
              <input
                type="number"
                min="2"
                max="36"
                value={Number(options.to)}
                onInput={(event) => setOption('to', event.currentTarget.valueAsNumber)}
              />
            </label>
          </>
        ) : null}
        {operation.id === 'regex-tester' ? (
          <>
            <label>
              Pattern
              <input
                value={String(options.pattern)}
                onInput={(event) => setOption('pattern', event.currentTarget.value)}
              />
            </label>
            <label>
              Flags
              <input
                value={String(options.flags)}
                onInput={(event) => setOption('flags', event.currentTarget.value)}
              />
            </label>
          </>
        ) : null}
        {operation.id === 'text-diff' ? (
          <label class="wide">
            Compare with
            <textarea
              value={String(options.compareTo)}
              onInput={(event) => setOption('compareTo', event.currentTarget.value)}
            />
          </label>
        ) : null}
        {operation.id === 'uuid-ulid-generator' ? (
          <label>
            Kind
            <select
              value={String(options.kind)}
              onChange={(event) => setOption('kind', event.currentTarget.value)}
            >
              <option value="uuid-v4">UUID v4</option>
              <option value="uuid-v7">UUID v7</option>
              <option value="ulid">ULID</option>
            </select>
          </label>
        ) : null}
        {operation.id === 'hash-generator' ? (
          <label>
            Algorithm
            <select
              value={String(options.algorithm)}
              onChange={(event) => setOption('algorithm', event.currentTarget.value)}
            >
              <option value="sha256">SHA-256</option>
              <option value="sha512">SHA-512</option>
              <option value="sha1">SHA-1</option>
              <option value="md5">MD5</option>
              <option value="keccak-256">Keccak-256</option>
            </select>
          </label>
        ) : null}
        {operation.id === 'curl-to-code' ? (
          <label>
            Language
            <select
              value={String(options.language)}
              onChange={(event) => setOption('language', event.currentTarget.value)}
            >
              {[
                'javascript',
                'node',
                'python',
                'go',
                'rust',
                'java',
                'kotlin',
                'swift',
                'csharp',
                'php',
                'ruby',
                'dart',
                'r',
                'c',
                'httpie',
              ].map((language) => (
                <option value={language}>{language}</option>
              ))}
            </select>
          </label>
        ) : null}
        {operation.id === 'json-to-code' ? (
          <label>
            Language
            <select
              value={String(options.language)}
              onChange={(event) => setOption('language', event.currentTarget.value)}
            >
              {['typescript', 'python', 'go', 'java', 'kotlin', 'swift', 'csharp', 'dart'].map(
                (language) => (
                  <option value={language}>{language}</option>
                ),
              )}
            </select>
          </label>
        ) : null}
        {operation.id === 'string-case' ? (
          <label>
            Case
            <select
              value={String(options.mode)}
              onChange={(event) => setOption('mode', event.currentTarget.value)}
            >
              {[
                'camel',
                'pascal',
                'snake',
                'constant',
                'kebab',
                'slug',
                'title',
                'sentence',
                'upper',
                'lower',
              ].map((mode) => (
                <option value={mode}>{mode}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div class="operation-grid">
        <div class="operation-pane">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">Input</span>
              <h2>{operation.name}</h2>
            </div>
            <label class="button secondary small">
              File
              <input
                class="visually-hidden"
                type="file"
                onChange={(event) => void handleFile(event.currentTarget.files?.[0])}
              />
            </label>
          </div>
          <textarea
            value={source}
            onInput={(event) => setSource(event.currentTarget.value)}
            spellcheck={false}
            placeholder="Enter input…"
          />
          <div class="input-actions">
            <button
              class="button primary"
              type="button"
              onClick={() => void run()}
              disabled={status === 'processing'}
            >
              {status === 'processing' ? 'Running…' : 'Run locally'}
            </button>
            <button class="button ghost" type="button" onClick={() => setSource('')}>
              Clear
            </button>
          </div>
        </div>
        <div class="operation-pane output-pane">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">Output</span>
              <h2>{result?.kind ?? 'Ready'}</h2>
            </div>
            <button
              class="button small"
              type="button"
              disabled={!result}
              onClick={() => void navigator.clipboard.writeText(output)}
            >
              Copy
            </button>
          </div>
          {result?.kind === 'preview' ? (
            <iframe
              class="safe-preview"
              sandbox=""
              srcdoc={String(result.output)}
              title="Sandboxed local preview"
            />
          ) : result?.kind === 'image' ? (
            <img class="generated-image" src={String(result.output)} alt="Generated QR code" />
          ) : (
            <pre class="output-view">
              <code>{output || 'Run the tool to see local output.'}</code>
            </pre>
          )}
          {result ? (
            <button class="button ghost small" type="button" onClick={() => setSource(output)}>
              Use as input
            </button>
          ) : null}
        </div>
      </div>
      {message ? (
        <div class={`notice ${status === 'error' ? 'danger' : 'info'}`} aria-live="polite">
          {message}
        </div>
      ) : null}
      {result?.warnings?.map((warning) => (
        <div class="notice warning">{warning}</div>
      ))}
    </section>
  )
}
