import { inputBytes } from '@decoding/engine'
import { keccak, md5, sha1, sha256, sha512 } from 'hash-wasm'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import {
  optionBoolean,
  optionNumber,
  optionString,
  structuredResult,
  text,
  textResult,
} from './shared'
import type { OperationRunner } from './types'

const crockford = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
function randomBytes(length: number): Uint8Array {
  const output = new Uint8Array(length)
  crypto.getRandomValues(output)
  return output
}

function uuidV7(): string {
  const bytes = randomBytes(16)
  let timestamp = BigInt(Date.now())
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = Number(timestamp & 0xffn)
    timestamp >>= 8n
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function ulid(): string {
  let time = Date.now()
  let output = ''
  for (let index = 0; index < 10; index += 1) {
    output = `${crockford[time % 32]}${output}`
    time = Math.floor(time / 32)
  }
  const random = randomBytes(16)
  for (let index = 0; index < 16; index += 1) output += crockford[(random[index] ?? 0) & 31]
  return output
}

const loremWords =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  )
function lorem(count: number): string {
  const paragraphs: string[] = []
  for (let paragraph = 0; paragraph < count; paragraph += 1) {
    const words = Array.from(
      { length: 55 },
      (_, index) => loremWords[(paragraph * 13 + index) % loremWords.length] ?? 'lorem',
    )
    const sentence = `${words.join(' ')}.`
    paragraphs.push(`${sentence[0]?.toUpperCase()}${sentence.slice(1)}`)
  }
  return paragraphs.join('\n\n')
}

async function digest(algorithm: string, source: Uint8Array): Promise<string> {
  switch (algorithm) {
    case 'md5':
      return md5(source)
    case 'sha1':
      return sha1(source)
    case 'sha512':
      return sha512(source)
    case 'keccak-256':
      return keccak(source, 256)
    case 'sha256':
    default:
      return sha256(source)
  }
}

function randomString(length: number, alphabet: string): string {
  if (!alphabet) throw new Error('Alphabet cannot be empty.')
  const limit = 256 - (256 % alphabet.length)
  let output = ''
  while (output.length < length) {
    for (const byte of randomBytes(Math.max(16, length - output.length))) {
      if (byte < limit) output += alphabet[byte % alphabet.length]
      if (output.length === length) break
    }
  }
  return output
}

export const runGenerate: OperationRunner = async (id, input, options) => {
  const source = text(input)
  switch (id) {
    case 'uuid-ulid-generator': {
      const kind = optionString(options, 'kind', 'uuid-v4')
      const count = Math.min(1000, Math.max(1, optionNumber(options, 'count', 1)))
      const values = Array.from({ length: count }, () =>
        kind === 'ulid' ? ulid() : kind === 'uuid-v7' ? uuidV7() : crypto.randomUUID(),
      )
      return textResult(values.join('\n'), `${count} ${kind} value${count === 1 ? '' : 's'}`)
    }
    case 'lorem-ipsum':
      return textResult(lorem(Math.min(20, Math.max(1, optionNumber(options, 'paragraphs', 2)))))
    case 'qr-code': {
      const mode = optionString(options, 'mode', 'generate')
      if (mode === 'read') {
        if (!(input instanceof Uint8Array)) throw new Error('QR reading expects RGBA pixel bytes.')
        const width = optionNumber(options, 'width', 0)
        const height = optionNumber(options, 'height', 0)
        if (width <= 0 || height <= 0 || input.length !== width * height * 4)
          throw new Error('Provide matching RGBA width and height.')
        const decoded = jsQR(new Uint8ClampedArray(input), width, height, {
          inversionAttempts: 'attemptBoth',
        })
        if (!decoded) throw new Error('No QR code was found in the supplied pixels.')
        return structuredResult({
          data: decoded.data,
          version: decoded.version,
          location: decoded.location,
        })
      }
      const dataUrl = await QRCode.toDataURL(source, {
        errorCorrectionLevel: optionString(options, 'errorCorrection', 'M') as
          'L' | 'M' | 'Q' | 'H',
        margin: 2,
        width: Math.min(2048, Math.max(128, optionNumber(options, 'width', 384))),
      })
      return { output: dataUrl, kind: 'image', summary: `${source.length} characters` }
    }
    case 'hash-generator': {
      const algorithm = optionString(options, 'algorithm', 'sha256').toLowerCase()
      return textResult(await digest(algorithm, inputBytes(input)), algorithm.toUpperCase())
    }
    case 'random-string': {
      const preset = optionString(options, 'preset', 'alphanumeric')
      const length = Math.min(
        4096,
        Math.max(1, optionNumber(options, 'length', preset === 'nanoid' ? 21 : 32)),
      )
      const alphabets: Record<string, string> = {
        alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        password: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+',
        nanoid: '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        hex: '0123456789abcdef',
        numeric: '0123456789',
      }
      const alphabet = optionString(
        options,
        'alphabet',
        alphabets[preset] ?? alphabets.alphanumeric ?? '',
      )
      let output = randomString(length, alphabet)
      if (optionBoolean(options, 'grouped', preset === 'license')) {
        const groupSize = Math.max(1, optionNumber(options, 'groupSize', 5))
        output = output.match(new RegExp(`.{1,${groupSize}}`, 'g'))?.join('-') ?? output
      }
      return textResult(output)
    }
    default:
      throw new Error(`Unknown generate operation: ${id}`)
  }
}
