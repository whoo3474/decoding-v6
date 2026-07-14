import { detect, inputBytes } from '@decoding/engine'
import cronstrue from 'cronstrue'
import { diffLines } from 'diff'
import { escapeHtml, optionString, structuredResult, text, textResult } from './shared'
import type { OperationRunner } from './types'

function epochToDate(source: string): { iso: string; unit: string; milliseconds: number } {
  const normalized = source.trim().replace(/[,_\s]/g, '')
  if (!/^-?\d{9,19}$/.test(normalized)) throw new Error('Expected a 9-19 digit Unix timestamp.')
  const raw = BigInt(normalized)
  const absolute = raw < 0n ? -raw : raw
  let unit: string
  let milliseconds: bigint
  if (absolute < 100_000_000_000n) {
    unit = 'seconds'
    milliseconds = raw * 1000n
  } else if (absolute < 100_000_000_000_000n) {
    unit = 'milliseconds'
    milliseconds = raw
  } else if (absolute < 100_000_000_000_000_000n) {
    unit = 'microseconds'
    milliseconds = raw / 1000n
  } else {
    unit = 'nanoseconds'
    milliseconds = raw / 1_000_000n
  }
  const numeric = Number(milliseconds)
  const date = new Date(numeric)
  if (!Number.isFinite(numeric) || Number.isNaN(date.getTime()))
    throw new Error('Timestamp is outside the supported date range.')
  return { iso: date.toISOString(), unit, milliseconds: numeric }
}

function safeMarkdown(source: string): string {
  const escaped = escapeHtml(source)
  const blocks = escaped.split(/\n{2,}/).map((block) => {
    if (/^#{1,6}\s/.test(block)) {
      const match = /^(#{1,6})\s+([\s\S]*)/.exec(block)
      const level = match?.[1]?.length ?? 2
      return `<h${level}>${match?.[2] ?? ''}</h${level}>`
    }
    if (/^```/.test(block))
      return `<pre><code>${block.replace(/^```\w*\n?/, '').replace(/```$/, '')}</code></pre>`
    if (block.split('\n').every((line) => /^[-*]\s+/.test(line))) {
      return `<ul>${block
        .split('\n')
        .map((line) => `<li>${line.replace(/^[-*]\s+/, '')}</li>`)
        .join('')}</ul>`
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`
  })
  return blocks
    .join('\n')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(
      /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" rel="noopener noreferrer">$1</a>',
    )
}

function parseColor(source: string): Record<string, unknown> {
  const value = source.trim().toLowerCase()
  let red: number
  let green: number
  let blue: number
  let alpha = 1
  const hex = /^#?([0-9a-f]{3,8})$/i.exec(value)
  const rgb =
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d*(?:\.\d+)?))?\s*\)$/.exec(
      value,
    )
  if (hex) {
    let digits = hex[1] ?? ''
    if (digits.length === 3 || digits.length === 4)
      digits = [...digits].map((char) => `${char}${char}`).join('')
    red = Number.parseInt(digits.slice(0, 2), 16)
    green = Number.parseInt(digits.slice(2, 4), 16)
    blue = Number.parseInt(digits.slice(4, 6), 16)
    if (digits.length === 8) alpha = Number.parseInt(digits.slice(6, 8), 16) / 255
  } else if (rgb) {
    red = Number(rgb[1])
    green = Number(rgb[2])
    blue = Number(rgb[3])
    if (rgb[4]) alpha = Number(rgb[4])
  } else throw new Error('Use #RGB, #RRGGBB, #RRGGBBAA, rgb(), or rgba().')
  if (
    [red, green, blue].some((component) => component < 0 || component > 255) ||
    alpha < 0 ||
    alpha > 1
  )
    throw new Error('Color components are outside their valid range.')
  const toHex = (component: number) => Math.round(component).toString(16).padStart(2, '0')
  const r = red / 255
  const g = green / 255
  const b = blue / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  let hue = 0
  let saturation = 0
  if (max !== min) {
    const delta = max - min
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    hue =
      max === r
        ? (g - b) / delta + (g < b ? 6 : 0)
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4
    hue /= 6
  }
  return {
    hex: `#${toHex(red)}${toHex(green)}${toHex(blue)}${alpha < 1 ? toHex(alpha * 255) : ''}`.toUpperCase(),
    rgb: { red, green, blue, alpha },
    hsl: {
      hue: Math.round(hue * 360),
      saturation: Math.round(saturation * 100),
      lightness: Math.round(lightness * 100),
      alpha,
    },
  }
}

export const runInspect: OperationRunner = async (id, input, options) => {
  const source = text(input)
  switch (id) {
    case 'unix-time': {
      const converted = epochToDate(source)
      const date = new Date(converted.milliseconds)
      return structuredResult({
        ...converted,
        utc: date.toUTCString(),
        local: date.toLocaleString(),
        relativeSeconds: Math.round((converted.milliseconds - Date.now()) / 1000),
      })
    }
    case 'jwt-debugger': {
      const candidates = await detect(source)
      const jwt = candidates.find((candidate) => candidate.detector === 'jwt')
      if (!jwt) throw new Error('Input is not a valid three-segment JWT/JWS compact token.')
      return {
        output: jwt.value as Record<string, unknown>,
        kind: 'structured',
        warnings: jwt.warnings.map((warning) => warning.message),
        metadata: { confidence: jwt.confidence },
      }
    }
    case 'regex-tester': {
      const pattern = optionString(options, 'pattern', '')
      const flags = optionString(options, 'flags', 'g')
      if (!pattern) throw new Error('Provide a pattern option.')
      if (pattern.length > 500 || source.length > 100_000)
        throw new Error('Regex or input exceeds the safe interactive limit.')
      const regex = new RegExp(pattern, flags)
      const matches = []
      let match: RegExpExecArray | null
      const global = flags.includes('g')
      do {
        match = regex.exec(source)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            named: match.groups ?? {},
          })
          if (matches.length >= 1000) break
          if (match[0] === '') regex.lastIndex += 1
        }
      } while (match && global)
      return {
        output: matches,
        kind: 'structured',
        summary: `${matches.length} matches`,
        warnings: matches.length >= 1000 ? ['Results truncated at 1,000 matches.'] : [],
      }
    }
    case 'html-preview': {
      const sourceDocument = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'"><style>html{font-family:system-ui;color-scheme:light dark;padding:1rem}</style></head><body>${source}</body></html>`
      return {
        output: sourceDocument,
        kind: 'preview',
        warnings: [
          'Render only in a sandboxed iframe without allow-scripts, allow-forms, allow-popups, or allow-navigation.',
        ],
      }
    }
    case 'text-diff': {
      const compareTo = optionString(options, 'compareTo', '')
      const changes = diffLines(source, compareTo).map((change) => ({
        value: change.value,
        added: Boolean(change.added),
        removed: Boolean(change.removed),
        count: change.count ?? 0,
      }))
      return { output: changes, kind: 'structured', summary: `${changes.length} diff segments` }
    }
    case 'string-inspector': {
      const bytes = inputBytes(input)
      const codePoints = [...source].map((character, index) => ({
        index,
        character,
        codePoint: `U+${character.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}`,
        utf8: [...new TextEncoder().encode(character)]
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join(' '),
      }))
      return structuredResult(
        {
          utf16Length: source.length,
          codePoints: codePoints.length,
          utf8Bytes: bytes.length,
          lines: source.split(/\r?\n/).length,
          whitespace: [...source].filter((character) => /\s/u.test(character)).length,
          characters: codePoints.slice(0, 5000),
        },
        undefined,
        codePoints.length > 5000 ? ['Character detail truncated at 5,000 code points.'] : [],
      )
    }
    case 'markdown-preview': {
      const html = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><article>${safeMarkdown(source)}</article>`
      return {
        output: html,
        kind: 'preview',
        warnings: ['Raw HTML is escaped and links are limited to literal HTTP(S) URLs.'],
      }
    }
    case 'cron-parser':
      return textResult(
        cronstrue.toString(source.trim(), {
          throwExceptionOnParseError: true,
          use24HourTimeFormat: true,
        }),
      )
    case 'color-converter':
      return structuredResult(parseColor(source))
    default:
      throw new Error(`Unknown inspect operation: ${id}`)
  }
}
