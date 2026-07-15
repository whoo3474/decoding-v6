import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateSponsor } from '../apps/web/src/lib/sponsors'

const path = resolve('apps/web/src/content/sponsors.json')
const values = JSON.parse(readFileSync(path, 'utf8')) as unknown
if (!Array.isArray(values)) throw new Error('sponsors.json must contain an array')

for (const value of values) {
  const sponsor = validateSponsor(value)
  if (!existsSync(resolve('apps/web/public', sponsor.imagePath.slice(1)))) {
    throw new Error(`${sponsor.id}: sponsor image does not exist`)
  }
}

const validFixture = {
  id: 'fixture-sponsor',
  locale: 'global',
  label: 'Sponsored',
  headline: 'Synthetic fixture',
  cta: 'Learn more',
  targetUrl: 'https://example.invalid/sponsor',
  imagePath: '/sponsors/fixture.webp',
  imageAlt: 'Fixture',
  categories: ['format'],
  startsAt: '2026-01-01T00:00:00Z',
  endsAt: '2027-01-01T00:00:00Z',
}
validateSponsor(validFixture)
for (const invalid of [
  { ...validFixture, targetUrl: 'http://example.invalid/' },
  { ...validFixture, targetUrl: 'https://example.invalid/?payload=secret' },
  { ...validFixture, imagePath: 'https://example.invalid/ad.svg' },
  { ...validFixture, endsAt: validFixture.startsAt },
]) {
  let rejected = false
  try {
    validateSponsor(invalid)
  } catch {
    rejected = true
  }
  if (!rejected) throw new Error('Unsafe sponsor fixture was accepted')
}

const component = readFileSync(resolve('apps/web/src/components/SponsorSlot.astro'), 'utf8')
for (const contract of ['rel="sponsored noopener noreferrer"', 'loading="lazy"', 'sponsor-label']) {
  if (!component.includes(contract)) throw new Error(`Sponsor component is missing ${contract}`)
}

console.log(`sponsors: ${values.length} configured; none fallback and safety contract OK`)
