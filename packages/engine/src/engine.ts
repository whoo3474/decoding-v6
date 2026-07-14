import { defaultDetectors } from './detectors'
import type {
  ChainNode,
  DecodeInput,
  DecodeLimits,
  DecodeResult,
  Detection,
  Detector,
} from './types'
import { inputSize, stableDigest } from './utils'

export const DEFAULT_LIMITS: DecodeLimits = {
  maxInputBytes: 10 * 1024 * 1024,
  maxExpandedBytes: 32 * 1024 * 1024,
  maxCompressionRatio: 100,
  maxDepth: 8,
  maxNodes: 64,
  maxCpuMs: 2000,
}

export type DecodeOptions = {
  detectors?: Detector[]
  limits?: Partial<DecodeLimits>
  signal?: AbortSignal
  now?: Date
  autoConfidence?: number
  autoMargin?: number
}

function sortCandidates(candidates: Detection[]): Detection[] {
  return candidates.sort(
    (left, right) =>
      right.confidence - left.confidence || left.detector.localeCompare(right.detector),
  )
}

function selectedCandidate(
  candidates: Detection[],
  confidence: number,
  margin: number,
): Detection | undefined {
  const first = candidates[0]
  if (!first || first.confidence < confidence) return undefined
  const second = candidates[1]
  if (second && first.confidence - second.confidence < margin) return undefined
  return first
}

export async function decode(
  input: DecodeInput,
  options: DecodeOptions = {},
): Promise<DecodeResult> {
  const started = performance.now()
  const limits = { ...DEFAULT_LIMITS, ...options.limits }
  const detectors = options.detectors ?? defaultDetectors
  const now = options.now ?? new Date()
  const seen = new Set<string>()
  let nodes = 0

  async function visit(value: DecodeInput, depth: number): Promise<ChainNode> {
    nodes += 1
    const base = {
      id: `${depth}-${nodes}`,
      depth,
      inputKind: typeof value === 'string' ? ('text' as const) : ('bytes' as const),
      inputSize: inputSize(value),
      candidates: [] as Detection[],
      children: [] as ChainNode[],
    }
    if (base.inputSize > limits.maxInputBytes) {
      return { ...base, status: 'limit', limitReason: 'input-size' }
    }
    if (depth >= limits.maxDepth) return { ...base, status: 'limit', limitReason: 'depth' }
    if (nodes > limits.maxNodes) return { ...base, status: 'limit', limitReason: 'nodes' }
    if (performance.now() - started > limits.maxCpuMs)
      return { ...base, status: 'limit', limitReason: 'cpu' }
    if (options.signal?.aborted) return { ...base, status: 'limit', limitReason: 'cancelled' }

    const digest = stableDigest(value)
    if (seen.has(digest)) return { ...base, status: 'limit', limitReason: 'cycle' }
    seen.add(digest)

    const context = { now, limits, ...(options.signal ? { signal: options.signal } : {}) }
    const detections = await Promise.all(
      detectors.map((detector) => detector.detect(value, context)),
    )
    const candidates = sortCandidates(detections.filter((item): item is Detection => item !== null))
    if (!candidates.length) return { ...base, candidates, status: 'unsupported' }
    const selected = selectedCandidate(
      candidates,
      options.autoConfidence ?? 0.85,
      options.autoMargin ?? 0.15,
    )
    if (!selected) return { ...base, candidates, status: 'ambiguous' }
    const node: ChainNode = { ...base, candidates, selected, status: 'confident' }
    if (selected.decoded !== undefined && stableDigest(selected.decoded) !== digest) {
      node.children.push(await visit(selected.decoded, depth + 1))
    }
    return node
  }

  const root = await visit(input, 0)
  return { root, nodes, elapsedMs: performance.now() - started, limits }
}

export async function detect(
  input: DecodeInput,
  options: DecodeOptions = {},
): Promise<Detection[]> {
  const limits = { ...DEFAULT_LIMITS, ...options.limits }
  const now = options.now ?? new Date()
  const detectors = options.detectors ?? defaultDetectors
  const context = { now, limits, ...(options.signal ? { signal: options.signal } : {}) }
  const results = await Promise.all(detectors.map((detector) => detector.detect(input, context)))
  return sortCandidates(results.filter((item): item is Detection => item !== null))
}
