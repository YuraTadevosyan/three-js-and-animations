import { hsl, mixHsl } from '@/lib/color'
import { clamp, remap } from '@/lib/math'
import type { Palette } from './state'

/**
 * Latitude the stylised solar model is evaluated at. The real date decides the
 * season and therefore the day length, but we don't ask the visitor for their
 * coordinates — 40°N is a reasonable stand-in for "northern temperate".
 */
export const LATITUDE = 40

interface Keyframe {
  hour: number
  name: string
  palette: Palette
}

const pal = (p: Palette) => p

/**
 * Seven palettes around the clock. Everything else is interpolated.
 * Note how the day keyframes are light-on-dark-text and the night keyframes
 * invert — the site genuinely changes mode, it isn't just dimming.
 */
const KEYFRAMES: Keyframe[] = [
  {
    hour: 0,
    name: 'deep night',
    palette: pal({
      background: hsl(232, 42, 6),
      foreground: hsl(220, 30, 90),
      card: hsl(232, 36, 11),
      cardForeground: hsl(220, 30, 92),
      muted: hsl(232, 28, 16),
      mutedForeground: hsl(224, 18, 64),
      border: hsl(232, 26, 20),
      primary: hsl(258, 78, 68),
      primaryForeground: hsl(232, 42, 8),
      accent: hsl(190, 72, 62),
      accentForeground: hsl(232, 42, 8),
      canopy: hsl(152, 34, 44),
      soil: hsl(24, 24, 14),
      glow: hsl(258, 80, 70),
      skyTop: hsl(238, 52, 7),
      skyMid: hsl(248, 44, 13),
      skyBottom: hsl(262, 38, 21),
      sun: hsl(220, 30, 92),
    }),
  },
  {
    hour: 5.2,
    name: 'first light',
    palette: pal({
      background: hsl(236, 40, 14),
      foreground: hsl(220, 34, 92),
      card: hsl(238, 34, 19),
      cardForeground: hsl(220, 32, 94),
      muted: hsl(238, 26, 24),
      mutedForeground: hsl(228, 20, 70),
      border: hsl(238, 24, 28),
      primary: hsl(282, 70, 70),
      primaryForeground: hsl(236, 40, 12),
      accent: hsl(202, 76, 66),
      accentForeground: hsl(236, 40, 12),
      canopy: hsl(154, 32, 46),
      soil: hsl(24, 22, 18),
      glow: hsl(292, 70, 68),
      skyTop: hsl(232, 50, 16),
      skyMid: hsl(268, 44, 28),
      skyBottom: hsl(330, 48, 44),
      sun: hsl(28, 90, 70),
    }),
  },
  {
    hour: 7.2,
    name: 'sunrise',
    palette: pal({
      background: hsl(28, 52, 92),
      foreground: hsl(232, 32, 18),
      card: hsl(30, 60, 96),
      cardForeground: hsl(232, 34, 16),
      muted: hsl(28, 38, 86),
      mutedForeground: hsl(228, 16, 42),
      border: hsl(28, 32, 80),
      primary: hsl(14, 82, 56),
      primaryForeground: hsl(30, 60, 97),
      accent: hsl(194, 70, 44),
      accentForeground: hsl(30, 60, 97),
      canopy: hsl(140, 44, 36),
      soil: hsl(24, 34, 28),
      glow: hsl(24, 92, 62),
      skyTop: hsl(206, 66, 62),
      skyMid: hsl(28, 82, 74),
      skyBottom: hsl(14, 88, 66),
      sun: hsl(36, 96, 66),
    }),
  },
  {
    hour: 12,
    name: 'midday',
    palette: pal({
      background: hsl(204, 44, 95),
      foreground: hsl(216, 36, 16),
      card: hsl(0, 0, 100),
      cardForeground: hsl(216, 38, 14),
      muted: hsl(206, 34, 89),
      mutedForeground: hsl(214, 14, 40),
      border: hsl(206, 28, 83),
      primary: hsl(152, 54, 32),
      primaryForeground: hsl(150, 40, 97),
      accent: hsl(208, 84, 44),
      accentForeground: hsl(208, 60, 97),
      canopy: hsl(138, 48, 34),
      soil: hsl(26, 32, 26),
      glow: hsl(48, 96, 60),
      skyTop: hsl(212, 78, 52),
      skyMid: hsl(202, 76, 66),
      skyBottom: hsl(196, 68, 82),
      sun: hsl(48, 100, 72),
    }),
  },
  {
    hour: 17.6,
    name: 'golden hour',
    palette: pal({
      background: hsl(32, 48, 90),
      foreground: hsl(24, 34, 16),
      card: hsl(34, 56, 95),
      cardForeground: hsl(24, 36, 14),
      muted: hsl(32, 36, 84),
      mutedForeground: hsl(26, 18, 40),
      border: hsl(32, 30, 78),
      primary: hsl(18, 78, 48),
      primaryForeground: hsl(34, 60, 97),
      accent: hsl(268, 58, 50),
      accentForeground: hsl(34, 60, 97),
      canopy: hsl(132, 40, 34),
      soil: hsl(22, 34, 24),
      glow: hsl(32, 96, 60),
      skyTop: hsl(216, 62, 56),
      skyMid: hsl(32, 80, 68),
      skyBottom: hsl(12, 84, 62),
      sun: hsl(32, 98, 64),
    }),
  },
  {
    hour: 20.4,
    name: 'dusk',
    palette: pal({
      background: hsl(268, 34, 18),
      foreground: hsl(42, 40, 92),
      card: hsl(268, 30, 23),
      cardForeground: hsl(40, 36, 94),
      muted: hsl(268, 22, 28),
      mutedForeground: hsl(274, 14, 72),
      border: hsl(268, 20, 32),
      primary: hsl(340, 74, 64),
      primaryForeground: hsl(268, 34, 14),
      accent: hsl(34, 88, 62),
      accentForeground: hsl(268, 34, 14),
      canopy: hsl(150, 30, 42),
      soil: hsl(24, 26, 18),
      glow: hsl(336, 82, 64),
      skyTop: hsl(252, 48, 20),
      skyMid: hsl(292, 46, 34),
      skyBottom: hsl(18, 68, 48),
      sun: hsl(20, 92, 62),
    }),
  },
  // Wraps back to `deep night`; the hour is 24 so interpolation closes the loop.
  { hour: 24, name: 'deep night', palette: null as unknown as Palette },
]
KEYFRAMES[KEYFRAMES.length - 1]!.palette = KEYFRAMES[0]!.palette

const PALETTE_KEYS = Object.keys(KEYFRAMES[0]!.palette) as (keyof Palette)[]

/** Interpolate the full palette at any decimal hour. */
export function paletteAt(hour: number): { palette: Palette; phase: string } {
  const h = ((hour % 24) + 24) % 24
  let i = 0
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1]!.hour <= h) i++

  const a = KEYFRAMES[i]!
  const b = KEYFRAMES[i + 1]!
  const t = clamp((h - a.hour) / (b.hour - a.hour))

  const palette = {} as Palette
  for (const key of PALETTE_KEYS) palette[key] = mixHsl(a.palette[key], b.palette[key], t)

  return { palette, phase: t < 0.5 ? a.name : b.name }
}

/**
 * Day length from the real calendar date. This is the standard sunrise
 * equation with a solar declination approximation — simplified (no equation
 * of time, no atmospheric refraction) but it does mean a December visit gets
 * a genuinely short day and a June visit a long one.
 */
export function solarDay(date: Date): { sunrise: number; sunset: number } {
  const start = Date.UTC(date.getFullYear(), 0, 0)
  const doy = Math.floor((date.getTime() - start) / 86400000)

  const declination = 23.44 * Math.sin((2 * Math.PI * (doy - 81)) / 365.25)
  const latRad = (LATITUDE * Math.PI) / 180
  const decRad = (declination * Math.PI) / 180

  // Outside the polar circles this stays in range; clamp guards the rest.
  const cosH = clamp(-Math.tan(latRad) * Math.tan(decRad), -1, 1)
  const halfDay = (Math.acos(cosH) * 180) / Math.PI / 15

  return { sunrise: 12 - halfDay, sunset: 12 + halfDay }
}

/** -1..1 sun height, plus where to draw the disc. */
export function solarPosition(hour: number, sunrise: number, sunset: number) {
  const dayLength = sunset - sunrise
  const nightLength = 24 - dayLength
  let elevation: number
  let track: number

  if (hour >= sunrise && hour <= sunset) {
    track = (hour - sunrise) / dayLength
    elevation = Math.sin(Math.PI * track)
  } else {
    const nightHour = hour < sunrise ? hour + 24 : hour
    track = (nightHour - sunset) / nightLength
    elevation = -Math.sin(Math.PI * track)
  }

  return {
    elevation,
    // The disc arcs left to right across the sky over its half of the cycle.
    sunX: 0.08 + track * 0.84,
    sunY: 1 - (0.12 + Math.abs(elevation) * 0.74),
    daylight: clamp(remap(elevation, -0.14, 0.2, 0, 1)),
  }
}

export function seasonOf(date: Date): 'winter' | 'spring' | 'summer' | 'autumn' {
  const m = date.getMonth()
  if (m <= 1 || m === 11) return 'winter'
  if (m <= 4) return 'spring'
  if (m <= 7) return 'summer'
  return 'autumn'
}

export interface SeasonMix {
  winter: number
  spring: number
  summer: number
  autumn: number
}

/** 0..1 through the calendar year. */
export function yearPhase(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0)
  const doy = (date.getTime() - start) / 86400000
  return ((doy / 365.25) % 1 + 1) % 1
}

/** Shortest distance between two points on a circle of circumference 1. */
const circularDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 1
  return Math.min(d, 1 - d)
}

/**
 * Centres of each season, as a fraction of the year — roughly Jan 20, Apr 21,
 * Jul 22, Oct 21.
 *
 * They are spaced at exactly 0.25. With a triangular window of the same width
 * that makes the four weights a partition of unity: they sum to exactly 1 on
 * every day of the year. Nudging a centre by a day or two to match a "real"
 * mid-season date breaks that and leaves the total wobbling by a couple of
 * percent, which then shows up in the growth rate.
 */
const CENTRES: Record<keyof SeasonMix, number> = {
  winter: 0.055,
  spring: 0.305,
  summer: 0.555,
  autumn: 0.805,
}

const SPAN = 0.25

/**
 * Continuous season weights, summing to roughly 1.
 *
 * `seasonOf` returns a label, which is all the weather table needs — but a
 * label steps on the first of a month, and a canopy that turns gold overnight
 * looks like a bug. These weights cross-fade, so mid-October is mostly autumn
 * with summer still bleeding through.
 */
export function seasonMix(date: Date): SeasonMix {
  const phase = yearPhase(date)
  const weight = (centre: number) => clamp(1 - circularDistance(phase, centre) / SPAN)
  return {
    winter: weight(CENTRES.winter),
    spring: weight(CENTRES.spring),
    summer: weight(CENTRES.summer),
    autumn: weight(CENTRES.autumn),
  }
}

/**
 * Seasonal multiplier on growth. Spring is the strongest, winter barely moves,
 * and the range is deliberately wide enough to be felt across a few visits.
 */
export const growthSeasonFactor = (mix: SeasonMix) =>
  0.45 + mix.spring * 0.75 + mix.summer * 0.65 + mix.autumn * 0.3 + mix.winter * 0.05
