import type { DecodeInput, DecodeResult } from '@decoding/engine'
import { DecoderWorkbench } from '@decoding/workbench-ui'
import { useEffect, useMemo } from 'preact/hooks'

export default function EngineWorkbench({
  externalInput,
}: {
  externalInput?: { id: number; value: string } | undefined
}) {
  const client = useMemo(() => {
    const worker = new Worker(new URL('./workers/decoder.worker.ts', import.meta.url), {
      type: 'module',
    })
    const pending = new Map<
      number,
      { resolve: (result: DecodeResult) => void; reject: (error: Error) => void }
    >()
    let id = 0
    worker.onmessage = (
      event: MessageEvent<{ id: number; result?: DecodeResult; error?: string }>,
    ) => {
      const request = pending.get(event.data.id)
      if (!request) return
      pending.delete(event.data.id)
      if (event.data.error) request.reject(new Error(event.data.error))
      else if (event.data.result) request.resolve(event.data.result)
    }
    return {
      worker,
      decodeInput(input: DecodeInput) {
        const requestId = ++id
        return new Promise<DecodeResult>((resolve, reject) => {
          pending.set(requestId, { resolve, reject })
          worker.postMessage({ id: requestId, input })
        })
      },
    }
  }, [])
  useEffect(() => () => client.worker.terminate(), [client])
  return <DecoderWorkbench decodeInput={client.decodeInput} externalInput={externalInput} />
}
