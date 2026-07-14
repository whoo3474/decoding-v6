import { gzipSync } from 'fflate'

export type PublicFixture = {
  id: string
  detector: string
  input: string | Uint8Array
  class: 'positive' | 'edge' | 'negative'
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function base64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let output = ''
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0
    const second = bytes[index + 1] ?? 0
    const third = bytes[index + 2] ?? 0
    const combined = (first << 16) | (second << 8) | third
    output += alphabet[(combined >> 18) & 63]
    output += alphabet[(combined >> 12) & 63]
    output += index + 1 < bytes.length ? alphabet[(combined >> 6) & 63] : '='
    output += index + 2 < bytes.length ? alphabet[combined & 63] : '='
  }
  return output
}

function base64Url(value: string): string {
  return base64(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function fixtures(
  detector: string,
  positives: Array<string | Uint8Array>,
  edges: Array<string | Uint8Array>,
  negatives: Array<string | Uint8Array>,
): PublicFixture[] {
  return [
    ...positives.map((input, index) => ({
      id: `${detector}-positive-${index + 1}`,
      detector,
      input,
      class: 'positive' as const,
    })),
    ...edges.map((input, index) => ({
      id: `${detector}-edge-${index + 1}`,
      detector,
      input,
      class: 'edge' as const,
    })),
    ...negatives.map((input, index) => ({
      id: `${detector}-negative-${index + 1}`,
      detector,
      input,
      class: 'negative' as const,
    })),
  ]
}

const commonNegatives = (label: string) =>
  Array.from({ length: 20 }, (_, index) => `not-${label}-fixture-${index + 1}!*`)
const jwt = Array.from(
  { length: 20 },
  (_, index) =>
    `${base64Url(JSON.stringify({ alg: index % 2 ? 'HS256' : 'RS256', typ: 'JWT' }))}.${base64Url(JSON.stringify({ sub: `fixture-${index}`, exp: 2_000_000_000 + index }))}.signature${index}`,
)
const base64Values = Array.from({ length: 20 }, (_, index) =>
  base64(`base64 fixture ${index + 1}: local-only data`),
)
const json = Array.from({ length: 20 }, (_, index) =>
  JSON.stringify({ fixture: index + 1, local: true, values: [index, index + 1] }),
)
const hex = Array.from(
  { length: 20 },
  (_, index) =>
    `0x${[...new TextEncoder().encode(`hex-${index.toString().padStart(2, '0')}`)].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`,
)
const urls = Array.from(
  { length: 20 },
  (_, index) => `https://example.invalid/path/${index + 1}?fixture=${index + 1}&local=true`,
)
const epochs = Array.from({ length: 20 }, (_, index) => String(1_735_689_600 + index * 86_400))
const uuids = Array.from(
  { length: 20 },
  (_, index) => `123e4567-e89b-42d3-a456-${index.toString(16).padStart(12, '0')}`,
)
const compressed = Array.from({ length: 20 }, (_, index) =>
  gzipSync(new TextEncoder().encode(JSON.stringify({ fixture: index + 1, compressed: true }))),
)

export const publicFixtures: PublicFixture[] = [
  ...fixtures(
    'jwt',
    jwt,
    jwt.slice(0, 10).map((value, index) => value.replace(/signature\d+$/, `s${index}`)),
    commonNegatives('jwt'),
  ),
  ...fixtures(
    'base64',
    base64Values,
    Array.from({ length: 10 }, (_, index) =>
      base64Url(`unpadded URL alphabet fixture ${index} ? ${index % 2 ? '_' : '-'}`),
    ),
    commonNegatives('base64'),
  ),
  ...fixtures(
    'json',
    json,
    [
      '{}',
      '[]',
      '"escaped\\ntext"',
      '{"unicode":"한글"}',
      '{"large":9007199254740991}',
      '{"null":null}',
      '{"nested":{"a":{"b":1}}}',
      '[1,"two",false]',
      '{"emoji":"🔐"}',
      '{"empty":""}',
    ],
    Array.from({ length: 20 }, (_, index) => `{"broken${index}":`),
  ),
  ...fixtures(
    'hex',
    hex,
    [
      '0x00ff',
      '0xdeadbeef',
      '41 42 43 44',
      '41:42:43:44',
      '41-42-43-44',
      '0x0000',
      'cafebabe',
      'abcdef12',
      '31323334',
      'ffffffff',
    ],
    commonNegatives('hex'),
  ),
  ...fixtures(
    'url',
    urls,
    [
      'hello%20world',
      'a=1&b=2',
      'q=one%20two',
      'https://example.invalid/',
      'mailto%3Adev%40example.invalid',
      'x=%F0%9F%94%90',
      'localhost=true',
      'a=&b=',
      'https://[::1]/?a=1',
      'ftp://example.invalid/file',
    ],
    commonNegatives('url'),
  ),
  ...fixtures(
    'epoch',
    epochs,
    [
      '946684800',
      '4102444800',
      '1735689600000',
      '1735689600000000',
      '1735689600000000000',
      '-2208988800',
      '9999999999',
      '1000000000000',
      '2000000000',
      '2147483647',
    ],
    commonNegatives('epoch'),
  ),
  ...fixtures(
    'uuid-ulid',
    uuids,
    [
      '123e4567-e89b-12d3-a456-426614174000',
      '01890f2e-9b8a-7cc2-98fc-000000000001',
      '{123e4567-e89b-42d3-a456-426614174000}',
      '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      '00000000000000000000000000',
      '7ZZZZZZZZZZZZZZZZZZZZZZZZZ',
      'ffffffff-ffff-4fff-bfff-ffffffffffff',
      '00000000-0000-7000-8000-000000000000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      '01234567-89ab-4def-8abc-0123456789ab',
    ],
    commonNegatives('uuid'),
  ),
  ...fixtures(
    'compression',
    compressed,
    Array.from({ length: 10 }, (_, index) =>
      gzipSync(new TextEncoder().encode(index === 0 ? '' : 'x'.repeat(index))),
    ),
    commonNegatives('compression'),
  ),
]

export const fixturesByDetector = new Map(
  [...new Set(publicFixtures.map((fixture) => fixture.detector))].map((detector) => [
    detector,
    publicFixtures.filter((fixture) => fixture.detector === detector),
  ]),
)
