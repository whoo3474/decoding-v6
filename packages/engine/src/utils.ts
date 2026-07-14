import type { DecodeInput } from './types'

const textDecoder = new TextDecoder('utf-8', { fatal: false })
const textEncoder = new TextEncoder()

export function inputBytes(input: DecodeInput): Uint8Array {
  return typeof input === 'string' ? textEncoder.encode(input) : input
}

export function inputText(input: DecodeInput): string {
  return typeof input === 'string' ? input : textDecoder.decode(input)
}

export function inputSize(input: DecodeInput): number {
  return inputBytes(input).byteLength
}

export function decodeBase64(value: string): Uint8Array | null {
  const normalized = value.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  if (!normalized || /[^A-Za-z0-9+/=]/.test(normalized)) return null
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  try {
    const binary = atob(padded)
    return Uint8Array.from(binary, (char) => char.charCodeAt(0))
  } catch {
    return null
  }
}

export function encodeBase64(bytes: Uint8Array, urlSafe = false): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  const encoded = btoa(binary)
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '') : encoded
}

export function printableRatio(bytes: Uint8Array): number {
  if (!bytes.length) return 0
  let printable = 0
  for (const byte of bytes) {
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126) || byte >= 0xc2) {
      printable += 1
    }
  }
  return printable / bytes.length
}

export function stableDigest(input: DecodeInput): string {
  const bytes = inputBytes(input)
  let hash = 0x811c9dc5
  for (const byte of bytes) {
    hash ^= byte
    hash = Math.imul(hash, 0x01000193)
  }
  return `${bytes.length}:${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, Math.round(value * 1000) / 1000))
}

export function isProbablyUtf8(bytes: Uint8Array): boolean {
  return printableRatio(bytes) >= 0.72
}
