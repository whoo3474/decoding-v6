import { encodeBase64, inputBytes, inputText } from '@decoding/engine'
import YAML from 'yaml'
import { optionNumber, optionString, structuredResult, text, textResult } from './shared'
import type { OperationInput, OperationOptions, OperationResult, OperationRunner } from './types'

function parseInteger(value: string, base: number): bigint {
  const source = value.trim().toLowerCase().replace(/_/g, '')
  const negative = source.startsWith('-')
  const digits = negative ? source.slice(1) : source
  if (base < 2 || base > 36 || !digits) throw new Error('Base must be between 2 and 36.')
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
  let output = 0n
  for (const character of digits) {
    const digit = alphabet.indexOf(character)
    if (digit < 0 || digit >= base) throw new Error(`Invalid base-${base} digit: ${character}`)
    output = output * BigInt(base) + BigInt(digit)
  }
  return negative ? -output : output
}

function bigintToBase(value: bigint, base: number): string {
  if (base < 2 || base > 36) throw new Error('Base must be between 2 and 36.')
  return value.toString(base)
}

function csvEscape(value: unknown): string {
  const source =
    value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value)
  return /[",\r\n]/.test(source) ? `"${source.replace(/"/g, '""')}"` : source
}

function parseCsv(source: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index] ?? ''
    const next = source[index + 1]
    if (character === '"' && quoted && next === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === delimiter && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (quoted) throw new Error('Unclosed quoted CSV field.')
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function words(source: string): string[] {
  return source
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase())
}

function convertCase(source: string, mode: string): string {
  const parts = words(source)
  const cap = (word: string) => (word ? `${word[0]?.toUpperCase()}${word.slice(1)}` : word)
  switch (mode) {
    case 'camel':
      return `${parts[0] ?? ''}${parts.slice(1).map(cap).join('')}`
    case 'pascal':
      return parts.map(cap).join('')
    case 'snake':
      return parts.join('_')
    case 'constant':
      return parts.join('_').toUpperCase()
    case 'kebab':
    case 'slug':
      return parts.join('-')
    case 'title':
      return parts.map(cap).join(' ')
    case 'sentence':
      return cap(parts.join(' '))
    case 'upper':
      return parts.join(' ').toUpperCase()
    case 'lower':
    default:
      return parts.join(' ')
  }
}

type PhpToken = { kind: 'symbol' | 'string' | 'number' | 'word'; value: string }
function phpTokens(source: string): PhpToken[] {
  const tokens: PhpToken[] = []
  const pattern =
    /\s*(=>|\[|\]|[(),]|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?|[A-Za-z_][\w]*)/gy
  let index = 0
  while (index < source.length) {
    pattern.lastIndex = index
    const match = pattern.exec(source)
    if (!match || match.index !== index)
      throw new Error(`Unsupported PHP syntax near offset ${index}.`)
    const value = match[1] ?? ''
    index = pattern.lastIndex
    if (/^(?:\[|\]|[(),])$|^=>$/.test(value)) tokens.push({ kind: 'symbol', value })
    else if (/^['"]/.test(value))
      tokens.push({ kind: 'string', value: value.slice(1, -1).replace(/\\(['"\\])/g, '$1') })
    else if (/^-?\d/.test(value)) tokens.push({ kind: 'number', value })
    else tokens.push({ kind: 'word', value })
  }
  return tokens
}

function parsePhpArray(source: string): unknown {
  const tokens = phpTokens(
    source
      .trim()
      .replace(/^<\?php\s*/i, '')
      .replace(/;\s*$/, '')
      .replace(/^return\s+/i, ''),
  )
  let index = 0
  const peek = () => tokens[index]
  const take = () => tokens[index++]
  function parseValue(): unknown {
    const token = take()
    if (!token) throw new Error('Unexpected end of PHP value.')
    if (token.kind === 'string') return token.value
    if (token.kind === 'number')
      return token.value.includes('.') ? Number(token.value) : Number.parseInt(token.value, 10)
    if (token.kind === 'word') {
      const lower = token.value.toLowerCase()
      if (lower === 'true') return true
      if (lower === 'false') return false
      if (lower === 'null') return null
      if (lower === 'array' && peek()?.value === '(') {
        take()
        return parseCollection(')')
      }
      throw new Error(`Unsupported PHP identifier: ${token.value}`)
    }
    if (token.value === '[') return parseCollection(']')
    throw new Error(`Unexpected PHP token: ${token.value}`)
  }
  function parseCollection(close: string): unknown {
    const entries: Array<{ key?: string | number; value: unknown }> = []
    while (peek() && peek()?.value !== close) {
      const first = parseValue()
      if (peek()?.value === '=>') {
        take()
        const value = parseValue()
        if (typeof first !== 'string' && typeof first !== 'number')
          throw new Error('PHP array keys must be strings or numbers.')
        entries.push({ key: first, value })
      } else entries.push({ value: first })
      if (peek()?.value === ',') take()
      else if (peek()?.value !== close) throw new Error(`Expected comma or ${close}.`)
    }
    if (take()?.value !== close) throw new Error(`Missing ${close}.`)
    const keyed = entries.some((entry) => entry.key !== undefined)
    if (!keyed) return entries.map((entry) => entry.value)
    const output: Record<string, unknown> = {}
    let nextIndex = 0
    for (const entry of entries) {
      output[String(entry.key ?? nextIndex)] = entry.value
      nextIndex += 1
    }
    return output
  }
  const value = parseValue()
  if (index !== tokens.length) throw new Error('Trailing PHP tokens are not supported.')
  return value
}

function jsonToPhp(value: unknown, depth = 0): string {
  const indent = '  '.repeat(depth)
  const child = '  '.repeat(depth + 1)
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (Array.isArray(value))
    return `[\n${value.map((item) => `${child}${jsonToPhp(item, depth + 1)}`).join(',\n')}\n${indent}]`
  if (typeof value === 'object') {
    return `[\n${Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${child}${jsonToPhp(key)} => ${jsonToPhp(item, depth + 1)}`)
      .join(',\n')}\n${indent}]`
  }
  throw new Error('Unsupported JSON value.')
}

function phpSerialize(value: unknown): string {
  if (value === null) return 'N;'
  if (typeof value === 'boolean') return `b:${value ? 1 : 0};`
  if (typeof value === 'number') return Number.isInteger(value) ? `i:${value};` : `d:${value};`
  if (typeof value === 'string') return `s:${new TextEncoder().encode(value).length}:"${value}";`
  const entries = Array.isArray(value)
    ? value.map((item, index) => [index, item] as const)
    : Object.entries(value as Record<string, unknown>)
  return `a:${entries.length}:{${entries.map(([key, item]) => `${phpSerialize(key)}${phpSerialize(item)}`).join('')}}`
}

function phpUnserialize(source: string): unknown {
  let index = 0
  const readUntil = (character: string) => {
    const end = source.indexOf(character, index)
    if (end < 0) throw new Error(`Malformed PHP serialized value at ${index}.`)
    const value = source.slice(index, end)
    index = end + 1
    return value
  }
  function parse(): unknown {
    const type = source[index]
    index += 2
    if (type === 'N') {
      index -= 1
      if (source[index] !== ';') throw new Error('Malformed null.')
      index += 1
      return null
    }
    if (type === 'b') return readUntil(';') === '1'
    if (type === 'i') return Number.parseInt(readUntil(';'), 10)
    if (type === 'd') return Number.parseFloat(readUntil(';'))
    if (type === 's') {
      const length = Number.parseInt(readUntil(':'), 10)
      if (source[index] !== '"') throw new Error('Malformed string.')
      index += 1
      const start = index
      let bytes = 0
      while (index < source.length && bytes < length) {
        const point = source.codePointAt(index)
        if (point === undefined) break
        const character = String.fromCodePoint(point)
        bytes += new TextEncoder().encode(character).length
        index += character.length
      }
      const value = source.slice(start, index)
      if (source.slice(index, index + 2) !== '";') throw new Error('Malformed string terminator.')
      index += 2
      return value
    }
    if (type === 'a') {
      const count = Number.parseInt(readUntil(':'), 10)
      if (source[index] !== '{') throw new Error('Malformed array.')
      index += 1
      const entries: Array<[string | number, unknown]> = []
      for (let item = 0; item < count; item += 1) {
        const key = parse()
        if (typeof key !== 'string' && typeof key !== 'number')
          throw new Error('Unsupported PHP array key.')
        entries.push([key, parse()])
      }
      if (source[index] !== '}') throw new Error('Malformed array terminator.')
      index += 1
      const sequential = entries.every(([key], position) => key === position)
      return sequential
        ? entries.map(([, value]) => value)
        : Object.fromEntries(entries.map(([key, value]) => [String(key), value]))
    }
    throw new Error(`Unsupported PHP serialized type: ${String(type)}`)
  }
  const value = parse()
  if (index !== source.length) throw new Error('Trailing serialized data.')
  return value
}

function shellWords(source: string): string[] {
  const words: string[] = []
  let word = ''
  let quote: '"' | "'" | null = null
  let escaped = false
  for (const character of source.trim()) {
    if (escaped) {
      word += character
      escaped = false
    } else if (character === '\\' && quote !== "'") escaped = true
    else if (quote) {
      if (character === quote) quote = null
      else word += character
    } else if (character === '"' || character === "'") quote = character
    else if (/\s/.test(character)) {
      if (word) words.push(word)
      word = ''
    } else word += character
  }
  if (quote || escaped) throw new Error('Unclosed quote or escape in cURL command.')
  if (word) words.push(word)
  return words
}

type HttpRequest = { url: string; method: string; headers: Record<string, string>; body?: string }
function parseCurl(source: string): HttpRequest {
  const args = shellWords(source.replace(/^\s*curl\s+/, ''))
  let url = ''
  let method = 'GET'
  let body: string | undefined
  const headers: Record<string, string> = {}
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? ''
    const next = args[index + 1]
    if (['-X', '--request'].includes(arg) && next) {
      method = next.toUpperCase()
      index += 1
    } else if (['-H', '--header'].includes(arg) && next) {
      const separator = next.indexOf(':')
      if (separator > 0) headers[next.slice(0, separator).trim()] = next.slice(separator + 1).trim()
      index += 1
    } else if (
      ['-d', '--data', '--data-raw', '--data-binary'].includes(arg) &&
      next !== undefined
    ) {
      body = next
      if (method === 'GET') method = 'POST'
      index += 1
    } else if (!arg.startsWith('-')) url = arg
  }
  if (!/^https?:\/\//i.test(url))
    throw new Error('A literal HTTP(S) URL is required; command substitution is not supported.')
  return { url, method, headers, ...(body === undefined ? {} : { body }) }
}

function requestCode(request: HttpRequest, language: string): string {
  const headers = JSON.stringify(request.headers, null, 2)
  const body = request.body === undefined ? '' : request.body
  const u = JSON.stringify(request.url)
  const method = request.method
  const templates: Record<string, string> = {
    javascript: `const response = await fetch(${u}, {\n  method: '${method}',\n  headers: ${headers},${body ? `\n  body: ${JSON.stringify(body)},` : ''}\n})\nconsole.log(await response.text())`,
    node: `import axios from 'axios'\n\nconst response = await axios({ url: ${u}, method: '${method}', headers: ${headers}${body ? `, data: ${JSON.stringify(body)}` : ''} })\nconsole.log(response.data)`,
    python: `import requests\n\nresponse = requests.request('${method}', ${u}, headers=${headers.replace(/"/g, "'")}${body ? `, data=${JSON.stringify(body)}` : ''})\nprint(response.text)`,
    go: `req, _ := http.NewRequest("${method}", ${u}, ${body ? `strings.NewReader(${JSON.stringify(body)})` : 'nil'})\n${Object.entries(
      request.headers,
    )
      .map(([key, value]) => `req.Header.Set(${JSON.stringify(key)}, ${JSON.stringify(value)})`)
      .join('\n')}\nresp, err := http.DefaultClient.Do(req)`,
    rust: `let client = reqwest::Client::new();\nlet response = client.request(reqwest::Method::${method}, ${u})${Object.entries(
      request.headers,
    )
      .map(([key, value]) => `\n  .header(${JSON.stringify(key)}, ${JSON.stringify(value)})`)
      .join('')}${body ? `\n  .body(${JSON.stringify(body)})` : ''}\n  .send().await?;`,
    java: `HttpRequest request = HttpRequest.newBuilder(URI.create(${u}))\n  .method("${method}", ${body ? `HttpRequest.BodyPublishers.ofString(${JSON.stringify(body)})` : 'HttpRequest.BodyPublishers.noBody()'})${Object.entries(
      request.headers,
    )
      .map(([key, value]) => `\n  .header(${JSON.stringify(key)}, ${JSON.stringify(value)})`)
      .join('')}\n  .build();`,
    kotlin: `val request = Request.Builder().url(${u})${Object.entries(request.headers)
      .map(([key, value]) => `.addHeader(${JSON.stringify(key)}, ${JSON.stringify(value)})`)
      .join(
        '',
      )}.${method.toLowerCase()}(${body ? `${JSON.stringify(body)}.toRequestBody()` : ''}).build()`,
    swift: `var request = URLRequest(url: URL(string: ${u})!)\nrequest.httpMethod = "${method}"${Object.entries(
      request.headers,
    )
      .map(
        ([key, value]) =>
          `\nrequest.setValue(${JSON.stringify(value)}, forHTTPHeaderField: ${JSON.stringify(key)})`,
      )
      .join('')}${body ? `\nrequest.httpBody = ${JSON.stringify(body)}.data(using: .utf8)` : ''}`,
    csharp: `using var request = new HttpRequestMessage(HttpMethod.${method[0]}${method.slice(1).toLowerCase()}, ${u});${Object.entries(
      request.headers,
    )
      .map(
        ([key, value]) =>
          `\nrequest.Headers.TryAddWithoutValidation(${JSON.stringify(key)}, ${JSON.stringify(value)});`,
      )
      .join('')}${body ? `\nrequest.Content = new StringContent(${JSON.stringify(body)});` : ''}`,
    php: `$ch = curl_init(${u});\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');${body ? `\ncurl_setopt($ch, CURLOPT_POSTFIELDS, ${JSON.stringify(body)});` : ''}\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ${jsonToPhp(Object.entries(request.headers).map(([key, value]) => `${key}: ${value}`))});\n$response = curl_exec($ch);`,
    ruby: `uri = URI(${u})\nrequest = Net::HTTP::${method[0]}${method.slice(1).toLowerCase()}.new(uri)${Object.entries(
      request.headers,
    )
      .map(([key, value]) => `\nrequest[${JSON.stringify(key)}] = ${JSON.stringify(value)}`)
      .join('')}${body ? `\nrequest.body = ${JSON.stringify(body)}` : ''}`,
    dart: `final response = await http.${method.toLowerCase()}(Uri.parse(${u}), headers: ${headers}${body ? `, body: ${JSON.stringify(body)}` : ''});`,
    r: `response <- httr::VERB('${method}', ${u}, httr::add_headers(${Object.entries(
      request.headers,
    )
      .map(([key, value]) => `${JSON.stringify(key)} = ${JSON.stringify(value)}`)
      .join(', ')})${body ? `, body = ${JSON.stringify(body)}` : ''})`,
    c: `/* libcurl */\nCURL *curl = curl_easy_init();\ncurl_easy_setopt(curl, CURLOPT_URL, ${u});\ncurl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "${method}");${body ? `\ncurl_easy_setopt(curl, CURLOPT_POSTFIELDS, ${JSON.stringify(body)});` : ''}`,
    httpie: `http ${method} ${request.url} ${Object.entries(request.headers)
      .map(([key, value]) => `${JSON.stringify(`${key}:${value}`)}`)
      .join(' ')}${body ? ` <<< ${JSON.stringify(body)}` : ''}`,
  }
  return templates[language] ?? templates.javascript ?? ''
}

function jsonType(value: unknown, language: string, name = 'Root'): string {
  const entries =
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.entries(value as Record<string, unknown>)
      : [['value', value] as [string, unknown]]
  const typeOf = (item: unknown): string => {
    if (item === null) return language === 'typescript' ? 'null' : 'Any?'
    if (Array.isArray(item))
      return language === 'typescript' ? `${typeOf(item[0])}[]` : `List<${typeOf(item[0])}>`
    if (typeof item === 'string')
      return ['go'].includes(language) ? 'string' : ['python'].includes(language) ? 'str' : 'String'
    if (typeof item === 'number')
      return Number.isInteger(item)
        ? language === 'go'
          ? 'int64'
          : 'Int'
        : language === 'go'
          ? 'float64'
          : 'Double'
    if (typeof item === 'boolean')
      return language === 'python' ? 'bool' : language === 'go' ? 'bool' : 'Boolean'
    return 'Any'
  }
  if (language === 'typescript')
    return `export interface ${name} {\n${entries.map(([key, item]) => `  ${JSON.stringify(key)}: ${typeOf(item)}`).join('\n')}\n}`
  if (language === 'python')
    return `@dataclass\nclass ${name}:\n${entries.map(([key, item]) => `    ${key}: ${typeOf(item)}`).join('\n')}`
  if (language === 'go')
    return `type ${name} struct {\n${entries.map(([key, item]) => `  ${key.replace(/(^|_)(\w)/g, (_, _p, char: string) => char.toUpperCase())} ${typeOf(item)} \`json:"${key}"\``).join('\n')}\n}`
  const keyword = ['swift', 'kotlin', 'dart'].includes(language) ? 'class' : 'public class'
  return `${keyword} ${name} {\n${entries.map(([key, item]) => `  ${typeOf(item)} ${key};`).join('\n')}\n}`
}

export const runConvert: OperationRunner = async (id, input, options) => {
  const source = text(input)
  switch (id) {
    case 'url-parser': {
      const url = new URL(source.trim())
      return structuredResult({
        href: url.href,
        protocol: url.protocol,
        username: url.username,
        password: url.password ? '[redacted]' : '',
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        query: Object.fromEntries(url.searchParams),
        hash: url.hash,
        origin: url.origin,
      })
    }
    case 'yaml-to-json':
      return textResult(JSON.stringify(YAML.parse(source), null, 2))
    case 'json-to-yaml':
      return textResult(YAML.stringify(JSON.parse(source)))
    case 'number-base': {
      const from = optionNumber(options, 'from', 10)
      const to = optionNumber(options, 'to', 16)
      return textResult(bigintToBase(parseInteger(source, from), to), `Base ${from} → ${to}`)
    }
    case 'json-to-csv': {
      const parsed = JSON.parse(source) as unknown
      if (!Array.isArray(parsed)) throw new Error('JSON must be an array.')
      const rows: Record<string, unknown>[] = parsed.map((item) =>
        item && typeof item === 'object' ? (item as Record<string, unknown>) : { value: item },
      )
      const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))]
      return textResult(
        [
          headers.map(csvEscape).join(','),
          ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
        ].join('\n'),
      )
    }
    case 'csv-to-json': {
      const delimiter = optionString(options, 'delimiter', ',')
      const rows = parseCsv(source, delimiter)
      const headers = rows.shift() ?? []
      return textResult(
        JSON.stringify(
          rows.map((row) =>
            Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
          ),
          null,
          2,
        ),
      )
    }
    case 'html-to-jsx': {
      const output = source
        .replace(/\bclass=/g, 'className=')
        .replace(/\bfor=/g, 'htmlFor=')
        .replace(/\btabindex=/gi, 'tabIndex=')
        .replace(/\bcolspan=/gi, 'colSpan=')
        .replace(/\browspan=/gi, 'rowSpan=')
        .replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}')
        .replace(/\bstyle="([^"]*)"/g, (_all, css: string) => {
          const object = Object.fromEntries(
            css
              .split(';')
              .filter(Boolean)
              .map((rule) => {
                const separator = rule.indexOf(':')
                const key = rule
                  .slice(0, separator)
                  .trim()
                  .replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
                return [key, rule.slice(separator + 1).trim()]
              }),
          )
          return `style={${JSON.stringify(object)}}`
        })
      return textResult(output, undefined, [
        'Review custom attributes and inline event handlers before use.',
      ])
    }
    case 'string-case':
      return textResult(convertCase(source, optionString(options, 'mode', 'camel')))
    case 'php-to-json':
      return textResult(JSON.stringify(parsePhpArray(source), null, 2), undefined, [
        'Only inert scalar and array syntax is accepted; PHP is never executed.',
      ])
    case 'json-to-php':
      return textResult(`<?php\n\nreturn ${jsonToPhp(JSON.parse(source))};\n`)
    case 'php-serialize':
      return textResult(phpSerialize(JSON.parse(source)))
    case 'php-unserialize':
      return textResult(JSON.stringify(phpUnserialize(source.trim()), null, 2), undefined, [
        'Objects and executable hooks are rejected.',
      ])
    case 'svg-to-css': {
      if (!/<svg[\s>]/i.test(source) || /<script|on\w+\s*=|javascript:/i.test(source))
        throw new Error('Only scriptless SVG markup is accepted.')
      const mode = optionString(options, 'mode', 'url')
      const data =
        mode === 'base64'
          ? `data:image/svg+xml;base64,${encodeBase64(inputBytes(source))}`
          : `data:image/svg+xml,${encodeURIComponent(source).replace(/'/g, '%27').replace(/"/g, '%22')}`
      return textResult(`background-image: url("${data}");`)
    }
    case 'curl-to-code': {
      const request = parseCurl(source)
      const sensitive = Object.keys(request.headers).filter((key) =>
        /authorization|cookie|api[-_]key/i.test(key),
      )
      return textResult(
        requestCode(request, optionString(options, 'language', 'javascript')),
        undefined,
        sensitive.length
          ? [`Sensitive headers detected: ${sensitive.join(', ')}`]
          : ['The cURL command was parsed as text and never executed.'],
      )
    }
    case 'json-to-code':
      return textResult(
        jsonType(JSON.parse(source), optionString(options, 'language', 'typescript')),
      )
    case 'hex-to-ascii': {
      const normalized = source.replace(/^0x/i, '').replace(/[\s:-]/g, '')
      if (normalized.length % 2 || !/^[0-9a-f]*$/i.test(normalized))
        throw new Error('Expected even-length hexadecimal bytes.')
      return textResult(
        inputText(
          Uint8Array.from(normalized.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16)),
        ),
      )
    }
    case 'ascii-to-hex':
      return textResult(
        [...inputBytes(input)].map((byte) => byte.toString(16).padStart(2, '0')).join(''),
      )
    default:
      throw new Error(`Unknown convert operation: ${id}`)
  }
}

export async function runConvertDirect(
  id: string,
  input: OperationInput,
  options?: OperationOptions,
): Promise<OperationResult> {
  return runConvert(id, input, options)
}
