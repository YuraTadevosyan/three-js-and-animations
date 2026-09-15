import { clamp, lerp } from './math'
import { makeRng, type Rng } from './rng'
import type { Species } from '@/organism/state'

/**
 * A plant's heritable traits.
 *
 * Originally every plant was just an integer seed, which is compact but has no
 * notion of inheritance — crossing two seeds can only ever produce a third
 * unrelated plant. Splitting the traits out means offspring can actually
 * resemble their parents, and a hybrid can land visibly between the two.
 *
 * The seed is still carried alongside, but now it only drives the per-branch
 * jitter that stops a plant looking mechanically symmetrical. Same genome plus
 * same seed always grows the same plant.
 */
export interface Genome {
  species: Species
  /** Overall size multiplier. */
  scale: number
  /** Mean segment length in local units. */
  segLen: number
  segments: number
  children: number
  /** Branching angle in degrees. */
  spread: number
  /** Curl per segment, in degrees. Sign decides which way it coils. */
  curl: number
  /** Width multiplier applied at each depth. */
  taper: number
  baseWidth: number
  /** Leaf every N segments; 0 for none. */
  leafEvery: number
  leafSize: number
  flowers: number
  flowerSize: number
  trunkLean: number
  /** Degrees off the canopy hue. The most visible inherited trait. */
  hueShift: number
  /** Individual growth-rate multiplier. */
  vigorBias: number
}

type Bounds = Record<Exclude<keyof Genome, 'species'>, [number, number]>

/**
 * Hard limits every genome is clamped into. Crossing and mutation can push
 * traits well outside their species' usual range — that's the point — but
 * geometry still has to be drawable, and a plant with zero segments or a
 * ninety-degree spread is not.
 */
const BOUNDS: Bounds = {
  scale: [0.6, 1.6],
  segLen: [2.5, 18],
  segments: [3, 14],
  children: [1, 6],
  spread: [5, 85],
  curl: [-9, 9],
  taper: [0.45, 0.85],
  baseWidth: [1.2, 5.5],
  leafEvery: [0, 4],
  leafSize: [2, 9],
  flowers: [0, 4],
  flowerSize: [0, 6.5],
  trunkLean: [0, 22],
  hueShift: [-40, 40],
  vigorBias: [0.6, 1.45],
}

const INTEGER_TRAITS = ['segments', 'children', 'leafEvery', 'flowers'] as const

const NUMERIC_TRAITS = Object.keys(BOUNDS) as (keyof Bounds)[]

interface SpeciesRanges {
  segLen: [number, number]
  segments: [number, number]
  children: [number, number]
  spread: [number, number]
  curl: [number, number]
  taper: number
  baseWidth: number
  leafEvery: number
  leafSize: [number, number]
  flowers: number
  flowerSize: [number, number]
  trunkLean: number
  /** Target on-screen height in bed units, before per-plant variation. */
  height: number
}

/** The wild type of each species — what a seed rolls within. */
export const SPECIES_RANGES: Record<Species, SpeciesRanges> = {
  fern: {
    segLen: [5.5, 7.5], segments: [7, 10], children: [2, 3], spread: [26, 46],
    curl: [-3.5, 3.5], taper: 0.52, baseWidth: 2.6, leafEvery: 1, leafSize: [3.4, 5.4],
    flowers: 0, flowerSize: [0, 0], trunkLean: 8, height: 150,
  },
  vine: {
    segLen: [7, 10], segments: [8, 12], children: [1, 2], spread: [34, 62],
    curl: [2, 7.5], taper: 0.6, baseWidth: 2.1, leafEvery: 3, leafSize: [4, 6.5],
    flowers: 1, flowerSize: [2.4, 3.4], trunkLean: 16, height: 168,
  },
  bloom: {
    segLen: [9, 12], segments: [6, 8], children: [1, 2], spread: [16, 30],
    curl: [-2, 2], taper: 0.62, baseWidth: 3, leafEvery: 2, leafSize: [5, 8],
    flowers: 3, flowerSize: [3.6, 5.6], trunkLean: 6, height: 186,
  },
  reed: {
    segLen: [11, 15], segments: [5, 7], children: [2, 4], spread: [6, 16],
    curl: [-1.5, 1.5], taper: 0.7, baseWidth: 1.7, leafEvery: 0, leafSize: [3, 4.5],
    flowers: 2, flowerSize: [1.6, 2.4], trunkLean: 10, height: 204,
  },
  succulent: {
    segLen: [3.4, 4.6], segments: [3, 4], children: [4, 6], spread: [40, 76],
    curl: [-6, 6], taper: 0.78, baseWidth: 4.4, leafEvery: 1, leafSize: [4.5, 7],
    flowers: 1, flowerSize: [2, 3], trunkLean: 3, height: 96,
  },
}

export const SPECIES_LIST = Object.keys(SPECIES_RANGES) as Species[]

function clampTrait(key: keyof Bounds, value: number): number {
  const [lo, hi] = BOUNDS[key]
  const v = clamp(Number.isFinite(value) ? value : lo, lo, hi)
  return (INTEGER_TRAITS as readonly string[]).includes(key) ? Math.round(v) : v
}

/** Force a genome back inside the drawable envelope, whatever produced it. */
export function clampGenome(g: Genome): Genome {
  const out = { species: g.species } as Genome
  for (const key of NUMERIC_TRAITS) out[key] = clampTrait(key, g[key]) as never
  return out
}

/** Roll a wild-type genome for a species drawn from the seed. */
export function genomeFromSeed(seed: number): Genome {
  const rng = makeRng(seed >>> 0)
  const species = rng.pick(SPECIES_LIST)
  const r = SPECIES_RANGES[species]

  return clampGenome({
    species,
    scale: rng.range(0.82, 1.24),
    segLen: rng.range(r.segLen[0], r.segLen[1]),
    segments: rng.int(r.segments[0], r.segments[1]),
    children: rng.int(r.children[0], r.children[1]),
    spread: rng.range(r.spread[0], r.spread[1]),
    curl: rng.range(r.curl[0], r.curl[1]),
    taper: r.taper,
    baseWidth: r.baseWidth,
    leafEvery: r.leafEvery,
    leafSize: rng.range(r.leafSize[0], r.leafSize[1]),
    flowers: r.flowers,
    flowerSize: rng.range(r.flowerSize[0], r.flowerSize[1]),
    trunkLean: r.trunkLean,
    hueShift: rng.range(-22, 22),
    vigorBias: rng.range(0.7, 1.35),
  })
}

/**
 * Self-seeding: a near-copy that drifts a little. Without this, a garden left
 * alone would produce identical clones forever, and the whole heredity idea
 * would be invisible to anyone who never saw a pollinator.
 */
export function mutateGenome(g: Genome, rng: Rng, strength = 1): Genome {
  const out = { ...g }
  for (const key of NUMERIC_TRAITS) {
    if (key === 'hueShift') continue
    out[key] = (g[key] * rng.range(1 - 0.05 * strength, 1 + 0.05 * strength)) as never
  }
  out.hueShift = g.hueShift + rng.gauss() * 5 * strength

  // Rarely, a seedling sports into a different species outright.
  if (rng.chance(0.04 * strength)) out.species = rng.pick(SPECIES_LIST)

  return clampGenome(out)
}

/**
 * Cross two genomes. Each trait is independently dominant-from-A,
 * dominant-from-B, or intermediate, then given a small mutation — so siblings
 * from the same pairing vary, and a hybrid usually reads as visibly between
 * its parents rather than as a third unrelated plant.
 */
export function crossGenomes(a: Genome, b: Genome, rng: Rng): Genome {
  const out = { species: rng.chance(0.5) ? a.species : b.species } as Genome

  for (const key of NUMERIC_TRAITS) {
    const roll = rng.next()
    const base =
      roll < 0.25 ? a[key] : roll < 0.5 ? b[key] : lerp(a[key], b[key], rng.range(0.3, 0.7))
    out[key] = (base * rng.range(0.96, 1.04)) as never
  }

  // Hue blends rather than segregating — it is the trait people actually read
  // as "this one came from those two".
  out.hueShift = lerp(a.hueShift, b.hueShift, rng.range(0.35, 0.65)) + rng.gauss() * 3

  return clampGenome(out)
}

/** Whether a genome carries traits from outside its own species' wild range. */
export function isDivergent(g: Genome): boolean {
  const r = SPECIES_RANGES[g.species]
  return (
    g.segLen < r.segLen[0] * 0.85 ||
    g.segLen > r.segLen[1] * 1.15 ||
    g.spread < r.spread[0] * 0.8 ||
    g.spread > r.spread[1] * 1.2 ||
    Math.abs(g.hueShift) > 26
  )
}

/** Target height in bed units for a genome, including its size trait. */
export const targetHeight = (g: Genome) =>
  SPECIES_RANGES[g.species].height * lerp(0.85, 1.18, clamp((g.vigorBias - 0.6) / 0.85))
