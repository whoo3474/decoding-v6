/// <reference lib="webworker" />
import { decode, type DecodeInput } from '@decoding/engine'
self.addEventListener('message', (event: MessageEvent<{ id: number; input: DecodeInput }>) => {
  void decode(event.data.input)
    .then((result) => self.postMessage({ id: event.data.id, result }))
    .catch((error: unknown) =>
      self.postMessage({
        id: event.data.id,
        error: error instanceof Error ? error.message : String(error),
      }),
    )
})
