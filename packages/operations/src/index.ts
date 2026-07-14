import { operationById, operations } from './registry'
import type { OperationInput, OperationOptions, OperationResult, OperationRunner } from './types'

const loaders: Record<string, () => Promise<OperationRunner>> = {
  format: async () => (await import('./format')).runFormat,
  convert: async () => (await import('./convert')).runConvert,
  inspect: async () => (await import('./inspect')).runInspect,
  generate: async () => (await import('./generate')).runGenerate,
  encode: async () => (await import('./encode')).runEncode,
}

export async function executeOperation(
  id: string,
  input: OperationInput,
  options?: OperationOptions,
): Promise<OperationResult> {
  const descriptor = operationById.get(id)
  if (!descriptor) throw new Error(`Unknown operation: ${id}`)
  const load = loaders[descriptor.category]
  if (!load) throw new Error(`No runtime for operation category: ${descriptor.category}`)
  return (await load())(id, input, options)
}

export { operationById, operations }
export type {
  OperationCategory,
  OperationDescriptor,
  OperationInput,
  OperationOptions,
  OperationResult,
  SecurityProfile,
} from './types'
