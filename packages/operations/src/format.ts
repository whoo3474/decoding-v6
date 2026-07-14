import { format as formatSql, type SqlLanguage } from 'sql-formatter'
import { optionBoolean, optionString, text, textResult } from './shared'
import type { OperationRunner } from './types'

async function prettierFormat(
  source: string,
  parser: 'html' | 'css' | 'scss' | 'less' | 'babel',
): Promise<string> {
  const prettier = await import('prettier/standalone')
  const plugins =
    parser === 'html'
      ? [await import('prettier/plugins/html')]
      : parser === 'babel'
        ? [await import('prettier/plugins/babel'), await import('prettier/plugins/estree')]
        : [await import('prettier/plugins/postcss')]
  return prettier.format(source, {
    parser,
    plugins,
    printWidth: 100,
    semi: false,
    singleQuote: true,
  })
}

function compactFormatted(source: string): string {
  return source
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/>\s+</g, '><')
    .trim()
}

function formatXml(source: string, minify: boolean): string {
  const tokens = source
    .replace(/>\s*</g, '><')
    .split(/(?=<)|(?<=>)/)
    .filter(Boolean)
  if (minify) return tokens.map((token) => token.trim()).join('')
  let depth = 0
  const lines: string[] = []
  for (const raw of tokens) {
    const token = raw.trim()
    if (!token) continue
    if (/^<\//.test(token)) depth = Math.max(0, depth - 1)
    lines.push(`${'  '.repeat(depth)}${token}`)
    if (/^<[^!?/][^>]*[^/]?>$/.test(token) && !/^<[^>]+>.*<\//.test(token)) depth += 1
  }
  return lines.join('\n')
}

function formatErb(source: string, minify: boolean): string {
  if (minify) return source.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim()
  const tokens = source
    .replace(/>\s*</g, '><')
    .split(/(?=<)|(?<=>)/)
    .filter(Boolean)
  let depth = 0
  return tokens
    .map((raw) => {
      const token = raw.trim()
      if (/^<\//.test(token) || /^<%\s*end/.test(token)) depth = Math.max(0, depth - 1)
      const line = `${'  '.repeat(depth)}${token}`
      if (
        /^<[^!?/%][^>]*[^/]?>$/.test(token) ||
        /^<%\s*(if|unless|case|each|for|while|begin)\b/.test(token)
      )
        depth += 1
      return line
    })
    .join('\n')
}

export const runFormat: OperationRunner = async (id, input, options) => {
  const source = text(input)
  const mode = optionString(options, 'mode', 'format')
  const minify = mode === 'minify'
  switch (id) {
    case 'json-format': {
      const parsed = JSON.parse(source) as unknown
      return textResult(JSON.stringify(parsed, null, minify ? 0 : 2), 'Valid JSON')
    }
    case 'html-format': {
      const output = await prettierFormat(source, 'html')
      return textResult(minify ? compactFormatted(output) : output)
    }
    case 'css-format': {
      const output = await prettierFormat(source, 'css')
      return textResult(minify ? compactFormatted(output) : output)
    }
    case 'javascript-format': {
      const output = await prettierFormat(source, 'babel')
      return textResult(minify ? compactFormatted(output) : output, undefined, [
        'Minify mode compacts formatting but does not perform dead-code elimination.',
      ])
    }
    case 'erb-format':
      return textResult(formatErb(source, minify), undefined, [
        'ERB is formatted as inert text; embedded Ruby is never executed.',
      ])
    case 'less-format': {
      const output = await prettierFormat(source, 'less')
      return textResult(minify ? compactFormatted(output) : output)
    }
    case 'scss-format': {
      const output = await prettierFormat(source, 'scss')
      return textResult(minify ? compactFormatted(output) : output)
    }
    case 'xml-format':
      return textResult(formatXml(source, minify), undefined, [
        'XML entities are not resolved and external resources are never loaded.',
      ])
    case 'sql-format': {
      const language = optionString(options, 'language', 'sql') as SqlLanguage
      return textResult(formatSql(source, { language, keywordCase: 'upper' }))
    }
    case 'line-sort': {
      const descending = optionBoolean(options, 'descending', false)
      const unique = optionBoolean(options, 'unique', true)
      let lines = source.split(/\r?\n/)
      if (unique) lines = [...new Set(lines)]
      lines.sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
      if (descending) lines.reverse()
      return textResult(lines.join('\n'), `${lines.length} lines`)
    }
    default:
      throw new Error(`Unknown format operation: ${id}`)
  }
}
