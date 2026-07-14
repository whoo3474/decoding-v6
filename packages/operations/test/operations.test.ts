import { describe, expect, it } from 'vitest'
import { executeOperation, operationById, operations } from '../src'

const certificate = `-----BEGIN CERTIFICATE-----
MIIGFDCCA/ygAwIBAgIIU+w77vuySF8wDQYJKoZIhvcNAQEFBQAwUTELMAkGA1UE
BhMCRVMxQjBABgNVBAMMOUF1dG9yaWRhZCBkZSBDZXJ0aWZpY2FjaW9uIEZpcm1h
cHJvZmVzaW9uYWwgQ0lGIEE2MjYzNDA2ODAeFw0wOTA1MjAwODM4MTVaFw0zMDEy
MzEwODM4MTVaMFExCzAJBgNVBAYTAkVTMUIwQAYDVQQDDDlBdXRvcmlkYWQgZGUg
Q2VydGlmaWNhY2lvbiBGaXJtYXByb2Zlc2lvbmFsIENJRiBBNjI2MzQwNjgwggIi
MA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDKlmuO6vj78aI14H9M2uDDUtd9
thDIAl6zQyrET2qyyhxdKJp4ERppWVevtSBC5IsP5t9bpgOSL/UR5GLXMnE42QQM
cas9UX4PB99jBVzpv5RvwSmCwLTaUbDBPLutN0pcyvFLNg4kq7/DhHf9qFD0sefG
L9ItWY16Ck6WaVICqjaY7Pz6FIMMNx/Jkjd/14Et5cS54D40/mf0PmbR0/RAz15i
NA9wBj4gGFrO93IbJWyTdBSTo3OxDqqHECNZXyAFGUftaI6SEspd/NYrspI8IM/h
X68gvqB2f3bl7BqGYTM+53u0P6APjqK5am+5hyZvQWyIplD9amML9ZMWGxmPsu2b
m8mQ9QEM3xk9Dz44I8kvjwzRAv4bVdZO0I08r0+k8/6vKtMFnXkIoctXMbScyJCy
Z/QYFpM6/EfY0XiWMR+6KwxfXZmtY4laJCB22N/9q06mIqqdXuYnin1oKaPnirja
EbsXLZmdEyRG98Xi2J+Of8ePdG1asuhy9azuJBCtLxTa/y2aRnFHvkLfuwHb9H/T
KI8xWVvTyQKmtFLKbpf7Q8UIJm+K9Lv9nyiqDdVF8xM6HdjAeI9BZzwelGSuewvF
6NkBiDkal4ZkQdU7hwxu+g/GvUgUvzlN1J5Bto+WHWOWk9mVBngxaJ43BjuAiUVh
OSPHG0SjFeUc+JIwuwIDAQABo4HvMIHsMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBRlzeurNR4APn7VdMActHNHDhpkLzCBpgYD
VR0gBIGeMIGbMIGYBgRVHSAAMIGPMC8GCCsGAQUFBwIBFiNodHRwOi8vd3d3LmZp
cm1hcHJvZmVzaW9uYWwuY29tL2NwczBcBggrBgEFBQcCAjBQHk4AUABhAHMAZQBv
ACAAZABlACAAbABhACAAQgBvAG4AYQBuAG8AdgBhACAANAA3ACAAQgBhAHIAYwBl
AGwAbwBuAGEAIAAwADgAMAAxADcwDQYJKoZIhvcNAQEFBQADggIBABd9oPm03cXF
661LJLWhAqvdpYhKsg9VSytXjDvlMd3+xDLx51tkljYyGOylMnfX40S2wBEqgLk9
am58m9Ot/MPWo+ZkKXzR4Tgegiv/J2Wv+xYVxC5xhOW1//qkR71kMrv2JYSiJ0L1
ILDCExARzRAVukKQKtJE4ZYm6zFIEv0q2skGz3QeqUvVhyj5eTSSPi5E6PaPT481
PyWzOdxjKpBrIF/EUhJOlywqrJ2X3kjyo2bbwtKDlaZmp54lD+kLM5FlClrD2VQS
3a/DTg4fJl4N3LON7NWBcN7STyQF82xO9UxJZo3R/9ILJUFI/lGExkKvgATP0H5k
SeTy36LssUzAKh3ntLFlosS88Zj0qnAHY7S42jtM+kAiMFsRpvAFDsYCA0irhpuF
3dvd6qJ2gHN99ZwExEWN57kci57q13XRcrHedUTnQn3iV2t93Jm8PYMo6oCTjcVM
ZcFwgbg4/EMxsvYDNEeyrPsiBsse3RdHHF9mudMaotoRsaS8I8nkvof/uZS2+F0g
StRf571oe2XyFR7SOqkt6dhrJKyXWERHrVkY8SFlcN7ONGCoQPHzPKTDKCOM/icz
Q0CgFzzr6juwcqajuUpLXhZI9LK8yIySxZ2frHI2vDSANGupi5LAuBft7HZT9SQB
jLMi6Et8Vcad+qMUu2WFbm5PEn4KPJ2V
-----END CERTIFICATE-----`

type Smoke = { input: string; options?: Record<string, string | number | boolean> }
const smoke: Record<string, Smoke> = {
  'json-format': { input: '{"ok":true}' },
  'html-format': { input: '<main><p>local</p></main>' },
  'css-format': { input: 'body{color:red}' },
  'javascript-format': { input: 'const answer={ok:true}' },
  'erb-format': { input: '<% if ok %><p>yes</p><% end %>' },
  'less-format': { input: '@c:red;.x{color:@c}' },
  'scss-format': { input: '$c:red;.x{color:$c}' },
  'xml-format': { input: '<root><item>one</item></root>' },
  'sql-format': { input: 'select id,name from users where id=1' },
  'line-sort': { input: 'z\na\na' },
  'url-parser': { input: 'https://example.invalid/a?q=local' },
  'yaml-to-json': { input: 'local: true\ncount: 47' },
  'json-to-yaml': { input: '{"local":true,"count":47}' },
  'number-base': { input: '255', options: { from: 10, to: 16 } },
  'json-to-csv': { input: '[{"name":"local","count":47}]' },
  'csv-to-json': { input: 'name,count\nlocal,47' },
  'html-to-jsx': { input: '<label class="x" for="a">A</label>' },
  'string-case': { input: 'Local decoder tools', options: { mode: 'camel' } },
  'php-to-json': { input: "['local' => true, 'count' => 47]" },
  'json-to-php': { input: '{"local":true,"count":47}' },
  'php-serialize': { input: '{"local":true,"count":47}' },
  'php-unserialize': { input: 'a:1:{s:2:"ok";b:1;}' },
  'svg-to-css': { input: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="2"/></svg>' },
  'curl-to-code': {
    input: "curl 'https://example.invalid/api'",
    options: { language: 'javascript' },
  },
  'json-to-code': { input: '{"local":true,"count":47}', options: { language: 'typescript' } },
  'hex-to-ascii': { input: '48656c6c6f' },
  'ascii-to-hex': { input: 'Hello' },
  'unix-time': { input: '1735689600' },
  'jwt-debugger': { input: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsb2NhbCJ9.signature' },
  'regex-tester': { input: 'one 123 two', options: { pattern: '\\d+', flags: 'g' } },
  'html-preview': { input: '<main>local</main>' },
  'text-diff': { input: 'before', options: { compareTo: 'after' } },
  'string-inspector': { input: 'A😀\n' },
  'markdown-preview': { input: '# Local\n\n**Safe**' },
  'cron-parser': { input: '*/15 * * * *' },
  'color-converter': { input: '#5949d8' },
  'uuid-ulid-generator': { input: '', options: { kind: 'uuid-v7' } },
  'lorem-ipsum': { input: '', options: { paragraphs: 1 } },
  'qr-code': { input: 'https://example.invalid/local', options: { mode: 'generate' } },
  'hash-generator': { input: 'local', options: { algorithm: 'sha256' } },
  'random-string': { input: '', options: { preset: 'alphanumeric', length: 24 } },
  'base64-string': { input: 'hello', options: { mode: 'encode' } },
  'base64-image': { input: 'local-image-bytes', options: { mode: 'encode', mime: 'image/png' } },
  'url-codec': { input: 'hello world', options: { mode: 'encode' } },
  'html-entity': { input: '<local & safe>', options: { mode: 'encode' } },
  'backslash-codec': { input: 'line one\nline two', options: { mode: 'escape' } },
  'x509-decoder': { input: certificate },
}

describe('47-tool operation registry', () => {
  it('contains exactly 47 unique tools split 16+11+10+10', () => {
    expect(operations).toHaveLength(47)
    expect(operationById.size).toBe(47)
    expect(operations.filter((operation) => operation.pack === 1)).toHaveLength(16)
    expect(operations.filter((operation) => operation.pack === 2)).toHaveLength(11)
    expect(operations.filter((operation) => operation.pack === 3)).toHaveLength(10)
    expect(operations.filter((operation) => operation.pack === 4)).toHaveLength(10)
  })

  it('runs representative format, convert, inspect, generate, and encode tools', async () => {
    await expect(executeOperation('json-format', '{"ok":true}')).resolves.toMatchObject({
      kind: 'text',
      output: '{\n  "ok": true\n}',
    })
    await expect(
      executeOperation('number-base', '255', { from: 10, to: 16 }),
    ).resolves.toMatchObject({ output: 'ff' })
    await expect(executeOperation('string-inspector', 'A😀')).resolves.toMatchObject({
      kind: 'structured',
    })
    await expect(
      executeOperation('uuid-ulid-generator', '', { kind: 'uuid-v7' }),
    ).resolves.toMatchObject({ kind: 'text' })
    await expect(executeOperation('base64-string', 'hello')).resolves.toMatchObject({
      output: 'aGVsbG8=',
    })
  })

  it('has and executes a valid fixture for every registered operation', async () => {
    expect(Object.keys(smoke).sort()).toEqual(operations.map((operation) => operation.id).sort())
    for (const operation of operations) {
      const fixture = smoke[operation.id]
      expect(fixture, operation.id).toBeDefined()
      const result = await executeOperation(operation.id, fixture?.input ?? '', fixture?.options)
      expect(result.kind, operation.id).toMatch(/^(text|bytes|structured|preview|image)$/)
    }
  }, 20_000)

  it('round-trips CSV and PHP serialization', async () => {
    const csv = await executeOperation('json-to-csv', '[{"a":1,"b":"x"},{"a":2,"b":"y"}]')
    const json = await executeOperation('csv-to-json', String(csv.output))
    expect(JSON.parse(String(json.output))).toEqual([
      { a: '1', b: 'x' },
      { a: '2', b: 'y' },
    ])

    const serialized = await executeOperation('php-serialize', '{"name":"decoding","ok":true}')
    const unserialized = await executeOperation('php-unserialize', String(serialized.output))
    expect(JSON.parse(String(unserialized.output))).toEqual({ name: 'decoding', ok: true })
  })

  it('never executes cURL and emits code with a credential warning', async () => {
    const result = await executeOperation(
      'curl-to-code',
      "curl 'https://example.invalid/api' -H 'Authorization: Bearer secret' -d '{\"ok\":true}'",
      { language: 'python' },
    )
    expect(String(result.output)).toContain('requests.request')
    expect(result.warnings?.join(' ')).toContain('Authorization')
  })

  it('creates a network-blocked HTML preview document', async () => {
    const result = await executeOperation(
      'html-preview',
      '<script>fetch("https://evil.invalid")</script>',
    )
    expect(String(result.output)).toContain("default-src 'none'")
    expect(result.warnings?.join(' ')).toContain('sandboxed iframe')
  })

  it('rejects executable parser payloads or keeps them inert', async () => {
    await expect(
      executeOperation('php-to-json', "<?php system('touch /tmp/decoding-pwned');"),
    ).rejects.toThrow()
    await expect(
      executeOperation('curl-to-code', 'curl $(touch /tmp/decoding-pwned)'),
    ).rejects.toThrow()
    await expect(
      executeOperation('regex-tester', 'input', { pattern: 'x'.repeat(501) }),
    ).rejects.toThrow(/safe interactive limit/)
    await expect(
      executeOperation(
        'x509-decoder',
        '-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----',
      ),
    ).rejects.toThrow()
    const markdown = await executeOperation(
      'markdown-preview',
      '<script>fetch("https://evil.invalid")</script>',
    )
    expect(String(markdown.output)).toContain('&lt;script&gt;')
    const xml = await executeOperation(
      'xml-format',
      '<!DOCTYPE x [<!ENTITY e SYSTEM "file:///etc/passwd">]><x>&e;</x>',
    )
    expect(String(xml.output)).toContain('&e;')
  })
})
