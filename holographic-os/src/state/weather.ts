import { signal } from '@preact/signals'
import { clamp, lerp, makeNoise, makeRng } from '@/lib/util'

/**
 * A self-contained atmospheric simulation.
 *
 * No network, no API key: conditions evolve through a weighted Markov chain
 * while temperature, pressure and wind drift on value noise. Each station has
 * its own climate personality, so switching stations visibly changes the model
 * rather than just relabelling it. Everything here is fictional by design —
 * these are in-world monitoring stations, not real forecasts.
 */

export type Condition = 'clear' | 'partly' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog'

export interface Station {
  id: string
  name: string
  coords: string
  /** Mean temperature in °C. */
  baseTemp: number
  /** Daily swing amplitude. */
  swing: number
  /** 0–1, how strongly the chain is pulled toward precipitation. */
  wetness: number
  /** Below this temperature, rain falls as snow. */
  freezes: boolean
}

export const STATIONS: Station[] = [
  { id: 'helios', name: 'Helios Station', coords: '40.18°N 44.51°E', baseTemp: 19, swing: 8, wetness: 0.3, freezes: false },
  { id: 'meridian', name: 'Meridian Array', coords: '51.51°N 0.13°W', baseTemp: 11, swing: 5, wetness: 0.62, freezes: false },
  { id: 'vantage', name: 'Vantage Ridge', coords: '64.14°N 21.94°W', baseTemp: -4, swing: 6, wetness: 0.55, freezes: true },
  { id: 'kiln', name: 'Kiln Basin', coords: '24.71°N 46.68°E', baseTemp: 34, swing: 11, wetness: 0.06, freezes: false },
]

export interface CurrentWeather {
  condition: Condition
  tempC: number
  feelsLike: number
  humidity: number
  pressure: number
  windKph: number
  windDir: number
  gustKph: number
  uv: number
  visibilityKm: number
  cloudCover: number
  /** 0–1 precipitation intensity, drives the canvas particle field. */
  intensity: number
  dewPoint: number
}

export interface HourPoint {
  hour: number
  tempC: number
  condition: Condition
  precipChance: number
}

export interface DayPoint {
  label: string
  min: number
  max: number
  condition: Condition
  precipChance: number
  windKph: number
}

export const CONDITION_LABEL: Record<Condition, string> = {
  clear: 'Clear',
  partly: 'Partly cloudy',
  cloudy: 'Overcast',
  rain: 'Rain',
  storm: 'Thunderstorm',
  snow: 'Snow',
  fog: 'Fog',
}

/** Transition weights, before the station's wetness bias is applied. */
const CHAIN: Record<Condition, Array<[Condition, number]>> = {
  clear: [['clear', 0.72], ['partly', 0.24], ['fog', 0.04]],
  partly: [['partly', 0.54], ['clear', 0.22], ['cloudy', 0.22], ['rain', 0.02]],
  cloudy: [['cloudy', 0.5], ['partly', 0.24], ['rain', 0.22], ['fog', 0.04]],
  rain: [['rain', 0.52], ['cloudy', 0.28], ['storm', 0.14], ['partly', 0.06]],
  storm: [['storm', 0.38], ['rain', 0.46], ['cloudy', 0.16]],
  snow: [['snow', 0.58], ['cloudy', 0.3], ['partly', 0.12]],
  fog: [['fog', 0.5], ['cloudy', 0.28], ['partly', 0.22]],
}

const WET: ReadonlySet<Condition> = new Set<Condition>(['rain', 'storm', 'snow'])

export const station = signal<Station>(STATIONS[0])
export const current = signal<CurrentWeather>(buildInitial(STATIONS[0]))
export const hourly = signal<HourPoint[]>([])
export const daily = signal<DayPoint[]>([])

const noiseTemp = makeNoise(5150)
const noiseWind = makeNoise(8112)
const noisePress = makeNoise(3003)
const rng = makeRng(60606)

let condition: Condition = 'partly'
let t = 0
let sinceTransition = 0
let timer: number | null = null

function cloudFor(c: Condition): number {
  switch (c) {
    case 'clear':
      return 4
    case 'partly':
      return 38
    case 'cloudy':
      return 88
    case 'rain':
      return 92
    case 'storm':
      return 98
    case 'snow':
      return 90
    case 'fog':
      return 76
  }
}

function intensityFor(c: Condition): number {
  switch (c) {
    case 'rain':
      return 0.55
    case 'storm':
      return 1
    case 'snow':
      return 0.45
    case 'fog':
      return 0.25
    default:
      return 0
  }
}

/** Diurnal curve: coldest ~05:00, warmest ~15:00. */
function diurnal(hour: number): number {
  return -Math.cos(((hour - 5) / 24) * Math.PI * 2)
}

function tempAt(s: Station, hour: number, drift: number): number {
  return s.baseTemp + diurnal(hour) * s.swing * 0.5 + drift
}

function buildInitial(s: Station): CurrentWeather {
  const hour = new Date().getHours()
  const temp = tempAt(s, hour, 0)
  return {
    condition: 'partly',
    tempC: temp,
    feelsLike: temp - 1,
    humidity: 52,
    pressure: 1013,
    windKph: 9,
    windDir: 210,
    gustKph: 14,
    uv: 3,
    visibilityKm: 18,
    cloudCover: 38,
    intensity: 0,
    dewPoint: temp - 6,
  }
}

function nextCondition(s: Station): Condition {
  const rows = CHAIN[condition]
  // Bias the chain toward (or away from) wet states for this station's climate.
  const weighted = rows.map(([c, w]) => {
    const bias = WET.has(c) ? 0.35 + s.wetness * 1.6 : 1
    return [c, w * bias] as [Condition, number]
  })
  const total = weighted.reduce((sum, [, w]) => sum + w, 0)
  let r = rng() * total
  for (const [c, w] of weighted) {
    r -= w
    if (r <= 0) return c
  }
  return condition
}

function step(): void {
  const s = station.peek()
  t += 1
  sinceTransition += 1

  // Re-roll the chain every ~14 s so the sky visibly changes while watched.
  if (sinceTransition >= 14) {
    sinceTransition = 0
    let next = nextCondition(s)
    // Cold stations turn rain into snow; warm ones never snow.
    if (WET.has(next)) next = s.freezes ? 'snow' : next === 'snow' ? 'rain' : next
    condition = next
  }

  const prev = current.peek()
  const hour = new Date().getHours() + new Date().getMinutes() / 60
  const drift = (noiseTemp(t * 0.02) - 0.5) * s.swing
  const cloud = cloudFor(condition)

  // Cloud cover damps the diurnal swing; precipitation cools further.
  const target =
    tempAt(s, hour, drift) - (cloud / 100) * 3.2 - (WET.has(condition) ? 2.4 : 0)
  const tempC = lerp(prev.tempC, target, 0.06)

  const windBase = 6 + noiseWind(t * 0.05) * 22
  const windKph = lerp(prev.windKph, windBase + (condition === 'storm' ? 26 : 0), 0.08)
  const gustKph = windKph * (1.3 + noiseWind(t * 0.4 + 9) * 0.6)
  const windDir = (prev.windDir + (noiseWind(t * 0.03 + 40) - 0.5) * 6 + 360) % 360

  const pressure = lerp(
    prev.pressure,
    1013 + (noisePress(t * 0.015) - 0.5) * 34 - (condition === 'storm' ? 16 : 0),
    0.05,
  )

  const humidity = lerp(
    prev.humidity,
    clamp(38 + cloud * 0.5 + (WET.has(condition) ? 22 : 0) + (condition === 'fog' ? 26 : 0), 10, 99),
    0.07,
  )

  const dewPoint = tempC - (100 - humidity) / 5
  const feelsLike = tempC - (windKph > 12 ? (windKph - 12) * 0.12 : 0) + (humidity > 75 && tempC > 22 ? 2.4 : 0)

  const visibilityKm =
    condition === 'fog' ? 0.4 + rng() * 0.8 : condition === 'storm' ? 3 + rng() * 3 : WET.has(condition) ? 8 + rng() * 5 : 16 + rng() * 8

  const uv = clamp(Math.round((1 - cloud / 110) * 9 * Math.max(0, diurnal(hour) * 0.5 + 0.5)), 0, 11)

  current.value = {
    condition,
    tempC,
    feelsLike,
    humidity,
    pressure,
    windKph,
    windDir,
    gustKph,
    uv,
    visibilityKm,
    cloudCover: lerp(prev.cloudCover, cloud, 0.06),
    intensity: lerp(prev.intensity, intensityFor(condition), 0.05),
    dewPoint,
  }

  if (t % 10 === 0) rebuildForecast(s)
}

/** Regenerates the 24 h and 7 d outlooks from the current state. */
function rebuildForecast(s: Station): void {
  const now = new Date()
  const startHour = now.getHours()
  let c: Condition = condition

  const hours: HourPoint[] = []
  for (let i = 0; i < 24; i++) {
    const hour = (startHour + i) % 24
    if (i > 0 && i % 3 === 0) {
      c = nextCondition(s)
      if (WET.has(c) && s.freezes) c = 'snow'
      if (c === 'snow' && !s.freezes) c = 'rain'
    }
    hours.push({
      hour,
      tempC: tempAt(s, hour, (noiseTemp(t * 0.02 + i * 0.3) - 0.5) * s.swing) - (cloudFor(c) / 100) * 3,
      condition: c,
      precipChance: WET.has(c) ? 55 + rng() * 40 : c === 'cloudy' ? 18 + rng() * 22 : rng() * 12,
    })
  }
  hourly.value = hours

  const labels = ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days: DayPoint[] = []
  let dc: Condition = condition
  for (let i = 0; i < 7; i++) {
    if (i > 0) {
      dc = nextCondition(s)
      if (WET.has(dc) && s.freezes) dc = 'snow'
      if (dc === 'snow' && !s.freezes) dc = 'rain'
    }
    const d = new Date(now.getTime() + i * 86400000)
    const mid = s.baseTemp + (noiseTemp(t * 0.01 + i * 1.7) - 0.5) * s.swing * 1.6
    days.push({
      label: i === 0 ? labels[0] : weekday[d.getDay()],
      min: mid - s.swing * 0.55 - (WET.has(dc) ? 1.5 : 0),
      max: mid + s.swing * 0.55 - (cloudFor(dc) / 100) * 2.5,
      condition: dc,
      precipChance: WET.has(dc) ? 50 + rng() * 45 : dc === 'cloudy' ? 15 + rng() * 25 : rng() * 15,
      windKph: 5 + rng() * 28 + (dc === 'storm' ? 20 : 0),
    })
  }
  daily.value = days
}

export function setStation(id: string): void {
  const s = STATIONS.find((x) => x.id === id)
  if (!s) return
  station.value = s
  condition = s.freezes ? 'snow' : s.wetness > 0.5 ? 'cloudy' : 'clear'
  sinceTransition = 0
  // Jump most of the way to the new climate so the switch reads instantly,
  // then let the simulation ease in the rest.
  const hour = new Date().getHours()
  current.value = {
    ...current.peek(),
    condition,
    tempC: lerp(current.peek().tempC, tempAt(s, hour, 0), 0.85),
    cloudCover: cloudFor(condition),
    intensity: intensityFor(condition),
  }
  rebuildForecast(s)
}

export function startWeather(): () => void {
  if (timer !== null) return () => {}
  rebuildForecast(station.peek())
  step()
  timer = window.setInterval(step, 1000)
  return () => {
    if (timer !== null) window.clearInterval(timer)
    timer = null
  }
}
