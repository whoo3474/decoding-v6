import { decodeBase64, encodeBase64, inputBytes, inputText } from '@decoding/engine'
import { X509Certificate } from '@peculiar/x509'
import { optionString, structuredResult, text, textResult } from './shared'
import type { OperationRunner } from './types'

const namedEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
}

function decodeEntities(source: string): string {
  return source.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (_entity, name: string) => {
    if (name.startsWith('#x')) return String.fromCodePoint(Number.parseInt(name.slice(2), 16))
    if (name.startsWith('#')) return String.fromCodePoint(Number.parseInt(name.slice(1), 10))
    return namedEntities[name.toLowerCase()] ?? _entity
  })
}

function encodeEntities(source: string): string {
  return source.replace(/[&<>"'\u00a0]/g, (character) => {
    const entries: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '\u00a0': '&nbsp;',
    }
    return entries[character] ?? `&#${character.codePointAt(0)};`
  })
}

function unescapeBackslash(source: string): string {
  return source.replace(
    /\\(u\{[0-9a-f]+}|u[0-9a-f]{4}|x[0-9a-f]{2}|n|r|t|b|f|v|0|\\|"|')/gi,
    (_all, escape: string) => {
      if (escape === 'n') return '\n'
      if (escape === 'r') return '\r'
      if (escape === 't') return '\t'
      if (escape === 'b') return '\b'
      if (escape === 'f') return '\f'
      if (escape === 'v') return '\v'
      if (escape === '0') return '\0'
      if (escape === '\\' || escape === '"' || escape === "'") return escape
      if (escape.startsWith('u{'))
        return String.fromCodePoint(Number.parseInt(escape.slice(2, -1), 16))
      if (escape.startsWith('u')) return String.fromCodePoint(Number.parseInt(escape.slice(1), 16))
      if (escape.startsWith('x')) return String.fromCodePoint(Number.parseInt(escape.slice(1), 16))
      return _all
    },
  )
}

function escapeBackslash(source: string): string {
  return source.replace(/[\\\n\r\t\b\f\v\0"']/g, (character) => {
    const map: Record<string, string> = {
      '\\': '\\\\',
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
      '\b': '\\b',
      '\f': '\\f',
      '\v': '\\v',
      '\0': '\\0',
      '"': '\\"',
      "'": "\\'",
    }
    return map[character] ?? character
  })
}

export const runEncode: OperationRunner = async (id, input, options) => {
  const source = text(input)
  const mode = optionString(options, 'mode', 'encode')
  switch (id) {
    case 'base64-string': {
      if (mode === 'decode') {
        const decoded = decodeBase64(source)
        if (!decoded) throw new Error('Invalid Base64 or Base64URL input.')
        return textResult(inputText(decoded))
      }
      return textResult(
        encodeBase64(inputBytes(input), optionString(options, 'variant', 'standard') === 'url'),
      )
    }
    case 'base64-image': {
      if (mode === 'decode') {
        const match = /^data:([^;,]+);base64,(.*)$/s.exec(source.trim())
        const decoded = decodeBase64(match?.[2] ?? source)
        if (!decoded) throw new Error('Invalid Base64 image data.')
        return {
          output: decoded,
          kind: 'bytes',
          metadata: { mime: match?.[1] ?? 'application/octet-stream', size: decoded.length },
        }
      }
      const mime = optionString(options, 'mime', 'image/png')
      if (!/^image\/[a-z0-9.+-]+$/i.test(mime)) throw new Error('An image MIME type is required.')
      return textResult(`data:${mime};base64,${encodeBase64(inputBytes(input))}`)
    }
    case 'url-codec':
      return textResult(
        mode === 'decode'
          ? decodeURIComponent(source.replace(/\+/g, ' '))
          : encodeURIComponent(source),
      )
    case 'html-entity':
      return textResult(mode === 'decode' ? decodeEntities(source) : encodeEntities(source))
    case 'backslash-codec':
      return textResult(
        mode === 'unescape' || mode === 'decode'
          ? unescapeBackslash(source)
          : escapeBackslash(source),
      )
    case 'x509-decoder': {
      let certificate: X509Certificate
      try {
        const raw = input instanceof Uint8Array ? Uint8Array.from(input).buffer : source.trim()
        certificate = new X509Certificate(raw)
      } catch {
        throw new Error('Input is not a supported PEM or DER X.509 certificate.')
      }
      const toHex = (value: ArrayBuffer) =>
        [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
      const publicKeyHex = certificate.publicKey.toString('hex')
      return structuredResult(
        {
          subject: certificate.subject,
          issuer: certificate.issuer,
          serialNumber: certificate.serialNumber,
          notBefore: certificate.notBefore.toISOString(),
          notAfter: certificate.notAfter.toISOString(),
          signatureAlgorithm: certificate.signatureAlgorithm.name,
          publicKeyAlgorithm: certificate.publicKey.algorithm.name,
          publicKeyBytes: publicKeyHex.length / 2,
          thumbprints: {
            sha1: toHex(await certificate.getThumbprint('SHA-1')),
            sha256: toHex(await certificate.getThumbprint('SHA-256')),
          },
          extensions: certificate.extensions.map((extension) => ({
            type: extension.type,
            critical: extension.critical,
          })),
        },
        undefined,
        ['Private keys are never accepted or exported. Trust and revocation are not verified.'],
      )
    }
    default:
      throw new Error(`Unknown encode operation: ${id}`)
  }
}
