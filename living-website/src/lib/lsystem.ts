import { type Genome, SPECIES_RANGES } from './genome'
import { clamp } from './math'
import { makeRng } from './rng'

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
  /** The traits this shape was grown from. */
  genome: Genome
  branches: Branch[]
  ornaments: Ornament[]
  /** Local-unit extent, used to scale the plant into its slot in the bed. */
  height: number
  halfWidth: number
}

const DEG = Math.PI / 180

/**
 * Hard ceiling on paths per plant. The heaviest wild type (a fern, with a leaf
 * on every segment) lands around 145, so this leaves room for hybrids without
 * letting one loose in the bed.
 */
const BRANCH_BUDGET = 260

/** Stems produced by a branching factor `c` carried to depth `d`. */
const stemCount = (c: number, d: number) =>
  c <= 1 ? d + 1 : (Math.pow(c, d + 1) - 1) / (c - 1)

/**
 * How deep to branch.
 *
 * Species sets the intent, but the branching factor gets a veto. Crossing is
 * free to hand a vine's depth of 3 to a genome that also inherited a
 * succulent's six children — which is 259 stems before a single leaf, and
 * thousands of SVG paths once leaves are added. Trading depth for width keeps
 * the plant plausible instead of merely truncating it mid-draw.
 */
function depthFor(g: Genome): number {
  let depth = g.species === 'fern' ? 2 : g.species === 'vine' ? 3 : 1

  // Leaves are the real multiplier: a fern puts one on every segment, so the
  // estimate has to count them or the stem budget is meaningless.
  const every = Math.round(g.leafEvery)
  const leavesPerStem = every > 0 ? g.segments / every : 0

  while (depth > 0 && stemCount(g.children, depth) * (1 + leavesPerStem) > 200) depth--
  return depth
}

/**
 * Grow a plant's full adult skeleton once, at load.
 *
 * The genome supplies the means; the seed supplies the jitter around them. A
 * plant's branches share its genetics, so a high-`curl` genome coils
 * throughout rather than coiling in one arm and not the next — which is what
 * makes an inherited trait legible when you put parent and child side by side.
 *
 * Growth is then just a matter of revealing branches whose [t0, t1] window the
 * plant's age has reached; no geometry is recomputed per frame.
 */
export function growSkeleton(genome: Genome, seed: number): Skeleton {
  const rng = makeRng(seed >>> 0)
  const g = genome
  const wild = SPECIES_RANGES[g.species]

  const branches: Branch[] = []
  const ornaments: Ornament[] = []
  const scale = g.scale
  const maxDepth = depthFor(g)

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
    // Backstop. depthFor() handles the common blow-up, but a genome can be odd
    // in more than one way at once.
    if (branches.length >= BRANCH_BUDGET) return

    const segCount = clamp(Math.round(g.segments * rng.range(0.85, 1.15)), 3, 16)
    const segLen = g.segLen * rng.range(0.9, 1.1) * scale * budget
    const curl = g.curl + rng.gauss() * 1.5

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
    branches.push({ pts, length, width, depth, t0, t1, kind: 'stem', sway: 0.35 + depth * 0.45 })

    // Leaves hang off the stem at regular intervals.
    const every = Math.round(g.leafEvery)
    if (every > 0) {
      for (let i = 1; i < pts.length && branches.length < BRANCH_BUDGET; i += every) {
        const at = pts[i]!
        const side = i % 2 === 0 ? 1 : -1
        const leafLen = g.leafSize * rng.range(0.85, 1.15) * scale * budget
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

    if (depth >= maxDepth) {
      // Tips of the outermost branches carry the flowers.
      if (g.flowers > 0 && g.flowerSize > 0.4 && rng.chance(0.75)) {
        const r = g.flowerSize * rng.range(0.85, 1.15) * scale
        ornaments.push({ x: tip.x, y: tip.y, r, angle: dir, t0: rng.range(0.72, 0.86), kind: 'flower', sway: 1.4 })
        maxY = Math.max(maxY, tip.y + r)
      }
      return
    }

    const kids = clamp(Math.round(g.children * rng.range(0.8, 1.25)), 1, 6)
    for (let i = 0; i < kids; i++) {
      const spread = g.spread * rng.range(0.8, 1.2) * DEG
      const side = kids === 1 ? (rng.chance(0.5) ? 1 : -1) : (i / (kids - 1)) * 2 - 1
      // Children branch from somewhere along the parent, not only its tip.
      const fromIndex = Math.max(1, Math.floor(pts.length * rng.range(0.45, 1)) - 1)
      walk(
        pts[fromIndex]!,
        dir + side * spread,
        depth + 1,
        width * g.taper,
        t1 - span * 0.25,
        budget * rng.range(0.62, 0.84),
      )
    }
  }

  walk({ x: 0, y: 0 }, rng.range(-g.trunkLean, g.trunkLean) * DEG, 0, g.baseWidth * scale, 0, 1)

  // Reeds are several separate blades from one root rather than one branching stem.
  if (g.species === 'reed') {
    const extra = rng.int(2, 4)
    for (let i = 0; i < extra; i++) {
      walk(
        { x: rng.range(-4, 4), y: 0 },
        rng.range(-22, 22) * DEG,
        0,
        g.baseWidth * scale * rng.range(0.7, 1),
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

  // A genome with no flower traits still needs somewhere to end; the wild type
  // decides whether that tip is bare or carries a bud.
  if (!ornaments.some((o) => o.kind === 'flower') && wild.flowers > 0 && g.flowerSize > 0.4) {
    const host = branches[branches.length - 1]!
    const at = host.pts[host.pts.length - 1]!
    ornaments.push({
      x: at.x, y: at.y, r: g.flowerSize * scale,
      angle: 0, t0: 0.8, kind: 'flower', sway: 1.4,
    })
  }

  return {
    genome: g,
    branches,
    ornaments,
    height: Math.max(maxY, 1),
    halfWidth: Math.max(maxX, 1),
  }
}
