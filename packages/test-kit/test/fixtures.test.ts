import { detect } from '@decoding/engine'
import { fixturesByDetector, publicFixtures } from '@decoding/fixtures-public'
import { detectorSpecs } from '@decoding/spec-registry'
import { describe, expect, it } from 'vitest'
import { measureDetector } from '../src/index'

describe('public detector fixture gate', () => {
  it('has the required public counts and official references', () => {
    expect(fixturesByDetector.size).toBe(8)
    expect(detectorSpecs).toHaveLength(8)
    for (const [detector, fixtures] of fixturesByDetector) {
      expect(
        fixtures.filter((fixture) => fixture.class === 'positive'),
        detector,
      ).toHaveLength(20)
      expect(
        fixtures.filter((fixture) => fixture.class === 'edge'),
        detector,
      ).toHaveLength(10)
      expect(
        fixtures.filter((fixture) => fixture.class === 'negative'),
        detector,
      ).toHaveLength(20)
      expect(detectorSpecs.some((entry) => entry.detector === detector)).toBe(true)
    }
  })

  it('meets public precision and recall thresholds per detector', async () => {
    for (const detector of fixturesByDetector.keys()) {
      const quality = await measureDetector(
        detector,
        publicFixtures.filter((fixture) => fixture.detector === detector),
      )
      expect(quality.precision, `${detector} precision`).toBeGreaterThanOrEqual(0.95)
      expect(quality.recall, `${detector} recall`).toBeGreaterThanOrEqual(0.9)
    }
  })

  it('recognizes every documented edge fixture without crashing', async () => {
    for (const fixture of publicFixtures.filter((item) => item.class === 'edge')) {
      const candidates = await detect(fixture.input)
      expect(
        candidates.some((candidate) => candidate.detector === fixture.detector),
        fixture.id,
      ).toBe(true)
    }
  })
})
