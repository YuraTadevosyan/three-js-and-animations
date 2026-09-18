import { clamp, damp } from '@/lib/math'
import { fbm2D } from '@/lib/rng'
import { Attention } from './attention'
import { tickBreath } from './breath'
import { Bus } from './bus'
import { paletteAt, seasonMix, seasonOf, solarDay, solarPosition } from './circadian'
import { Heartbeat } from './clock'
import { Garden, MAX_PLANTS } from './garden'
import { Fauna } from './pollinators'
import { forget, load, save } from './persistence'
import type { OrganismState, WeatherId, WeatherParams } from './state'
import { ThemeWriter } from './theme'
import { Voice } from './voice'
import { nextWeather, rollDwell, temperatureFor, WEATHER } from './weather'

export * from './state'
export { MATURITY, MAX_PLANTS, LIFESPAN, stageOf, revealOf, witherOf } from './garden'
export { WEATHER } from './weather'
export { isInFlower } from './garden'
export type { FlowerSite } from './pollinators'
export { breathCurve } from './breath'
export { paletteAt, LATITUDE, seasonMix, growthSeasonFactor } from './circadian'
export type { SeasonMix } from './circadian'

/** Local time as a decimal hour, 0..24. */
export function hourNow(d = new Date()): number {
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
}

const emptyParams = (): WeatherParams => ({
  cloud: 0, precip: 0, snowiness: 0, fog: 0, wind: 0.2, gloom: 0, aurora: 0, thunder: 0,
})

function createState(): OrganismState {
  const now = Date.now()
  const date = new Date(now)
  const hour = hourNow(date)
  const { sunrise, sunset } = solarDay(date)
  const sun = solarPosition(hour, sunrise, sunset)
  const { palette, phase } = paletteAt(hour)

  return {
    prefs: { reducedMotion: false },
    viewport: { w: 1280, h: 800, scrollY: 0, scrollProgress: 0, scrollVelocity: 0 },
    time: { now, elapsed: 0, dt: 0, hour, scrub: null },
    breath: { phase: 0, value: -1, rate: 8, depth: 0.8, count: 0 },
    circadian: {
      hour, sunrise, sunset,
      elevation: sun.elevation,
      daylight: sun.daylight,
      sunX: sun.sunX,
      sunY: sun.sunY,
      phase,
      palette,
    },
    weather: {
      current: 'fair',
      since: 0,
      dwell: rollDwell(),
      params: emptyParams(),
      target: emptyParams(),
      wind: 0.2,
      wetness: 0.4,
      temperature: 14,
      season: seasonOf(date),
      seasonMix: seasonMix(date),
      snowpack: 0,
      flash: 0,
    },
    attention: {
      x: 0, y: 0, nx: 0, ny: 0,
      inside: false, speed: 0, idleMs: 0,
      mood: 'awake', dream: 0, excitement: 0, interactions: 0,
    },
    garden: { plants: [], fertility: 0.5, generations: 0, hybrids: 0, pollinations: 0 },
    fauna: { pollinators: [], flowers: 0, capacity: 0, carrying: 0 },
    vitals: { fps: 60, age: 0, visits: 1, ticks: 0, organs: 0 },
  }
}

const PARAM_KEYS = Object.keys(emptyParams()) as (keyof WeatherParams)[]

class Organism {
  readonly state = createState()
  readonly bus = new Bus()
  readonly heart = new Heartbeat(this.state)
  readonly garden = new Garden(this.state, this.bus)
  readonly fauna = new Fauna(this.state, this.bus)
  readonly voice = new Voice(this.bus)
  readonly attention = new Attention(this.state, this.bus)
  readonly theme = new ThemeWriter()

  #booted = false
  #bornAt = Date.now()
  #saveAccum = 0
  #windDir = 1
  #windDirTarget = 1
  #weatherLocked = false

  get bornAt() {
    return this.#bornAt
  }

  /** Per-frame subscription. Prefer this over your own rAF loop. */
  subscribe = (fn: (dt: number, state: OrganismState) => void) => this.heart.subscribe(fn)

  on: Bus['on'] = (event, fn) => this.bus.on(event, fn)

  boot() {
    if (this.#booted || typeof window === 'undefined') return
    this.#booted = true

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.state.prefs.reducedMotion = media.matches
    media.addEventListener('change', (e) => {
      this.state.prefs.reducedMotion = e.matches
    })

    this.#restore()
    this.attention.attach()

    // Paint the palette before the first frame so there is no flash of the
    // stylesheet's fallback colours.
    this.theme.write(this.state.circadian.palette, true)
    this.theme.setScheme(this.state.circadian.daylight)

    this.heart.subscribe(this.#tick)
    this.heart.start()

    // A visitor who had sound on last time still needs a gesture before the
    // browser will let it play, so the next interaction is armed rather than
    // prompting for one.
    this.voice.armFromMemory()

    addEventListener('pagehide', this.#persist)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.#persist()
    })
  }

  #restore() {
    const saved = load()
    const now = Date.now()

    if (saved) {
      this.#bornAt = saved.bornAt
      this.state.vitals.visits = saved.visits + 1
      this.state.garden.generations = saved.generations
      this.state.garden.pollinations = saved.pollinations
      this.state.garden.fertility = saved.fertility
      this.state.garden.plants = saved.plants
      for (const plant of saved.plants) if (plant.parents) this.state.garden.hybrids++

      const awayMs = Math.max(0, now - saved.lastSeen)
      const grewBy = this.garden.catchUp(awayMs)
      // Announce it once the page has had a chance to attach listeners.
      queueMicrotask(() => this.bus.emit('returned', { awayMs, grewBy }))
    } else {
      // A first visit shouldn't land on bare soil. Three seedlings, staggered
      // in age so the bed already has a sense of history.
      for (let i = 0; i < 3; i++) {
        const plant = this.garden.plant({ x: 0.2 + i * 0.3 })
        if (plant) plant.age = 0.08 + i * 0.11
      }
    }

    if (this.state.garden.plants.length === 0) this.garden.plant()
  }

  #persist = () => {
    save({
      bornAt: this.#bornAt,
      lastSeen: Date.now(),
      visits: this.state.vitals.visits,
      generations: this.state.garden.generations,
      pollinations: this.state.garden.pollinations,
      fertility: this.state.garden.fertility,
      plants: this.state.garden.plants,
    })
  }

  #tick = (dt: number, s: OrganismState) => {
    // Time the tab spent hidden still counts as growth.
    if (this.heart.awayMs > 0) {
      const grewBy = this.garden.catchUp(this.heart.awayMs)
      if (grewBy > 0) this.bus.emit('returned', { awayMs: this.heart.awayMs, grewBy })
      this.heart.awayMs = 0
    }

    this.attention.tick(dt)
    this.#tickCircadian(dt, s)
    this.#tickWeather(dt, s)
    tickBreath(dt, s, this.bus)
    this.garden.tick(dt)
    // Pollinators run after the garden so they see this frame's flowers, and
    // before the components, which publish the flower positions they steer to.
    this.fauna.tick(dt, s)
    this.voice.tick(dt, s)

    s.vitals.age = (s.time.now - this.#bornAt) / 1000
    this.theme.tick(dt, s.circadian.palette, s.circadian.daylight)

    this.#saveAccum += dt
    if (this.#saveAccum > 5) {
      this.#saveAccum = 0
      this.#persist()
    }
  }

  #tickCircadian(_dt: number, s: OrganismState) {
    const date = new Date(s.time.now)
    const hour = s.time.scrub ?? hourNow(date)
    s.time.hour = hour

    const { sunrise, sunset } = solarDay(date)
    const sun = solarPosition(hour, sunrise, sunset)
    const { palette, phase } = paletteAt(hour)

    const c = s.circadian
    if (phase !== c.phase) {
      this.bus.emit('phase', { from: c.phase, to: phase })
      c.phase = phase
    }
    c.hour = hour
    c.sunrise = sunrise
    c.sunset = sunset
    c.elevation = sun.elevation
    c.daylight = sun.daylight
    c.sunX = sun.sunX
    c.sunY = sun.sunY
    c.palette = palette

    // Calendar-derived like sunrise, and the date is already in hand here.
    s.weather.seasonMix = seasonMix(date)
    s.weather.season = seasonOf(date)
  }

  #tickWeather(dt: number, s: OrganismState) {
    const w = s.weather

    w.since += dt
    if (!this.#weatherLocked && w.since >= w.dwell) {
      this.set(nextWeather(w.current, w.season, s.circadian.daylight, w.temperature))
    }

    const profile = WEATHER[w.current]
    for (const key of PARAM_KEYS) w.target[key] = profile[key]

    // ~8 second crossfade between systems. Nothing in the sky ever cuts.
    for (const key of PARAM_KEYS) {
      w.params[key] = damp(w.params[key], w.target[key], 0.02, dt)
    }

    // Wind: a steady base with slow gusts layered on, and a direction that
    // only changes when the weather does.
    const gust = 0.6 + fbm2D(s.time.elapsed * 0.055, 3.7, 3) * 0.95
    this.#windDir = damp(this.#windDir, this.#windDirTarget, 0.4, dt)
    w.wind = w.params.wind * gust * this.#windDir

    w.temperature = damp(
      w.temperature,
      temperatureFor(w.season, s.circadian.daylight, w.params),
      0.3,
      dt,
    )

    // Snow lies on the ground and melts back into the soil. Accumulation is
    // slow on purpose — a bed that whitens in twenty seconds reads as a filter
    // rather than as weather.
    const falling = w.params.precip * w.params.snowiness
    const melt = Math.min(w.snowpack, Math.max(0, w.temperature - 0.5) * 0.0006 * dt)
    w.snowpack = clamp(w.snowpack + falling * 0.008 * dt - melt)
    w.wetness = clamp(w.wetness + melt * 1.6)

    // Lightning. Roughly one strike every four seconds at full intensity.
    w.flash = Math.max(0, w.flash - dt * 3.2)
    if (w.params.thunder > 0.35 && Math.random() < w.params.thunder * dt * 0.26) {
      const strength = 0.55 + Math.random() * 0.45
      w.flash = strength
      this.bus.emit('thunder', { strength })
    }
  }

  // ---- Visitor controls -------------------------------------------------

  /** Force a weather system. Resets the dwell timer. */
  set(id: WeatherId) {
    const w = this.state.weather
    if (id === w.current) {
      w.since = 0
      w.dwell = rollDwell()
      return
    }
    const from = w.current
    w.current = id
    w.since = 0
    w.dwell = rollDwell()
    this.#windDirTarget = Math.random() < 0.5 ? -1 : 1
    this.bus.emit('weather', { from, to: id })
  }

  /** Pin the weather so it stops drifting, or release it. */
  lockWeather(locked: boolean) {
    this.#weatherLocked = locked
  }

  get weatherLocked() {
    return this.#weatherLocked
  }

  /** Take manual control of the sun, or hand it back with `null`. */
  scrub(hour: number | null) {
    this.state.time.scrub = hour === null ? null : ((hour % 24) + 24) % 24
  }

  plantSeed(): boolean {
    if (this.state.garden.plants.length >= MAX_PLANTS) return false
    return this.garden.plant() !== null
  }

  /** Water the bed by hand — an instant shot of moisture and vigour. */
  water() {
    const s = this.state
    s.weather.wetness = clamp(s.weather.wetness + 0.32)
    for (const plant of s.garden.plants) plant.vigor = clamp(plant.vigor + 0.18)
  }

  /** Wipe the saved garden and start over from seedlings. */
  reset() {
    forget()
    this.garden.clear()
    this.#bornAt = Date.now()
    this.state.vitals.visits = 1
    this.state.garden.generations = 0
    this.state.garden.pollinations = 0
    this.state.garden.hybrids = 0
    this.state.garden.fertility = 0.5
    this.state.fauna.pollinators.length = 0
    for (let i = 0; i < 3; i++) {
      const plant = this.garden.plant({ x: 0.2 + i * 0.3 })
      if (plant) plant.age = 0.06 + i * 0.05
    }
    this.#persist()
  }

  registerOrgan() {
    this.state.vitals.organs++
  }
  unregisterOrgan() {
    this.state.vitals.organs = Math.max(0, this.state.vitals.organs - 1)
  }
}

export const organism = new Organism()
export type { Organism }
