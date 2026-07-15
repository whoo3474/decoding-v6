import type { Locale } from '../i18n/catalog'

export type SponsorCampaign = {
  id: string
  locale: Locale | 'global'
  label: string
  headline: string
  cta: string
  targetUrl: string
  imagePath: string
  imageAlt: string
  categories: string[]
  startsAt: string
  endsAt: string
}

const rasterAsset = /^\/sponsors\/[a-z0-9][a-z0-9/_-]*\.(?:avif|jpe?g|png|webp)$/
const forbiddenQueryKeys = /^(?:input|payload|token|secret|session|user|email|hash|filename)$/i

export function validateSponsor(value: unknown): SponsorCampaign {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Sponsor must be an object')
  const item = value as Record<string, unknown>
  for (const field of [
    'id',
    'locale',
    'label',
    'headline',
    'cta',
    'targetUrl',
    'imagePath',
    'imageAlt',
    'startsAt',
    'endsAt',
  ]) {
    if (typeof item[field] !== 'string' || !item[field].trim())
      throw new Error(`Sponsor ${field} is required`)
  }
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(item.id as string)) throw new Error('Sponsor id is invalid')
  const target = new URL(item.targetUrl as string)
  if (target.protocol !== 'https:') throw new Error('Sponsor target must use HTTPS')
  for (const key of target.searchParams.keys()) {
    if (forbiddenQueryKeys.test(key)) throw new Error(`Sponsor query key is forbidden: ${key}`)
  }
  if (!rasterAsset.test(item.imagePath as string))
    throw new Error('Sponsor image must be a same-origin raster asset')
  if (
    !Array.isArray(item.categories) ||
    !item.categories.length ||
    item.categories.some((entry) => typeof entry !== 'string' || !entry)
  ) {
    throw new Error('Sponsor categories must be a non-empty string array')
  }
  const start = Date.parse(item.startsAt as string)
  const end = Date.parse(item.endsAt as string)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
    throw new Error('Sponsor date range is invalid')
  return item as SponsorCampaign
}

export function selectSponsor(
  values: unknown[],
  locale: Locale,
  category: string,
  now = Date.now(),
): SponsorCampaign | undefined {
  return values
    .map(validateSponsor)
    .find(
      (item) =>
        (item.locale === 'global' || item.locale === locale) &&
        item.categories.includes(category) &&
        Date.parse(item.startsAt) <= now &&
        now < Date.parse(item.endsAt),
    )
}
