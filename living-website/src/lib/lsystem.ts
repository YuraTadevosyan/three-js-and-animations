import { makeRng, type Rng } from './rng'
import type { Species } from '@/organism/state'

export interface Point {
  x: number
  y: number
}

export interface Branch {
  /** Polyline in local units: origin at the base of the plant, +y is up. */
  pts: Point[]
  /** Summed segment length, so the renderer never calls getTotalLength(). */
  length: number
  width: number
  depth: number
  /** Growth progress (0..1) at which this branch starts and finishes drawing. */
  t0: number
  t1: number
  kind: 'stem' | 'leaf'
  /** Per-branch sway multiplier — outer growth moves more in wind. */
  sway: number
}

export interface Ornament {
  x: number
  y: number
  r: number
  angle: number
  t0: number
  kind: 'flower' | 'bud' | 'seed'
  sway: number
}

export interface Skeleton {
  species: Species
  branches: Branch[]
  ornaments: Ornament[]
  /** Local-unit extent, used to scale the plant into its slot in the bed. */
  height: number
  halfWidth: number
  /** Hue offset applied to the canopy colour, so no two plants match. */
  hueShift: number
  /** How fast this individual grows, 0.7..1.35. */
  vigorBias: number
}

interface SpeciesConfig {
  depth: number
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
}

const SPECIES: Record<Species, SpeciesConfig> = {
  fern: {
    depth: 2, segLen: [5.5, 7.5], segments: [7, 10], children: [2, 3], spread: [26, 46],
    curl: [-3.5, 3.5], taper: 0.52, baseWidth: 2.6, leafEvery: 1, leafSize: [3.4, 5.4],
    flowers: 0, flowerSize: [0, 0], trunkLean: 8,
  },
  vine: {
    depth: 3, segLen: [7, 10], segments: [8, 12], children: [1, 2], spread: [34, 62],
    curl: [2, 7.5], taper: 0.6, baseWidth: 2.1, leafEvery: 3, leafSize: [4, 6.5],
    flowers: 1, flowerSize: [2.4, 3.4], trunkLean: 16,
  },
  bloom: {
    depth: 1, segLen: [9, 12], segments: [6, 8], children: [1, 2], spread: [16, 30],
    curl: [-2, 2], taper: 0.62, baseWidth: 3, leafEvery: 2, leafSize: [5, 8],
    flowers: 3, flowerSize: [3.6, 5.6], trunkLean: 6,
  },
  reed: {
    depth: 1, segLen: [11, 15], segments: [5, 7], children: [2, 4], spread: [6, 16],
    curl: [-1.5, 1.5], taper: 0.7, baseWidth: 1.7, leafEvery: 0, leafSize: [3, 4.5],
    flowers: 2, flowerSize: [1.6, 2.4], trunkLean: 10,
  },
  succulent: {
    depth: 1, segLen: [3.4, 4.6], segments: [3, 4], children: [4, 6], spread: [40, 76],
    curl: [-6, 6], taper: 0.78, baseWidth: 4.4, leafEvery: 1, leafSize: [4.5, 7],
    flowers: 1, flowerSize: [2, 3], trunkLean: 3,
  },
}

export const SPECIES_LIST = Object.keys(SPECIES) as Species[]

const DEG = Math.PI / 180

/**
 * Grow a plant's full adult skeleton once, at load. Growth is then just a
 * matter of revealing branches whose [t0,t1] window the plant's age has
 * reached — no geometry is recomputed per frame, which is what lets a dozen
 * plants animate inside one SVG without touching the layout engine.
 */
export function growSkeleton(seed: number): Skeleton {
  const rng = makeRng(seed)
  const species = rng.pick(SPECIES_LIST)
  const cfg = SPECIES[species]

  const branches: Branch[] = []
  const ornaments: Ornament[] = []
  const scale = rng.range(0.82, 1.24)

  let maxY = 0
  let maxX = 0

  const walk = (
    origin: Point,
    angle: number,
    depth: number,
    width: number,
    t0: number,
    budget: number,
  ) => {
    const segCount = rng.int(cfg.segments[0], cfg.segments[1])
    const segLen = rng.range(cfg.segLen[0], cfg.segLen[1]) * scale * budget
    const curl = rng.range(cfg.curl[0], cfg.curl[1])

    const pts: Point[] = [{ ...origin }]
    let pos = { ...origin }
    let dir = angle
    let length = 0

    for (let i = 0; i < segCount; i++) {
      // Segments shorten toward the tip, which reads as natural taper.
      const l = segLen * (1 - (i / segCount) * 0.35)
      dir += (curl + rng.gauss() * 2.2) * DEG
      pos = { x: pos.x + Math.sin(dir) * l, y: pos.y + Math.cos(dir) * l }
      pts.push({ ...pos })
      length += l
      maxY = Math.max(maxY, pos.y)
      maxX = Math.max(maxX, Math.abs(pos.x))
    }

    const span = (0.34 / (depth + 1)) * budget
    const t1 = Math.min(1, t0 + span)
    branches.push({
      pts, length, width, depth, t0, t1, kind: 'stem',
      sway: 0.35 + depth * 0.45,
    })

    // Leaves hang off the stem at regular intervals.
    if (cfg.leafEvery > 0) {
      for (let i = 1; i < pts.length; i += cfg.leafEvery) {
        const at = pts[i]!
        const side = i % 2 === 0 ? 1 : -1
        const leafLen = rng.range(cfg.leafSize[0], cfg.leafSize[1]) * scale * budget
        const leafAngle = dir + side * rng.range(50, 85) * DEG
        const tip = {
          x: at.x + Math.sin(leafAngle) * leafLen,
          y: at.y + Math.cos(leafAngle) * leafLen,
        }
        const mid = {
          x: (at.x + tip.x) / 2 - Math.cos(leafAngle) * leafLen * 0.24 * side,
          y: (at.y + tip.y) / 2 + Math.sin(leafAngle) * leafLen * 0.24 * side,
        }
        const leafT0 = Math.min(0.95, t0 + (i / pts.length) * span + 0.05)
        branches.push({
          pts: [at, mid, tip],
          length: leafLen * 1.12,
          width: Math.max(0.9, width * 0.55),
          depth: depth + 1,
          t0: leafT0,
          t1: Math.min(1, leafT0 + 0.14),
          kind: 'leaf',
          sway: 0.9 + depth * 0.4,
        })
        maxX = Math.max(maxX, Math.abs(tip.x))
        maxY = Math.max(maxY, tip.y)
      }
    }

    const tip = pts[pts.length - 1]!

    if (depth >= cfg.depth) {
      // Tips of the outermost branches carry the flowers and seed heads.
      if (cfg.flowers > 0 && rng.chance(0.75)) {
        const r = rng.range(cfg.flowerSize[0], cfg.flowerSize[1]) * scale
        ornaments.push({
          x: tip.x, y: tip.y, r, angle: dir,
          t0: rng.range(0.72, 0.86),
          kind: 'flower',
          sway: 1.4,
        })
        maxY = Math.max(maxY, tip.y + r)
      }
      return
    }

    const kids = rng.int(cfg.children[0], cfg.children[1])
    for (let i = 0; i < kids; i++) {
      const spread = rng.range(cfg.spread[0], cfg.spread[1]) * DEG
      const side = kids === 1 ? (rng.chance(0.5) ? 1 : -1) : (i / (kids - 1)) * 2 - 1
      // Children branch from somewhere along the parent, not only its tip.
      const fromIndex = Math.max(1, Math.floor(pts.length * rng.range(0.45, 1)) - 1)
      walk(
        pts[fromIndex]!,
        dir + side * spread,
        depth + 1,
        width * cfg.taper,
        t1 - span * 0.25,
        budget * rng.range(0.62, 0.84),
      )
    }
  }

  walk({ x: 0, y: 0 }, rng.range(-cfg.trunkLean, cfg.trunkLean) * DEG, 0, cfg.baseWidth * scale, 0, 1)

  // Reeds are several separate blades from one root rather than one branching stem.
  if (species === 'reed') {
    const extra = rng.int(2, 4)
    for (let i = 0; i < extra; i++) {
      walk(
        { x: rng.range(-4, 4), y: 0 },
        rng.range(-22, 22) * DEG,
        0,
        cfg.baseWidth * scale * rng.range(0.7, 1),
        rng.range(0.05, 0.3),
        rng.range(0.7, 1),
      )
    }
  }

  // Late-cycle seed heads — they only appear once the plant is going over.
  const seedCount = rng.int(1, 3)
  for (let i = 0; i < seedCount; i++) {
    const host = branches[rng.int(0, branches.length - 1)]!
    const at = host.pts[host.pts.length - 1]!
    ornaments.push({
      x: at.x, y: at.y, r: rng.range(1.1, 1.9) * scale,
      angle: 0, t0: rng.range(0.93, 0.98), kind: 'seed', sway: 1.5,
    })
  }

  return {
    species,
    branches,
    ornaments,
    height: Math.max(maxY, 1),
    halfWidth: Math.max(maxX, 1),
    hueShift: rng.range(-22, 22),
    vigorBias: rng.range(0.7, 1.35),
  }
}

/** Deterministic per-plant jitter used for wind phase offsets. */
export const phaseOf = (rng: Rng) => rng.range(0, Math.PI * 2)
