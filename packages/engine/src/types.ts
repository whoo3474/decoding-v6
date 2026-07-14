export type DecodeInput = string | Uint8Array

export type Evidence = {
  code: string
  message: string
  weight: number
}

export type LintWarning = {
  ruleId: string
  severity: 'info' | 'warning' | 'danger'
  message: string
  specUrl?: string
}

export type Detection = {
  detector: string
  label: string
  confidence: number
  evidence: Evidence[]
  summary: string
  value: unknown
  decoded?: DecodeInput
  warnings: LintWarning[]
  metadata?: Record<string, unknown>
}

export type DetectorContext = {
  signal?: AbortSignal
  now: Date
  limits: DecodeLimits
}

export type Detector = {
  id: string
  detect(input: DecodeInput, context: DetectorContext): Detection | null | Promise<Detection | null>
}

export type DecodeLimits = {
  maxInputBytes: number
  maxExpandedBytes: number
  maxCompressionRatio: number
  maxDepth: number
  maxNodes: number
  maxCpuMs: number
}

export type ChainNode = {
  id: string
  depth: number
  inputKind: 'text' | 'bytes'
  inputSize: number
  candidates: Detection[]
  selected?: Detection
  children: ChainNode[]
  status: 'confident' | 'ambiguous' | 'unsupported' | 'limit'
  limitReason?: string
}

export type DecodeResult = {
  root: ChainNode
  nodes: number
  elapsedMs: number
  limits: DecodeLimits
}
