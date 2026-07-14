import { defaultDetectors } from '@decoding/engine'
import { fixturesByDetector } from '@decoding/fixtures-public'
import { operations } from '@decoding/operations'
import { detectorSpecs } from '@decoding/spec-registry'

const detectorIds = defaultDetectors.map((detector) => detector.id).sort()
const specIds = detectorSpecs.map((entry) => entry.detector).sort()
const fixtureIds = [...fixturesByDetector.keys()].sort()
if (
  JSON.stringify(detectorIds) !== JSON.stringify(specIds) ||
  JSON.stringify(detectorIds) !== JSON.stringify(fixtureIds)
) {
  throw new Error(
    `Detector parity mismatch: engine=${detectorIds} specs=${specIds} fixtures=${fixtureIds}`,
  )
}
if (operations.length !== 47 || new Set(operations.map((operation) => operation.id)).size !== 47)
  throw new Error('Operation route/search parity requires 47 unique IDs.')
console.log(
  `Parity passed: ${detectorIds.length} detectors with specs/fixtures/pages; ${operations.length} operation routes.`,
)
