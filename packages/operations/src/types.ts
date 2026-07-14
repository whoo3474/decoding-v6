export type OperationCategory = 'format' | 'convert' | 'inspect' | 'generate' | 'encode'
export type SecurityProfile = 'pure' | 'parser' | 'preview'

export type OperationDescriptor = {
  id: string
  name: string
  description: string
  category: OperationCategory
  aliases: string[]
  directions?: string[]
  securityProfile: SecurityProfile
  pack: 1 | 2 | 3 | 4
}

export type OperationInput = string | Uint8Array
export type OperationOptions = Record<string, string | number | boolean | undefined>

export type OperationResult = {
  output: string | Uint8Array | Record<string, unknown> | unknown[]
  kind: 'text' | 'bytes' | 'structured' | 'preview' | 'image'
  summary?: string
  warnings?: string[]
  metadata?: Record<string, unknown>
}

export type OperationRunner = (
  id: string,
  input: OperationInput,
  options?: OperationOptions,
) => Promise<OperationResult>
