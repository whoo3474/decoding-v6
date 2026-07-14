/// <reference lib="webworker" />
import { decode, type DecodeInput } from '@decoding/engine'

self.addEventListener('message', (event: MessageEvent<{ id: number; input: DecodeInput }>) => {
  const { id, input } = event.data
  void decode(input)
    .then((result) => self.postMessage({ id, result }))
    .catch((error: unknown) =>
      self.postMessage({ id, error: error instanceof Error ? error.message : 'Decode failed.' }),
    )
})
