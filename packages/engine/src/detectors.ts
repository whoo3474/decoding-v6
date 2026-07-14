import { gunzipSync, inflateSync, unzlibSync } from 'fflate'
import type { DecodeInput, Detection, Detector, LintWarning } from './types'
import {
  clampConfidence,
  decodeBase64,
  inputBytes,
  inputText,
  isProbablyUtf8,
  printableRatio,
} from './utils'

function result(
  detector: string,
  label: string,
  confidence: number,
  summary: string,
  value: unknown,
  evidence: Detection['evidence'],
  options: Partial<Pick<Detection, 'decoded' | 'warnings' | 'metadata'>> = {},
): Detection {
  return {
    detector,
    label,
    confidence: clampConfidence(confidence),
    summary,
    value,
    evidence,
    warnings: options.warnings ?? [],
    ...(options.decoded === undefined ? {} : { decoded: options.decoded }),
    ...(options.metadata === undefined ? {} : { metadata: options.metadata }),
  }
}

function jwtWarnings(payload: Record<string, unknown>, now: Date): LintWarning[] {
  const warnings: LintWarning[] = [
    {
      ruleId: 'JWT-SIGNATURE-UNVERIFIED',
      severity: 'info',
      message: 'The signature is decoded but not verified without a trusted key.',
      specUrl: 'https://www.rfc-editor.org/rfc/rfc7519',
    },
  ]
  const nowSeconds = Math.floor(now.getTime() / 1000)
  if (typeof payload.exp === 'number' && payload.exp < nowSeconds) {
    warnings.push({
      ruleId: 'JWT-EXPIRED',
      severity: 'danger',
      message: 'The exp claim is in the past.',
    })
  }
  if (typeof payload.nbf === 'number' && payload.nbf > nowSeconds) {
    warnings.push({
      ruleId: 'JWT-NOT-ACTIVE',
      severity: 'warning',
      message: 'The nbf claim is in the future.',
    })
  }
  return warnings
}

const jwtDetector: Detector = {
  id: 'jwt',
  detect(input, context) {
    const text = inputText(input).trim()
    const parts = text.split('.')
    if (parts.length !== 3 || parts.some((part) => !part)) return null
    const headerBytes = decodeBase64(parts[0] ?? '')
    const payloadBytes = decodeBase64(parts[1] ?? '')
    if (!headerBytes || !payloadBytes) return null
    try {
      const header = JSON.parse(inputText(headerBytes)) as Record<string, unknown>
      const payload = JSON.parse(inputText(payloadBytes)) as Record<string, unknown>
      if (!header || typeof header !== 'object' || !payload || typeof payload !== 'object')
        return null
      const hasAlgorithm = typeof header.alg === 'string'
      return result(
        'jwt',
        'JWT / JWS compact',
        hasAlgorithm ? 0.995 : 0.93,
        `${String(header.alg ?? 'unknown')} token with ${Object.keys(payload).length} payload claims`,
        { header, payload, signature: parts[2] },
        [
          { code: 'three-segments', message: 'Three Base64URL segments', weight: 0.55 },
          {
            code: 'json-header',
            message: 'Header and payload are valid JSON objects',
            weight: 0.4,
          },
          ...(hasAlgorithm
            ? [{ code: 'alg', message: `Algorithm header: ${String(header.alg)}`, weight: 0.05 }]
            : []),
        ],
        { warnings: jwtWarnings(payload, context.now), metadata: { algorithm: header.alg } },
      )
    } catch {
      return null
    }
  },
}

const jsonDetector: Detector = {
  id: 'json',
  detect(input) {
    const text = inputText(input).trim()
    if (!text || !/^[{["\dtnf-]/.test(text)) return null
    try {
      const value = JSON.parse(text) as unknown
      const structured = typeof value === 'object' && value !== null
      const escapedString = typeof value === 'string'
      if (!structured && !escapedString) return null
      return result(
        'json',
        escapedString ? 'JSON string escapes' : 'JSON',
        structured ? 0.985 : 0.94,
        structured
          ? `${Array.isArray(value) ? 'Array' : 'Object'} with ${Object.keys(value).length} top-level entries`
          : 'A JSON-escaped string',
        value,
        [{ code: 'json-parse', message: 'Valid JSON grammar', weight: structured ? 0.98 : 0.9 }],
        escapedString ? { decoded: value } : {},
      )
    } catch {
      return null
    }
  },
}

const base64Detector: Detector = {
  id: 'base64',
  detect(input) {
    const text = inputText(input).trim().replace(/\s+/g, '')
    if (text.length < 4 || text.length % 4 === 1 || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(text))
      return null
    const bytes = decodeBase64(text)
    if (!bytes?.length) return null
    const ratio = printableRatio(bytes)
    const explicitUrl = /[-_]/.test(text)
    const padded = /=+$/.test(text)
    const confidence = Math.min(
      0.96,
      0.62 + (ratio > 0.85 ? 0.2 : 0.05) + (padded ? 0.1 : 0) + (explicitUrl ? 0.04 : 0),
    )
    const decoded = isProbablyUtf8(bytes) ? inputText(bytes) : bytes
    return result(
      'base64',
      explicitUrl ? 'Base64URL' : 'Base64',
      confidence,
      `${bytes.byteLength} decoded bytes${ratio > 0.85 ? ', mostly text' : ''}`,
      decoded,
      [
        { code: 'alphabet', message: 'Uses a Base64-compatible alphabet', weight: 0.45 },
        { code: 'decode', message: 'Decodes without invalid bytes', weight: 0.3 },
        { code: 'printable', message: `${Math.round(ratio * 100)}% printable output`, weight: 0.2 },
      ],
      { decoded },
    )
  },
}

const hexDetector: Detector = {
  id: 'hex',
  detect(input) {
    const text = inputText(input)
      .trim()
      .replace(/^0x/i, '')
      .replace(/[\s:-]/g, '')
    if (text.length < 4 || text.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(text)) return null
    const bytes = Uint8Array.from(text.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16))
    const ratio = printableRatio(bytes)
    const hasPrefix = /^0x/i.test(inputText(input).trim())
    const confidence = Math.min(0.94, 0.68 + (hasPrefix ? 0.16 : 0) + (ratio > 0.75 ? 0.08 : 0))
    const decoded = isProbablyUtf8(bytes) ? inputText(bytes) : bytes
    return result(
      'hex',
      'Hexadecimal bytes',
      confidence,
      `${bytes.byteLength} bytes`,
      decoded,
      [
        { code: 'hex-alphabet', message: 'Even-length hexadecimal input', weight: 0.7 },
        {
          code: 'printable',
          message: `${Math.round(ratio * 100)}% printable output`,
          weight: 0.15,
        },
      ],
      { decoded },
    )
  },
}

const urlDetector: Detector = {
  id: 'url',
  detect(input) {
    const text = inputText(input).trim()
    const hasEscapes = /%[0-9a-f]{2}/i.test(text)
    const looksPaddedBase64 = text.length % 4 === 0 && /^[A-Za-z0-9+/_-]+={1,2}$/.test(text)
    const hasQuery =
      !looksPaddedBase64 &&
      (/&/.test(text)
        ? /^[^\s?#]+=[^\s&]*(?:&[^\s=]+=[^\s&]*)+$/.test(text)
        : /^[A-Za-z_][\w.-]{0,64}=.+$/.test(text))
    let parsedUrl: URL | null = null
    try {
      parsedUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(text) ? new URL(text) : null
    } catch {
      parsedUrl = null
    }
    if (!hasEscapes && !hasQuery && !parsedUrl) return null
    try {
      const decoded = hasEscapes ? decodeURIComponent(text.replace(/\+/g, ' ')) : text
      const query = parsedUrl
        ? Object.fromEntries(parsedUrl.searchParams)
        : hasQuery
          ? Object.fromEntries(new URLSearchParams(text))
          : undefined
      return result(
        'url',
        parsedUrl ? 'URL' : hasQuery ? 'Query string' : 'URL-encoded text',
        parsedUrl ? 0.98 : hasQuery ? 0.92 : 0.9,
        parsedUrl
          ? `${parsedUrl.protocol}//${parsedUrl.host}`
          : hasQuery
            ? 'Key/value query data'
            : 'Percent-encoded text',
        parsedUrl
          ? {
              href: parsedUrl.href,
              protocol: parsedUrl.protocol,
              host: parsedUrl.host,
              pathname: parsedUrl.pathname,
              query,
            }
          : (query ?? decoded),
        [{ code: 'url-syntax', message: 'Valid URL or percent/query syntax', weight: 0.9 }],
        hasEscapes ? { decoded } : {},
      )
    } catch {
      return null
    }
  },
}

function epochDate(raw: string): { unit: string; milliseconds: number } | null {
  if (!/^-?\d{9,19}$/.test(raw)) return null
  const value = BigInt(raw)
  const absolute = value < 0n ? -value : value
  let unit: string
  let milliseconds: bigint
  if (absolute < 100_000_000_000n) {
    unit = 'seconds'
    milliseconds = value * 1000n
  } else if (absolute < 100_000_000_000_000n) {
    unit = 'milliseconds'
    milliseconds = value
  } else if (absolute < 100_000_000_000_000_000n) {
    unit = 'microseconds'
    milliseconds = value / 1000n
  } else {
    unit = 'nanoseconds'
    milliseconds = value / 1_000_000n
  }
  const numeric = Number(milliseconds)
  if (!Number.isFinite(numeric) || numeric < -8.64e15 || numeric > 8.64e15) return null
  return { unit, milliseconds: numeric }
}

const epochDetector: Detector = {
  id: 'epoch',
  detect(input) {
    const text = inputText(input).trim()
    const parsed = epochDate(text)
    if (!parsed) return null
    const date = new Date(parsed.milliseconds)
    const year = date.getUTCFullYear()
    const plausible = year >= 2000 && year <= 2200
    return result(
      'epoch',
      `Unix time (${parsed.unit})`,
      plausible ? 0.93 : 0.78,
      date.toISOString(),
      { iso: date.toISOString(), unit: parsed.unit, milliseconds: parsed.milliseconds },
      [
        { code: 'integer-width', message: `Digit width matches ${parsed.unit}`, weight: 0.65 },
        {
          code: 'date-range',
          message: plausible
            ? 'Date is in a common operational range'
            : 'Date is outside the common range',
          weight: plausible ? 0.25 : 0.05,
        },
      ],
    )
  },
}

const crockford = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
function decodeUlidTime(value: string): number {
  let output = 0
  for (const char of value.slice(0, 10)) output = output * 32 + crockford.indexOf(char)
  return output
}

const uuidDetector: Detector = {
  id: 'uuid-ulid',
  detect(input) {
    const text = inputText(input).trim()
    const uuid =
      /^\{?([0-9a-f]{8})-([0-9a-f]{4})-([1-8][0-9a-f]{3})-([89ab][0-9a-f]{3})-([0-9a-f]{12})\}?$/i.exec(
        text,
      )
    if (uuid) {
      const version = Number(uuid[3]?.[0])
      const metadata: Record<string, unknown> = { version, variant: 'RFC 4122' }
      if (version === 7) {
        const milliseconds = Number.parseInt(`${uuid[1]}${uuid[2]}`, 16)
        metadata.timestamp = new Date(milliseconds).toISOString()
      }
      return result(
        'uuid-ulid',
        `UUID v${version}`,
        0.995,
        `RFC 4122 variant, version ${version}`,
        metadata,
        [{ code: 'uuid-layout', message: 'Canonical UUID layout and variant', weight: 0.95 }],
        { metadata },
      )
    }
    if (/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(text)) {
      const milliseconds = decodeUlidTime(text.toUpperCase())
      const metadata = { timestamp: new Date(milliseconds).toISOString(), sortable: true }
      return result(
        'uuid-ulid',
        'ULID',
        0.99,
        `Sortable identifier from ${metadata.timestamp}`,
        metadata,
        [{ code: 'ulid-layout', message: '26-character Crockford Base32 ULID', weight: 0.95 }],
        { metadata },
      )
    }
    return null
  },
}

const compressionDetector: Detector = {
  id: 'compression',
  detect(input, context) {
    const bytes = inputBytes(input)
    if (bytes.length < 3) return null
    const formats: Array<{
      label: string
      confidence: number
      test: boolean
      decode: () => Uint8Array
    }> = [
      {
        label: 'gzip',
        confidence: 0.999,
        test: bytes[0] === 0x1f && bytes[1] === 0x8b,
        decode: () => gunzipSync(bytes),
      },
      {
        label: 'zlib',
        confidence: 0.98,
        test: bytes[0] === 0x78 && [0x01, 0x5e, 0x9c, 0xda].includes(bytes[1] ?? -1),
        decode: () => unzlibSync(bytes),
      },
      { label: 'deflate', confidence: 0.72, test: false, decode: () => inflateSync(bytes) },
    ]
    for (const format of formats) {
      if (!format.test) continue
      try {
        const decoded = format.decode()
        const ratio = decoded.length / bytes.length
        if (
          decoded.length > context.limits.maxExpandedBytes ||
          ratio > context.limits.maxCompressionRatio
        ) {
          return result(
            'compression',
            format.label,
            format.confidence,
            `Expansion blocked at ${decoded.length} bytes (${ratio.toFixed(1)}:1)`,
            { compressedBytes: bytes.length, expandedBytes: decoded.length, ratio },
            [{ code: 'magic', message: `${format.label} signature`, weight: 0.98 }],
            {
              warnings: [
                {
                  ruleId: 'COMPRESSION-LIMIT',
                  severity: 'danger',
                  message: 'Expanded output exceeds the safe limit.',
                },
              ],
            },
          )
        }
        const output: DecodeInput = isProbablyUtf8(decoded) ? inputText(decoded) : decoded
        return result(
          'compression',
          format.label,
          format.confidence,
          `${bytes.length} → ${decoded.length} bytes`,
          output,
          [{ code: 'magic', message: `${format.label} signature and valid stream`, weight: 0.98 }],
          { decoded: output, metadata: { ratio } },
        )
      } catch {
        return null
      }
    }
    return null
  },
}

export const defaultDetectors: Detector[] = [
  jwtDetector,
  jsonDetector,
  compressionDetector,
  uuidDetector,
  epochDetector,
  urlDetector,
  hexDetector,
  base64Detector,
]
