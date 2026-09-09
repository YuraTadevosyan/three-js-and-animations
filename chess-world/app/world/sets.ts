/**
 * The three piece sets.
 *
 * A set is pure data: a lathe profile per piece, any extruded silhouettes, and
 * the handful of primitive details that a surface of revolution cannot express
 * — battlements, a crown of points, a cross. Nothing here touches the engine,
 * so the same tables drive the meshes on the board and the SVG previews in the
 * settings panel, and the shapes can be checked in Node.
 *
 * Every set is drawn to the same envelope (`PIECE_HEIGHT` in `pieces.ts`), so
 * switching sets never re-tunes the choreography, the camera or the capture
 * bursts — a queen teleports through the same arc whichever set she is in.
 */
import { arc, mirrorOutline, type Point2, type ProfilePoint } from './geometry'

/** A PlayCanvas primitive used as a piece detail. */
export type DetailKind = 'box' | 'sphere' | 'cone' | 'cylinder'

export interface PieceDetail {
  kind: DetailKind
  position: [x: number, y: number, z: number]
  scale: [x: number, y: number, z: number]
  rotation?: [x: number, y: number, z: number]
}

export interface SilhouettePart {
  outline: Point2[]
  thickness: number
  position: [x: number, y: number, z: number]
  /**
   * How the slab is turned. `board` points it down the board — the knight's
   * head looking at the enemy. `viewer` keeps it flat on to the camera and
   * turns it round for the second army, so the two sides mirror each other.
   */
  facing?: 'board' | 'viewer'
}

export interface PieceShape {
  /** The turned body, revolved around Y. */
  profile?: ProfilePoint[]
  /** Extruded outlines: a knight's head, or a whole flat piece. */
  parts?: SilhouettePart[]
  details?: PieceDetail[]
}

export interface PieceSet {
  id: string
  name: string
  hint: string
  /** Lathe resolution: high for a turned body, six for cut crystal. */
  segments: number
  /** Split the vertices so every triangle keeps its own normal. */
  flat?: boolean
  shapes: Record<number, PieceShape>
}

/* ------------------------------------------------------------- classic -- */

const CLASSIC_PAWN: ProfilePoint[] = [
  [0.235, 0.0], [0.235, 0.045], [0.185, 0.08], [0.125, 0.12], [0.1, 0.155],
  [0.082, 0.235], [0.086, 0.30], [0.138, 0.335], [0.112, 0.365], [0.098, 0.385],
  [0.146, 0.44], [0.157, 0.485], [0.138, 0.54], [0.092, 0.585], [0.0, 0.62],
]

const CLASSIC_ROOK: ProfilePoint[] = [
  [0.265, 0.0], [0.265, 0.05], [0.215, 0.095], [0.17, 0.145], [0.152, 0.30],
  [0.152, 0.45], [0.186, 0.485], [0.176, 0.52], [0.214, 0.58], [0.232, 0.63],
  [0.232, 0.74], [0.188, 0.74], [0.188, 0.66], [0.0, 0.66],
]

// The last point closes the neck over: the head sits on top of it, but a piece
// with an open tube for a neck shows daylight through it from a low camera.
const CLASSIC_KNIGHT: ProfilePoint[] = [
  [0.26, 0.0], [0.26, 0.05], [0.212, 0.095], [0.168, 0.145], [0.15, 0.24],
  [0.15, 0.30], [0.175, 0.335], [0.15, 0.37], [0.0, 0.37],
]

const CLASSIC_BISHOP: ProfilePoint[] = [
  [0.245, 0.0], [0.245, 0.05], [0.198, 0.09], [0.135, 0.13], [0.098, 0.175],
  [0.085, 0.28], [0.088, 0.35], [0.15, 0.395], [0.12, 0.425], [0.104, 0.45],
  [0.152, 0.52], [0.163, 0.58], [0.145, 0.65], [0.1, 0.71], [0.055, 0.745],
  [0.048, 0.775], [0.075, 0.80], [0.06, 0.83], [0.0, 0.86],
]

const CLASSIC_QUEEN: ProfilePoint[] = [
  [0.275, 0.0], [0.275, 0.055], [0.222, 0.1], [0.155, 0.15], [0.115, 0.2],
  [0.1, 0.33], [0.105, 0.42], [0.172, 0.47], [0.138, 0.5], [0.12, 0.53],
  [0.165, 0.6], [0.195, 0.67], [0.212, 0.75], [0.19, 0.79], [0.148, 0.8],
  [0.148, 0.82], [0.0, 0.82],
]

const CLASSIC_KING: ProfilePoint[] = [
  [0.285, 0.0], [0.285, 0.055], [0.23, 0.105], [0.16, 0.155], [0.118, 0.21],
  [0.102, 0.35], [0.108, 0.44], [0.178, 0.49], [0.142, 0.52], [0.125, 0.55],
  [0.17, 0.62], [0.2, 0.69], [0.212, 0.77], [0.188, 0.815], [0.15, 0.825],
  [0.15, 0.845], [0.0, 0.845],
]

/**
 * The knight's head, drawn as a side view in the XY plane and extruded. Runs
 * from the base of the neck, up the mane, over the ears, down the face to the
 * muzzle, then back along the jaw. The muzzle points at +X.
 */
const CLASSIC_HEAD: Point2[] = [
  [-0.115, 0.0], [-0.16, 0.115], [-0.175, 0.235], [-0.14, 0.325], [-0.07, 0.395],
  [-0.085, 0.45], [-0.03, 0.415], [0.01, 0.45], [0.04, 0.40], [0.115, 0.375],
  [0.185, 0.315], [0.225, 0.245], [0.235, 0.185], [0.17, 0.17], [0.105, 0.185],
  [0.06, 0.155], [0.045, 0.075], [0.075, 0.0],
]

/** `count` details spaced evenly around the axis at `radius`. */
function crown(
  count: number,
  radius: number,
  y: number,
  build: (angle: number) => PieceDetail,
): PieceDetail[] {
  const details: PieceDetail[] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const detail = build(angle)
    detail.position = [Math.cos(angle) * radius, y, Math.sin(angle) * radius]
    details.push(detail)
  }
  return details
}

const classic: PieceSet = {
  id: 'classic',
  name: 'Turned',
  hint: 'Lathe-turned Staunton, 28 sides to the round',
  segments: 28,
  shapes: {
    1: { profile: CLASSIC_PAWN },
    2: {
      profile: CLASSIC_KNIGHT,
      parts: [{ outline: CLASSIC_HEAD, thickness: 0.19, position: [0, 0.35, 0], facing: 'board' }],
    },
    3: {
      profile: CLASSIC_BISHOP,
      details: [{ kind: 'sphere', position: [0, 0.885, 0], scale: [0.075, 0.075, 0.075] }],
    },
    4: {
      profile: CLASSIC_ROOK,
      details: crown(4, 0.155, 0.755, (angle) => ({
        kind: 'box',
        position: [0, 0, 0],
        scale: [0.1, 0.1, 0.1],
        rotation: [0, (-angle * 180) / Math.PI, 0],
      })),
    },
    5: {
      profile: CLASSIC_QUEEN,
      details: [
        ...crown(8, 0.155, 0.855, (angle) => ({
          kind: 'cone',
          position: [0, 0, 0],
          scale: [0.062, 0.11, 0.062],
          rotation: [Math.sin(angle) * 22, 0, -(Math.cos(angle) * 22)],
        })),
        { kind: 'sphere', position: [0, 0.885, 0], scale: [0.115, 0.115, 0.115] },
      ],
    },
    6: {
      profile: CLASSIC_KING,
      details: [
        { kind: 'cylinder', position: [0, 0.855, 0], scale: [0.3, 0.045, 0.3] },
        { kind: 'box', position: [0, 0.965, 0], scale: [0.052, 0.2, 0.052] },
        { kind: 'box', position: [0, 0.995, 0], scale: [0.15, 0.05, 0.052] },
      ],
    },
  },
}

/* --------------------------------------------------------------- facet -- */

const FACET_PAWN: ProfilePoint[] = [
  [0.23, 0.0], [0.23, 0.05], [0.13, 0.13], [0.1, 0.30], [0.175, 0.36],
  [0.175, 0.40], [0.115, 0.46], [0.0, 0.62],
]

const FACET_KNIGHT: ProfilePoint[] = [
  [0.245, 0.0], [0.245, 0.05], [0.15, 0.14], [0.13, 0.28], [0.175, 0.34], [0.155, 0.38], [0.0, 0.38],
]

const FACET_BISHOP: ProfilePoint[] = [
  [0.24, 0.0], [0.24, 0.05], [0.135, 0.14], [0.105, 0.30], [0.175, 0.38],
  [0.15, 0.44], [0.165, 0.54], [0.1, 0.66], [0.0, 0.86],
]

const FACET_ROOK: ProfilePoint[] = [
  [0.27, 0.0], [0.27, 0.06], [0.165, 0.15], [0.15, 0.46], [0.2, 0.52],
  [0.245, 0.58], [0.245, 0.66], [0.0, 0.66],
]

const FACET_QUEEN: ProfilePoint[] = [
  [0.28, 0.0], [0.28, 0.06], [0.155, 0.16], [0.12, 0.34], [0.19, 0.42],
  [0.155, 0.48], [0.2, 0.62], [0.235, 0.74], [0.145, 0.80], [0.0, 0.80],
]

const FACET_KING: ProfilePoint[] = [
  [0.29, 0.0], [0.29, 0.06], [0.165, 0.17], [0.125, 0.36], [0.2, 0.44],
  [0.16, 0.50], [0.205, 0.64], [0.24, 0.76], [0.16, 0.82], [0.0, 0.82],
]

/** The same horse, cut with a chisel rather than carved. Muzzle at +X. */
const FACET_HEAD: Point2[] = [
  [-0.15, 0.0], [-0.19, 0.16], [-0.15, 0.30], [-0.075, 0.375], [-0.1, 0.45],
  [-0.02, 0.40], [0.03, 0.46], [0.055, 0.365], [0.175, 0.325], [0.235, 0.20],
  [0.13, 0.155], [0.06, 0.185], [0.055, 0.0],
]

const facet: PieceSet = {
  id: 'facet',
  name: 'Facet',
  hint: 'Cut crystal — six sides, hard edges, flat shading',
  segments: 6,
  flat: true,
  shapes: {
    1: { profile: FACET_PAWN },
    2: {
      profile: FACET_KNIGHT,
      parts: [{ outline: FACET_HEAD, thickness: 0.22, position: [0, 0.34, 0], facing: 'board' }],
    },
    3: { profile: FACET_BISHOP },
    4: {
      profile: FACET_ROOK,
      details: crown(6, 0.17, 0.70, (angle) => ({
        kind: 'box',
        position: [0, 0, 0],
        scale: [0.11, 0.11, 0.11],
        rotation: [0, (-angle * 180) / Math.PI, 0],
      })),
    },
    5: {
      profile: FACET_QUEEN,
      details: [
        ...crown(6, 0.16, 0.86, (angle) => ({
          kind: 'cone',
          position: [0, 0, 0],
          scale: [0.075, 0.16, 0.075],
          rotation: [Math.sin(angle) * 18, 0, -(Math.cos(angle) * 18)],
        })),
        { kind: 'sphere', position: [0, 0.90, 0], scale: [0.12, 0.12, 0.12] },
      ],
    },
    6: {
      profile: FACET_KING,
      details: [
        { kind: 'cylinder', position: [0, 0.845, 0], scale: [0.32, 0.05, 0.32] },
        { kind: 'box', position: [0, 0.955, 0], scale: [0.06, 0.22, 0.06] },
        { kind: 'box', position: [0, 0.985, 0], scale: [0.17, 0.055, 0.06] },
      ],
    },
  },
}

/* --------------------------------------------------------------- glyph -- */

/**
 * Cut-outs: each piece is its own silhouette, extruded into a slab and stood
 * on a disc. The shapes are written as a right-hand half and mirrored, except
 * the knight, which has never been symmetric.
 */
const GLYPH_PAWN: Point2[] = mirrorOutline([
  [0.225, 0.0], [0.225, 0.05], [0.155, 0.085], [0.11, 0.13], [0.085, 0.235],
  [0.075, 0.33], [0.125, 0.37], [0.09, 0.40],
  ...arc(0, 0.505, 0.115, -55, 90, 7),
])

const GLYPH_ROOK: Point2[] = mirrorOutline([
  [0.265, 0.0], [0.265, 0.05], [0.205, 0.10], [0.17, 0.16], [0.155, 0.44],
  [0.19, 0.50], [0.235, 0.56], [0.235, 0.74], [0.16, 0.74], [0.16, 0.655],
  [0.08, 0.655], [0.08, 0.74],
])

const GLYPH_BISHOP: Point2[] = mirrorOutline([
  [0.235, 0.0], [0.235, 0.05], [0.18, 0.09], [0.125, 0.13], [0.095, 0.22],
  [0.085, 0.32], [0.135, 0.365], [0.10, 0.395], [0.15, 0.45], [0.165, 0.55],
  [0.14, 0.66], [0.085, 0.75], [0.045, 0.795], [0.02, 0.83], [0.0, 0.86],
])

const GLYPH_QUEEN: Point2[] = mirrorOutline([
  [0.265, 0.0], [0.265, 0.055], [0.205, 0.10], [0.15, 0.15], [0.11, 0.25],
  [0.10, 0.36], [0.155, 0.41], [0.12, 0.445], [0.165, 0.52], [0.195, 0.62],
  [0.215, 0.71], [0.235, 0.78],
  // Five points: two on each side of a tall one on the axis.
  [0.205, 0.90], [0.155, 0.815], [0.10, 0.935], [0.05, 0.845], [0.0, 0.98],
])

const GLYPH_KING: Point2[] = mirrorOutline([
  [0.275, 0.0], [0.275, 0.055], [0.215, 0.105], [0.155, 0.155], [0.115, 0.26],
  [0.105, 0.38], [0.16, 0.43], [0.125, 0.465], [0.17, 0.55], [0.20, 0.65],
  [0.22, 0.74], [0.24, 0.82], [0.185, 0.87], [0.10, 0.895],
  // Half a cross: up the stem, out along the arm, back in, up to the top.
  [0.05, 0.905], [0.05, 0.955], [0.135, 0.955], [0.135, 1.01], [0.05, 1.01], [0.05, 1.08],
])

const GLYPH_KNIGHT: Point2[] = [
  [0.235, 0.0], [0.235, 0.055], [0.175, 0.10], [0.135, 0.155], [0.105, 0.255],
  [0.115, 0.33], [0.15, 0.395], [0.14, 0.45], [0.195, 0.49], [0.24, 0.545],
  [0.23, 0.60], [0.17, 0.615], [0.11, 0.64], [0.075, 0.705], [0.025, 0.74],
  [0.05, 0.79], [-0.005, 0.76], [-0.04, 0.80], [-0.075, 0.74], [-0.135, 0.685],
  [-0.175, 0.59], [-0.185, 0.47], [-0.16, 0.375], [-0.12, 0.295], [-0.135, 0.195],
  [-0.175, 0.115], [-0.235, 0.06], [-0.235, 0.0],
]

const PLINTH: PieceDetail = {
  kind: 'cylinder',
  position: [0, 0.022, 0],
  scale: [0.56, 0.045, 0.56],
}

const slab = (outline: Point2[]): PieceShape => ({
  parts: [{ outline, thickness: 0.1, position: [0, 0, 0], facing: 'viewer' }],
  details: [PLINTH],
})

const glyph: PieceSet = {
  id: 'glyph',
  name: 'Cut-out',
  hint: 'Flat silhouettes stood on end, facing you across the board',
  segments: 20,
  shapes: {
    1: slab(GLYPH_PAWN),
    2: slab(GLYPH_KNIGHT),
    3: slab(GLYPH_BISHOP),
    4: slab(GLYPH_ROOK),
    5: slab(GLYPH_QUEEN),
    6: slab(GLYPH_KING),
  },
}

/* ------------------------------------------------------------ registry -- */

export const PIECE_SETS: PieceSet[] = [classic, facet, glyph]
export const PIECE_SET_BY_ID = new Map(PIECE_SETS.map((set) => [set.id, set]))
export const DEFAULT_PIECE_SET: PieceSet = PIECE_SETS[0]!

export function pieceSetById(id: string): PieceSet | null {
  return PIECE_SET_BY_ID.get(id) ?? null
}

/* ------------------------------------------------------------ previews -- */

/**
 * The side view of a piece, as flat polygons in the same units as the board —
 * the profile mirrored back across the axis, each extruded part in place, and
 * every detail primitive as the shape it reads as edge on. The settings panel
 * draws these straight into an SVG, so a preview cannot drift from the mesh:
 * both come from the tables above.
 */
export function previewOutlines(set: PieceSet, type: number): Point2[][] {
  const shape = set.shapes[type]
  if (!shape) return []
  const outlines: Point2[][] = []

  if (shape.profile) {
    outlines.push(mirrorOutline(shape.profile.map(([radius, y]): Point2 => [radius, y])))
  }

  for (const part of shape.parts ?? []) {
    const [dx, dy] = part.position
    outlines.push(part.outline.map(([x, y]): Point2 => [x + dx, y + dy]))
  }

  for (const detail of shape.details ?? []) {
    const [x, y] = detail.position
    const [width, height] = detail.scale
    switch (detail.kind) {
      case 'sphere':
        outlines.push(arc(x, y, width / 2, 0, 360, 16))
        break
      case 'cone':
        outlines.push([
          [x - width / 2, y - height / 2],
          [x + width / 2, y - height / 2],
          [x, y + height / 2],
        ])
        break
      default:
        outlines.push([
          [x - width / 2, y - height / 2],
          [x + width / 2, y - height / 2],
          [x + width / 2, y + height / 2],
          [x - width / 2, y + height / 2],
        ])
        break
    }
  }

  return outlines
}
