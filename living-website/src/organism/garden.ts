import { growSkeleton, type Skeleton } from '@/lib/lsystem'
import { clamp, damp } from '@/lib/math'
import { makeRng } from '@/lib/rng'
import type { Bus } from './bus'
import type { OrganismState, Plant, Stage } from './state'

/** Effective growth-seconds to reach full maturity (age = 1). */
export const MATURITY = 900

/** Past this age the plant is spent and is removed from the bed. */
export const LIFESPAN = 1.34

export const MAX_PLANTS = 14

/**
 * Credit given for time the page was closed. Real elapsed time counts, but at
 * a reduced rate and capped — otherwise coming back after a fortnight would
 * find a bed of corpses, which is a worse story than finding it overgrown.
 */
const AWAY_RATE = 0.4
const AWAY_CAP_SECONDS = 6 * 3600

const STAGES: [number, Stage][] = [
  [0.04, 'seed'],
  [0.16, 'sprout'],
  [0.45, 'juvenile'],
  [0.75, 'mature'],
  [1.0, 'flowering'],
  [1.12, 'seeding'],
]

export function stageOf(age: number): Stage {
  for (const [limit, stage] of STAGES) if (age < limit) return stage
  return 'fading'
}

/** How much of the skeleton is drawn — flat at 1 once mature. */
export const revealOf = (age: number) => clamp(age / 1.0)

/** Plants shrivel slightly as they go over, rather than vanishing abruptly. */
export const witherOf = (age: number) => clamp((age - 1.12) / (LIFESPAN - 1.12))

let counter = 0
const nextId = () => `p${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

export class Garden {
  /** Skeletons are expensive to build and immutable, so they're cached by seed. */
  #skeletons = new Map<number, Skeleton>()
  #rng = makeRng((Date.now() ^ 0x9e3779b9) >>> 0)

  constructor(private state: OrganismState, private bus: Bus) {}

  skeleton(seed: number): Skeleton {
    let s = this.#skeletons.get(seed)
    if (!s) this.#skeletons.set(seed, (s = growSkeleton(seed)))
    return s
  }

  /** Add a plant. Returns null when the bed is full. */
  plant(opts: { x?: number; seed?: number; gen?: number; bySeed?: boolean } = {}): Plant | null {
    const plants = this.state.garden.plants
    if (plants.length >= MAX_PLANTS) return null

    const plant: Plant = {
      id: nextId(),
      seed: opts.seed ?? (this.#rng.int(0, 0xfffffff) >>> 0),
      x: clamp(opts.x ?? this.#findGap()),
      age: 0,
      vigor: 1,
      gen: opts.gen ?? 0,
    }
    plants.push(plant)
    plants.sort((a, b) => a.x - b.x)
    this.bus.emit('planted', { plant, bySeed: opts.bySeed ?? false })
    return plant
  }

  remove(id: string) {
    const plants = this.state.garden.plants
    const i = plants.findIndex((p) => p.id === id)
    if (i >= 0) plants.splice(i, 1)
  }

  clear() {
    this.state.garden.plants.length = 0
  }

  /** Pick the roomiest spot in the bed so plants spread out instead of clumping. */
  #findGap(): number {
    const xs = this.state.garden.plants.map((p) => p.x).sort((a, b) => a - b)
    if (!xs.length) return this.#rng.range(0.3, 0.7)

    let best = this.#rng.range(0.05, 0.95)
    let bestGap = -1
    const edges = [0, ...xs, 1]
    for (let i = 0; i < edges.length - 1; i++) {
      const gap = edges[i + 1]! - edges[i]!
      if (gap > bestGap) {
        bestGap = gap
        best = (edges[i]! + edges[i + 1]!) / 2
      }
    }
    return clamp(best + this.#rng.gauss() * 0.02, 0.04, 0.96)
  }

  /** Advance every plant by `seconds` of effective growth. */
  #advance(seconds: number) {
    const { garden } = this.state
    const dead: Plant[] = []
    const births: { seed: number; gen: number }[] = []

    // Iterate a snapshot. Seeding appends to (and re-sorts) `plants`, and
    // mutating the array under a live for..of can revisit or skip entries —
    // during a long catch-up that turns into a cascade of instant births.
    for (const plant of [...garden.plants]) {
      const before = plant.age
      const bias = this.skeleton(plant.seed).vigorBias
      plant.age += (seconds / MATURITY) * bias * (0.45 + plant.vigor * 0.75)

      if (before < 0.75 && plant.age >= 0.75) this.bus.emit('bloomed', { plant })

      // A plant going to seed drops one child, once.
      if (before < 1.05 && plant.age >= 1.05) {
        births.push({ seed: (plant.seed * 1664525 + 1013904223) >>> 0, gen: plant.gen + 1 })
      }

      if (plant.age >= LIFESPAN) dead.push(plant)
    }

    for (const plant of dead) {
      this.remove(plant.id)
      // Compost. A death makes the next generation grow a little better.
      garden.fertility = clamp(garden.fertility + 0.06)
      this.bus.emit('died', { plant })
    }

    // Births go in after the sweep, once the dead have freed up their slots.
    for (const birth of births) {
      if (this.plant({ ...birth, bySeed: true })) garden.generations++
    }
  }

  /** Catch the garden up after the page was closed or the tab was hidden. */
  catchUp(awayMs: number): number {
    const seconds = Math.min(awayMs / 1000, AWAY_CAP_SECONDS) * AWAY_RATE
    if (seconds <= 1) return 0

    // Replayed in chunks rather than one enormous step, so a plant that was
    // due to flower, seed and die during your absence actually does all three
    // in order — and its child gets its own share of the remaining time.
    const CHUNK = 90
    let remaining = seconds
    let guard = 0
    while (remaining > 0.5 && guard++ < 256) {
      const step = Math.min(CHUNK, remaining)
      this.#advance(step)
      remaining -= step
    }
    return seconds
  }

  tick(dt: number) {
    const { garden, weather, circadian } = this.state

    // Soil moisture: rain wets it, sun and wind dry it out.
    const evaporation = (0.006 + circadian.daylight * 0.016 + weather.params.wind * 0.004) * dt
    weather.wetness = clamp(weather.wetness + weather.params.precip * 0.06 * dt - evaporation)

    garden.fertility = damp(
      garden.fertility,
      clamp(0.34 + weather.wetness * 0.5 + circadian.daylight * 0.18),
      0.7,
      dt,
    )

    // Photosynthesis is the dominant term, but nothing stops growing at night.
    const light = 0.28 + circadian.daylight * 0.95
    const water = 0.45 + weather.wetness * 0.85
    const t = weather.temperature
    const warmth = Math.max(0.15, Math.exp(-Math.pow((t - 18) / 16, 2)))
    const soil = 0.62 + garden.fertility * 0.62

    for (const plant of garden.plants) {
      const drought = weather.wetness < 0.16
      const starved = circadian.daylight < 0.05 && weather.params.gloom > 0.5
      const delta =
        (weather.params.precip > 0.15 ? 0.05 : 0) -
        (drought ? 0.014 : 0) -
        (starved ? 0.004 : 0) +
        0.004
      plant.vigor = clamp(plant.vigor + delta * dt)
    }

    this.#advance(dt * light * water * warmth * soil)
  }
}
