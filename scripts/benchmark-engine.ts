import { decode, detect } from '@decoding/engine'

const oneMib = JSON.stringify({ local: true, payload: 'x'.repeat(1024 * 1024 - 64) })
const first: number[] = []
const complete: number[] = []
for (let index = 0; index < 15; index += 1) {
  let started = performance.now()
  await detect(oneMib)
  first.push(performance.now() - started)
  started = performance.now()
  await decode(oneMib)
  complete.push(performance.now() - started)
}
const percentile = (values: number[], fraction: number) =>
  [...values].sort((a, b) => a - b)[Math.ceil(values.length * fraction) - 1] ??
  Number.POSITIVE_INFINITY
const firstP75 = percentile(first, 0.75)
const completeP75 = percentile(complete, 0.75)
if (firstP75 > 100)
  throw new Error(`1 MiB first candidate p75 ${firstP75.toFixed(1)}ms exceeds 100ms.`)
if (completeP75 > 300)
  throw new Error(`1 MiB complete p75 ${completeP75.toFixed(1)}ms exceeds 300ms.`)
console.log(
  `Engine benchmark passed: 1 MiB first p75 ${firstP75.toFixed(1)}ms; complete p75 ${completeP75.toFixed(1)}ms.`,
)
