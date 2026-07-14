import type { ChainNode, DecodeInput, DecodeResult, Detection } from '@decoding/engine'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'

export type DecoderWorkbenchProps = {
  decodeInput: (input: DecodeInput) => Promise<DecodeResult>
  externalInput?: { id: number; value: string } | undefined
}

function outputText(value: unknown): string {
  if (value instanceof Uint8Array)
    return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join(' ')
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[depth limited]'
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redactValue(item, depth + 1))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 200)
        .map(([key, item]) => [
          key,
          /secret|token|password|authorization|cookie|private|signature|key/i.test(key)
            ? '[redacted]'
            : redactValue(item, depth + 1),
        ]),
    )
  }
  if (value === null) return null
  return `[${typeof value}]`
}

function EvidenceList({ detection }: { detection: Detection }) {
  return (
    <div class="evidence-stack">
      <div class="confidence-line">
        <span class="confidence-badge">{Math.round(detection.confidence * 100)}%</span>
        <strong>{detection.label}</strong>
      </div>
      <p>{detection.summary}</p>
      <ul class="evidence-list">
        {detection.evidence.map((evidence) => (
          <li key={evidence.code}>{evidence.message}</li>
        ))}
      </ul>
      {detection.warnings.map((warning) => (
        <div class={`notice ${warning.severity}`} role="status" key={warning.ruleId}>
          <strong>{warning.ruleId}</strong>
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  )
}

function ChainView({ node }: { node: ChainNode }) {
  return (
    <div class="chain-node" style={{ '--depth': node.depth }}>
      <div class="chain-node-heading">
        <span>{node.selected?.label ?? node.status}</span>
        <small>{node.inputSize.toLocaleString()} bytes</small>
      </div>
      {node.selected ? <EvidenceList detection={node.selected} /> : null}
      {node.limitReason ? <div class="notice warning">Stopped: {node.limitReason}</div> : null}
      {node.children.map((child) => (
        <ChainView node={child} key={child.id} />
      ))}
    </div>
  )
}

export function DecoderWorkbench({ decodeInput, externalInput }: DecoderWorkbenchProps) {
  const [source, setSource] = useState('')
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [selected, setSelected] = useState<Detection | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showCandidates, setShowCandidates] = useState(false)
  const requestId = useRef(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const run = useCallback(
    async (input: DecodeInput) => {
      const current = ++requestId.current
      setStatus('processing')
      setMessage('Checking formats locally…')
      try {
        const next = await decodeInput(input)
        if (current !== requestId.current) return
        setResult(next)
        setSelected(next.root.selected ?? next.root.candidates[0] ?? null)
        setShowCandidates(next.root.status === 'ambiguous')
        setStatus('done')
        setMessage(next.root.status === 'unsupported' ? "We couldn't identify this yet." : '')
      } catch (error) {
        if (current !== requestId.current) return
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Unable to decode this input.')
      }
    },
    [decodeInput],
  )

  const handleSource = (value: string) => {
    setSource(value)
    if (!value) {
      requestId.current += 1
      setResult(null)
      setSelected(null)
      setStatus('idle')
      setMessage('')
      setShowCandidates(false)
      return
    }
    void run(value)
  }

  const handleFile = async (file?: File) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setStatus('error')
      setMessage('File exceeds the 10 MiB local safety limit.')
      return
    }
    setSource(`[Local file: ${file.name}, ${file.size.toLocaleString()} bytes]`)
    await run(new Uint8Array(await file.arrayBuffer()))
  }

  const copySelected = async () => {
    if (!selected) return
    await navigator.clipboard.writeText(outputText(selected.value))
    setMessage('Selected result copied.')
  }

  const exportRedacted = () => {
    if (!selected) return
    const payload = {
      version: 1,
      detector: selected.detector,
      label: selected.label,
      confidence: selected.confidence,
      evidence: selected.evidence.map(({ code, message }) => ({ code, message })),
      warnings: selected.warnings.map(({ ruleId, severity, message: warningMessage }) => ({
        ruleId,
        severity,
        message: warningMessage,
      })),
      structure: redactValue(selected.value),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'decoding-redacted-result.json'
    link.click()
    URL.revokeObjectURL(link.href)
    setMessage('Redacted structure exported. Scalar values were removed.')
  }

  useEffect(() => {
    if (externalInput?.value) handleSource(externalInput.value)
  }, [externalInput?.id])

  useEffect(() => {
    const focusInput = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    addEventListener('keydown', focusInput)
    return () => removeEventListener('keydown', focusInput)
  }, [])

  return (
    <section class="decoder-shell" aria-label="Universal decoder">
      <div class="privacy-line">
        <span class="privacy-dot" aria-hidden="true" />
        Input stays on this device. No account, upload, or AI.
      </div>
      <div
        class="paste-surface"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          void handleFile(event.dataTransfer?.files[0])
        }}
      >
        <label for="decoder-input">Paste text or drop a file</label>
        <textarea
          id="decoder-input"
          ref={inputRef}
          value={source}
          onInput={(event) => handleSource(event.currentTarget.value)}
          placeholder="JWT, Base64, Hex, timestamps, compressed data…"
          spellcheck={false}
          autocomplete="off"
          autocapitalize="off"
          autofocus
        />
        <div class="input-actions">
          <label class="button secondary">
            Open file
            <input
              class="visually-hidden"
              type="file"
              onChange={(event) => void handleFile(event.currentTarget.files?.[0])}
            />
          </label>
          <button
            type="button"
            class="button ghost"
            onClick={() => handleSource('')}
            disabled={!source}
          >
            Clear
          </button>
          <span>Max 10 MiB</span>
        </div>
      </div>

      {status === 'processing' ? (
        <div class="processing" aria-live="polite">
          {message}
        </div>
      ) : null}
      {message && status !== 'processing' ? (
        <div class={`notice ${status === 'error' ? 'danger' : 'info'}`} aria-live="polite">
          {message}
        </div>
      ) : null}

      {result ? (
        <div class="result-grid">
          <div class="result-chain">
            <div class="panel-heading">
              <div>
                <span class="eyebrow">Decode chain</span>
                <h2>{result.root.status === 'ambiguous' ? 'Possible formats' : 'Local result'}</h2>
              </div>
              <small>{result.elapsedMs.toFixed(1)} ms</small>
            </div>
            {showCandidates ? (
              <div class="candidate-list" role="listbox" aria-label="Possible formats">
                {result.root.candidates.map((candidate) => (
                  <button
                    type="button"
                    class={
                      selected?.detector === candidate.detector ? 'candidate selected' : 'candidate'
                    }
                    role="option"
                    aria-selected={selected?.detector === candidate.detector}
                    onClick={() => setSelected(candidate)}
                    key={candidate.detector}
                  >
                    <span>{candidate.label}</span>
                    <strong>{Math.round(candidate.confidence * 100)}%</strong>
                  </button>
                ))}
              </div>
            ) : (
              <ChainView node={result.root} />
            )}
          </div>
          <aside class="inspector-panel">
            <div class="panel-heading">
              <div>
                <span class="eyebrow">Inspector</span>
                <h2>{selected?.label ?? 'No candidate'}</h2>
              </div>
              <div class="inline-actions">
                <button
                  class="button small"
                  type="button"
                  onClick={() => void copySelected()}
                  disabled={!selected}
                >
                  Copy
                </button>
                <button
                  class="button small secondary"
                  type="button"
                  onClick={exportRedacted}
                  disabled={!selected}
                >
                  Export redacted
                </button>
              </div>
            </div>
            {selected ? (
              <>
                {result.root.status === 'ambiguous' ? <EvidenceList detection={selected} /> : null}
                <pre class="output-view">
                  <code>{outputText(selected.value)}</code>
                </pre>
              </>
            ) : (
              <p>Try a supported format or choose a tool from the catalog.</p>
            )}
            {result.root.candidates.length ? (
              <button
                class="button ghost small"
                type="button"
                onClick={() => {
                  setShowCandidates(true)
                  setMessage('Choose another candidate. No report or payload is sent.')
                }}
              >
                Wrong format?
              </button>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  )
}
