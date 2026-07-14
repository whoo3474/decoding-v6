import { detect } from '@decoding/engine'
import type { PublicFixture } from '@decoding/fixtures-public'

export type DetectorQuality = {
  detector: string
  truePositive: number
  falsePositive: number
  falseNegative: number
  trueNegative: number
  precision: number
  recall: number
}

export async function measureDetector(
  detector: string,
  fixtures: PublicFixture[],
): Promise<DetectorQuality> {
  let truePositive = 0
  let falsePositive = 0
  let falseNegative = 0
  let trueNegative = 0
  for (const fixture of fixtures.filter((item) => item.class !== 'edge')) {
    const found = (await detect(fixture.input)).some((candidate) => candidate.detector === detector)
    if (fixture.class === 'positive') {
      if (found) truePositive++
      else falseNegative++
    } else if (found) falsePositive++
    else trueNegative++
  }
  return {
    detector,
    truePositive,
    falsePositive,
    falseNegative,
    trueNegative,
    precision: truePositive / Math.max(1, truePositive + falsePositive),
    recall: truePositive / Math.max(1, truePositive + falseNegative),
  }
}
