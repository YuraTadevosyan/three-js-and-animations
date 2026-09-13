import { makeRng } from '@/lib/rng'
import type { WeatherId, WeatherParams } from './state'

export interface WeatherProfile extends WeatherParams {
  label: string
  blurb: string
}

const profile = (
  label: string,
  blurb: string,
  p: Partial<WeatherParams>,
): WeatherProfile => ({
  label,
  blurb,
  cloud: 0,
  precip: 0,
  snowiness: 0,
  fog: 0,
  wind: 0.2,
  gloom: 0,
  aurora: 0,
  thunder: 0,
  ...p,
})

export const WEATHER: Record<WeatherId, WeatherProfile> = {
  clear: profile('Clear', 'Nothing in the way of the sun.', { cloud: 0.04, wind: 0.16 }),
  fair: profile('Fair', 'A few clouds, drifting east.', { cloud: 0.28, wind: 0.3 }),
  cloudy: profile('Cloudy', 'Broken cover, moving fast.', { cloud: 0.6, wind: 0.45, gloom: 0.16 }),
  overcast: profile('Overcast', 'A flat grey lid.', { cloud: 0.92, wind: 0.34, gloom: 0.42 }),
  mist: profile('Mist', 'Soft, close, quiet.', { cloud: 0.46, fog: 0.72, wind: 0.1, gloom: 0.3 }),
  drizzle: profile('Drizzle', 'Barely rain. Persistent.', {
    cloud: 0.78, precip: 0.3, fog: 0.22, wind: 0.32, gloom: 0.38,
  }),
  rain: profile('Rain', 'Proper rain. The garden likes it.', {
    cloud: 0.92, precip: 0.72, fog: 0.16, wind: 0.5, gloom: 0.5,
  }),
  storm: profile('Storm', 'Wind, water, and the occasional flash.', {
    cloud: 1, precip: 1, fog: 0.1, wind: 1.1, gloom: 0.66, thunder: 1,
  }),
  snow: profile('Snow', 'Slow, sideways, silent.', {
    cloud: 0.86, precip: 0.5, snowiness: 1, wind: 0.34, gloom: 0.24,
  }),
  aurora: profile('Aurora', 'The sky is showing off.', { cloud: 0.1, wind: 0.2, aurora: 1 }),
}

/**
 * Markov transition weights. Weather never teleports from clear to storm —
 * it has to walk there through fair, cloudy and rain, which is what makes the
 * sky feel like it has continuity instead of shuffling a deck every minute.
 */
const TRANSITIONS: Record<WeatherId, Partial<Record<WeatherId, number>>> = {
  clear: { clear: 3, fair: 6, aurora: 2, mist: 1 },
  fair: { clear: 4, fair: 3, cloudy: 5, mist: 1.5 },
  cloudy: { fair: 4, cloudy: 2, overcast: 4, drizzle: 2.5, mist: 1 },
  overcast: { cloudy: 4, overcast: 2, drizzle: 4, rain: 3, snow: 2, mist: 1.5 },
  mist: { mist: 2, fair: 3, cloudy: 3, drizzle: 2, clear: 1.5 },
  drizzle: { drizzle: 2, rain: 3.5, overcast: 4, cloudy: 2.5, mist: 2 },
  rain: { rain: 2.5, drizzle: 4, storm: 2, overcast: 4 },
  storm: { storm: 1.5, rain: 5, overcast: 3 },
  snow: { snow: 3, overcast: 4, cloudy: 2 },
  aurora: { aurora: 2.5, clear: 5, fair: 2 },
}

const SEASON_BIAS: Record<string, Partial<Record<WeatherId, number>>> = {
  winter: { snow: 3.2, storm: 0.4, clear: 0.8, mist: 1.4, aurora: 1.8 },
  spring: { drizzle: 1.6, fair: 1.3, snow: 0.15, storm: 0.9 },
  summer: { clear: 1.7, storm: 1.8, snow: 0, mist: 0.5 },
  autumn: { mist: 2.2, overcast: 1.4, rain: 1.3, snow: 0.3 },
}

const rng = makeRng((Date.now() ^ 0x5f3759df) >>> 0)

/** How long a system holds before rolling again — 80s to 220s. */
export const rollDwell = () => rng.range(80, 220)

export function nextWeather(
  current: WeatherId,
  season: string,
  daylight: number,
  temperature: number,
): WeatherId {
  const weights = { ...TRANSITIONS[current] }
  const bias = SEASON_BIAS[season] ?? {}

  for (const key of Object.keys(weights) as WeatherId[]) {
    weights[key] = (weights[key] ?? 0) * (bias[key] ?? 1)
  }

  // Hard gates: some skies only exist under the right conditions.
  if (daylight > 0.06) weights.aurora = 0
  if (temperature > 2.5) weights.snow = 0
  if (temperature < 0.5) weights.rain = (weights.rain ?? 0) * 0.2

  const entries = (Object.entries(weights) as [WeatherId, number][]).filter(([, w]) => w > 0)
  if (!entries.length) return 'fair'

  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = rng.next() * total
  for (const [id, w] of entries) {
    roll -= w
    if (roll <= 0) return id
  }
  return entries[entries.length - 1]![0]
}

const SEASON_BASE_TEMP: Record<string, number> = {
  winter: 1.5,
  spring: 13,
  summer: 25,
  autumn: 12,
}

export function temperatureFor(
  season: string,
  daylight: number,
  params: WeatherParams,
): number {
  const base = SEASON_BASE_TEMP[season] ?? 14
  return base + (daylight - 0.45) * 9 - params.cloud * 2.4 - params.precip * 2.2
}
