/// <reference lib="webworker" />
import { executeOperation, type OperationInput, type OperationOptions } from '@decoding/operations'

self.addEventListener(
  'message',
  (
    event: MessageEvent<{
      id: number
      operation: string
      input: OperationInput
      options?: OperationOptions
    }>,
  ) => {
    const { id, operation, input, options } = event.data
    void executeOperation(operation, input, options)
      .then((result) => self.postMessage({ id, result }))
      .catch((error: unknown) =>
        self.postMessage({
          id,
          error: error instanceof Error ? error.message : 'Operation failed.',
        }),
      )
  },
)
