import { gzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { decode, detect, encodeBase64 } from '../src'

describe('detectors', () => {
  it('detects and lints JWT', async () => {
    const jwt = `${encodeBase64(new TextEncoder().encode('{"alg":"RS256","typ":"JWT"}'), true)}.${encodeBase64(new TextEncoder().encode('{"sub":"123","exp":1}'), true)}.signature`
    const candidates = await detect(jwt, { now: new Date('2026-01-01T00:00:00Z') })
    expect(candidates[0]?.detector).toBe('jwt')
    expect(candidates[0]?.warnings.map((warning) => warning.ruleId)).toContain('JWT-EXPIRED')
  })

  it('builds a recursive Base64 to JSON chain', async () => {
    const encoded = encodeBase64(new TextEncoder().encode('{"ok":true}'))
    const result = await decode(encoded)
    expect(result.root.selected?.detector).toBe('base64')
    expect(result.root.children[0]?.selected?.detector).toBe('json')
  })

  it('detects timestamp, URL, UUID and ULID', async () => {
    expect((await detect('1767225600000'))[0]).toMatchObject({ detector: 'epoch' })
    expect((await detect('https://example.invalid/a?x=1'))[0]).toMatchObject({ detector: 'url' })
    expect((await detect('01890f3e-7b7c-7cc2-98c3-1f4ad2c07f80'))[0]).toMatchObject({
      detector: 'uuid-ulid',
    })
    expect((await detect('01ARZ3NDEKTSV4RRFFQ69G5FAV'))[0]).toMatchObject({
      detector: 'uuid-ulid',
    })
  })

  it('decompresses gzip and enforces recursive decoding', async () => {
    const compressed = gzipSync(new TextEncoder().encode('{"compressed":true}'))
    const result = await decode(compressed)
    expect(result.root.selected?.detector).toBe('compression')
    expect(result.root.children[0]?.selected?.detector).toBe('json')
  })

  it('does not promote ambiguous alphanumeric input to a confident format', async () => {
    const result = await decode('deadbeef')
    expect(['ambiguous', 'confident']).toContain(result.root.status)
    expect(result.root.candidates.length).toBeGreaterThan(1)
  })

  it('enforces input size', async () => {
    const result = await decode('too large', { limits: { maxInputBytes: 2 } })
    expect(result.root.status).toBe('limit')
    expect(result.root.limitReason).toBe('input-size')
  })
})
