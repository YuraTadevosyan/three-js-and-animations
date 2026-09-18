import { crossGenomes, genomeFromSeed, mutateGenome, type Genome } from '@/lib/genome'
import { growSkeleton, type Skeleton } from '@/lib/lsystem'
import { clamp, damp } from '@/lib/math'
import { makeRng } from '@/lib/rng'
import { growthSeasonFactor } from './circadian'
import type { Bus } from './bus'
import type { OrganismState, Plant, Species, Stage } from './state'

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

/** Flowers are open — and therefore worth a pollinator's time — in this window. */
export const isInFlower = (age: number) => age >= 0.78 && age < 1.14

let counter = 0
const nextId = () => `p${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

interface Birth {
  seed: number
  genome: Genome
  gen: number
  parents: [Species, Species] | null
}

export class Garden {
  /**
   * Skeletons are expensive to build and immutable for the life of a plant, so
   * they're cached per plant. Keyed by id rather than by seed: two plants can
   * now share a seed and differ entirely in genome.
   */
  #skeletons = new Map<string, Skeleton>()
  #rng = makeRng((Date.now() ^ 0x9e3779b9) >>> 0)

  constructor(private state: OrganismState, private bus: Bus) {}

  skeleton(plant: Plant): Skeleton {
    let s = this.#skeletons.get(plant.id)
    if (!s) this.#skeletons.set(plant.id, (s = growSkeleton(plant.genome, plant.seed)))
    return s
  }

  /** Add a plant. Returns null when the bed is full. */
  plant(
    opts: {
      x?: number
      seed?: number
      genome?: Genome
      gen?: number
      bySeed?: boolean
      parents?: [Species, Species] | null
    } = {},
  ): Plant | null {
    const plants = this.state.garden.plants
    if (plants.length >= MAX_PLANTS) return null

    const seed = opts.seed ?? (this.#rng.int(0, 0xfffffff) >>> 0)
    const plant: Plant = {
      id: nextId(),
      seed,
      genome: opts.genome ?? genomeFromSeed(seed),
      x: clamp(opts.x ?? this.#findGap()),
      age: 0,
      vigor: 1,
      gen: opts.gen ?? 0,
      pollen: null,
      parents: opts.parents ?? null,
    }
    plants.push(plant)
    plants.sort((a, b) => a.x - b.x)
    this.#countHybrids()
    this.bus.emit('planted', { plant, bySeed: opts.bySeed ?? false })
    return plant
  }

  remove(id: string) {
    const plants = this.state.garden.plants
    const i = plants.findIndex((p) => p.id === id)
    if (i >= 0) plants.splice(i, 1)
    this.#skeletons.delete(id)
    this.#countHybrids()
  }

  clear() {
    this.state.garden.plants.length = 0
    this.#skeletons.clear()
    this.state.garden.hybrids = 0
  }

  #countHybrids() {
    let n = 0
    for (const plant of this.state.garden.plants) if (plant.parents) n++
    this.state.garden.hybrids = n
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

  /**
   * What a plant going to seed produces.
   *
   * Pollen delivered by an insect crosses the two genomes; without it the
   * plant selfs, which still drifts a little so a garden left alone slowly
   * changes rather than cloning itself forever.
   */
  #offspring(parent: Plant): Birth {
    const seed = (parent.seed * 1664525 + 1013904223) >>> 0
    const gen = parent.gen + 1

    if (parent.pollen) {
      const parents: [Species, Species] = [parent.genome.species, parent.pollen.species]
      const genome = crossGenomes(parent.genome, parent.pollen, this.#rng)
      parent.pollen = null
      return { seed, genome, gen, parents }
    }

    return { seed, genome: mutateGenome(parent.genome, this.#rng), gen, parents: null }
  }

  /** Advance every plant by `seconds` of effective growth. */
  #advance(seconds: number) {
    const { garden } = this.state
    const dead: Plant[] = []
    const births: Birth[] = []

    // Iterate a snapshot. Seeding appends to (and re-sorts) `plants`, and
    // mutating the array under a live for..of can revisit or skip entries —
    // during a long catch-up that turns into a cascade of instant births.
    for (const plant of [...garden.plants]) {
      const before = plant.age
      const bias = plant.genome.vigorBias
      plant.age += (seconds / MATURITY) * bias * (0.45 + plant.vigor * 0.75)

      if (before < 0.75 && plant.age >= 0.75) this.bus.emit('bloomed', { plant })

      // A plant going to seed drops one child, once.
      if (before < 1.05 && plant.age >= 1.05) births.push(this.#offspring(plant))

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
      const child = this.plant({ ...birth, bySeed: true })
      if (!child) continue
      garden.generations++
      if (birth.parents) this.bus.emit('crossed', { plant: child, parents: birth.parents })
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
    // Roughly 0.5 in midwinter to 1.2 at the height of spring.
    const season = growthSeasonFactor(weather.seasonMix)

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

    this.#advance(dt * light * water * warmth * soil * season)
  }
}
