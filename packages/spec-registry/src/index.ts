export type DetectorSpec = {
  detector: string
  slug: string
  label: string
  description: string
  examples: string[]
  references: Array<{ title: string; url: string }>
}

export const detectorSpecs: DetectorSpec[] = [
  {
    detector: 'jwt',
    slug: 'jwt',
    label: 'JWT / JWS compact',
    description:
      'Inspect compact token segments and deterministic time or algorithm warnings without verifying a signature.',
    examples: [
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJleGFtcGxlIn0.',
      'Three dot-separated Base64URL segments',
      'Expired exp and future nbf claims',
    ],
    references: [
      { title: 'RFC 7519 — JSON Web Token', url: 'https://www.rfc-editor.org/rfc/rfc7519' },
      { title: 'RFC 7515 — JSON Web Signature', url: 'https://www.rfc-editor.org/rfc/rfc7515' },
    ],
  },
  {
    detector: 'base64',
    slug: 'base64',
    label: 'Base64 / Base64URL',
    description:
      'Decode padded, unpadded, and URL-safe Base64 while keeping ambiguous plain text visible.',
    examples: ['SGVsbG8sIGxvY2FsIHdvcmxkIQ==', 'eyJsb2NhbCI6dHJ1ZX0', 'U29tZV91cmwtc2FmZS10ZXh0'],
    references: [
      { title: 'RFC 4648 — Base-N Encodings', url: 'https://www.rfc-editor.org/rfc/rfc4648' },
    ],
  },
  {
    detector: 'json',
    slug: 'json',
    label: 'JSON / JSON string escapes',
    description: 'Parse structured JSON and unwrap JSON-escaped strings for the next chain step.',
    examples: ['{"local":true,"count":47}', '["one","two"]', '"escaped\\ntext"'],
    references: [{ title: 'RFC 8259 — JSON', url: 'https://www.rfc-editor.org/rfc/rfc8259' }],
  },
  {
    detector: 'hex',
    slug: 'hex',
    label: 'Base16 hexadecimal',
    description: 'Recognize even-length Base16 bytes with optional separators or a 0x prefix.',
    examples: ['0x48656c6c6f', '41 42 43 44', 'de:ad:be:ef'],
    references: [
      {
        title: 'RFC 4648 section 8 — Base16',
        url: 'https://www.rfc-editor.org/rfc/rfc4648#section-8',
      },
    ],
  },
  {
    detector: 'url',
    slug: 'url',
    label: 'URL / percent encoding / query',
    description:
      'Inspect complete URLs, query strings, and percent-encoded text without making a request.',
    examples: ['https://example.invalid/path?q=local', 'a=1&b=two', 'hello%20world'],
    references: [
      { title: 'WHATWG URL Standard', url: 'https://url.spec.whatwg.org/' },
      { title: 'RFC 3986 — URI Generic Syntax', url: 'https://www.rfc-editor.org/rfc/rfc3986' },
    ],
  },
  {
    detector: 'epoch',
    slug: 'epoch',
    label: 'Unix epoch time',
    description:
      'Infer seconds, milliseconds, microseconds, or nanoseconds from integer width and date range.',
    examples: ['1735689600', '1735689600000', '1735689600000000000'],
    references: [
      {
        title: 'POSIX Base Definitions — Seconds Since the Epoch',
        url: 'https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html#tag_04_19',
      },
    ],
  },
  {
    detector: 'uuid-ulid',
    slug: 'uuid-ulid',
    label: 'UUID / ULID',
    description: 'Inspect UUID variant and version, UUID v7 time, and ULID sortable time.',
    examples: [
      '123e4567-e89b-42d3-a456-426614174000',
      '01890f2e-9b8a-7cc2-98fc-000000000001',
      '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    ],
    references: [
      { title: 'RFC 9562 — UUIDs', url: 'https://www.rfc-editor.org/rfc/rfc9562' },
      { title: 'ULID canonical specification', url: 'https://github.com/ulid/spec' },
    ],
  },
  {
    detector: 'compression',
    slug: 'compression',
    label: 'gzip / zlib / deflate',
    description:
      'Expand recognized compressed bytes under strict size and ratio limits, then continue the decode chain.',
    examples: ['Drop a .gz file', 'gzip magic bytes 1f 8b', 'zlib streams with a valid header'],
    references: [
      { title: 'RFC 1950 — ZLIB', url: 'https://www.rfc-editor.org/rfc/rfc1950' },
      { title: 'RFC 1951 — DEFLATE', url: 'https://www.rfc-editor.org/rfc/rfc1951' },
      { title: 'RFC 1952 — GZIP', url: 'https://www.rfc-editor.org/rfc/rfc1952' },
    ],
  },
]

export const detectorSpecById = new Map(detectorSpecs.map((entry) => [entry.detector, entry]))
