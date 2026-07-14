import { inputText } from '@decoding/engine'
import type { OperationInput, OperationOptions, OperationResult } from './types'

export function text(input: OperationInput): string {
  return inputText(input)
}

export function optionString(
  options: OperationOptions | undefined,
  key: string,
  fallback: string,
): string {
  const value = options?.[key]
  return typeof value === 'string' ? value : fallback
}

export function optionNumber(
  options: OperationOptions | undefined,
  key: string,
  fallback: number,
): number {
  const value = options?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function optionBoolean(
  options: OperationOptions | undefined,
  key: string,
  fallback: boolean,
): boolean {
  const value = options?.[key]
  return typeof value === 'boolean' ? value : fallback
}

export function textResult(output: string, summary?: string, warnings?: string[]): OperationResult {
  return {
    output,
    kind: 'text',
    ...(summary ? { summary } : {}),
    ...(warnings?.length ? { warnings } : {}),
  }
}

export function structuredResult(
  output: Record<string, unknown> | unknown[],
  summary?: string,
  warnings?: string[],
): OperationResult {
  return {
    output,
    kind: 'structured',
    ...(summary ? { summary } : {}),
    ...(warnings?.length ? { warnings } : {}),
  }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character] ?? character
  })
}
