import type {
  OperationDescriptor,
  OperationInput,
  OperationOptions,
  OperationResult,
} from '@decoding/operations'
import { ToolWorkbench } from '@decoding/workbench-ui'
import type { ToolMessages } from '@decoding/workbench-ui'
import { useEffect, useMemo } from 'preact/hooks'

type Pending = { resolve: (result: OperationResult) => void; reject: (error: Error) => void }

export default function WebTool({
  operation,
  messages,
}: {
  operation: OperationDescriptor
  messages: ToolMessages
}) {
  const client = useMemo(() => {
    const worker = new Worker(new URL('../workers/operation.worker.ts', import.meta.url), {
      type: 'module',
    })
    const pending = new Map<number, Pending>()
    let id = 0
    worker.onmessage = (
      event: MessageEvent<{ id: number; result?: OperationResult; error?: string }>,
    ) => {
      const request = pending.get(event.data.id)
      if (!request) return
      pending.delete(event.data.id)
      if (event.data.error) request.reject(new Error(event.data.error))
      else if (event.data.result) request.resolve(event.data.result)
    }
    return {
      worker,
      execute(operationId: string, input: OperationInput, options?: OperationOptions) {
        const requestId = ++id
        return new Promise<OperationResult>((resolve, reject) => {
          pending.set(requestId, { resolve, reject })
          worker.postMessage({ id: requestId, operation: operationId, input, options })
        })
      },
    }
  }, [])
  useEffect(() => () => client.worker.terminate(), [client])
  return <ToolWorkbench operation={operation} execute={client.execute} messages={messages} />
}
