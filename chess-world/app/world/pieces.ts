/**
 * Piece construction.
 *
 * Each piece is a surface of revolution (the turned body) plus a handful of
 * detail children: battlements on the rook, a spiked crown on the queen, a
 * cross on the king, and for the knight an extruded silhouette, because a horse
 * head is the one shape a lathe cannot make.
 */
import {
  BLEND_NORMAL, Color, Entity, GraphicsDevice, Mesh, MeshInstance, StandardMaterial, Vec3,
} from 'playcanvas'
import { extrude, lathe, type Point2, type ProfilePoint } from './geometry'
import { THEME, type SideKey } from './theme'

export const PIECE_HEIGHT: Record<number, number> = {
  1: 0.62, // pawn
  2: 0.80, // knight
  3: 0.86, // bishop
  4: 0.74, // rook
  5: 0.98, // queen
  6: 1.08, // king
}

/* ------------------------------------------------------------- profiles -- */

const PAWN: ProfilePoint[] = [
  [0.235, 0.0], [0.235, 0.045], [0.185, 0.08], [0.125, 0.12], [0.1, 0.155],
  [0.082, 0.235], [0.086, 0.30], [0.138, 0.335], [0.112, 0.365], [0.098, 0.385],
  [0.146, 0.44], [0.157, 0.485], [0.138, 0.54], [0.092, 0.585], [0.0, 0.62],
]

const ROOK: ProfilePoint[] = [
  [0.265, 0.0], [0.265, 0.05], [0.215, 0.095], [0.17, 0.145], [0.152, 0.30],
  [0.152, 0.45], [0.186, 0.485], [0.176, 0.52], [0.214, 0.58], [0.232, 0.63],
  [0.232, 0.74], [0.188, 0.74], [0.188, 0.66], [0.0, 0.66],
]

const KNIGHT_BASE: ProfilePoint[] = [
  [0.26, 0.0], [0.26, 0.05], [0.212, 0.095], [0.168, 0.145], [0.15, 0.24],
  [0.15, 0.30], [0.175, 0.335], [0.15, 0.37],
]

const BISHOP: ProfilePoint[] = [
  [0.245, 0.0], [0.245, 0.05], [0.198, 0.09], [0.135, 0.13], [0.098, 0.175],
  [0.085, 0.28], [0.088, 0.35], [0.15, 0.395], [0.12, 0.425], [0.104, 0.45],
  [0.152, 0.52], [0.163, 0.58], [0.145, 0.65], [0.1, 0.71], [0.055, 0.745],
  [0.048, 0.775], [0.075, 0.80], [0.06, 0.83], [0.0, 0.86],
]

const QUEEN: ProfilePoint[] = [
  [0.275, 0.0], [0.275, 0.055], [0.222, 0.1], [0.155, 0.15], [0.115, 0.2],
  [0.1, 0.33], [0.105, 0.42], [0.172, 0.47], [0.138, 0.5], [0.12, 0.53],
  [0.165, 0.6], [0.195, 0.67], [0.212, 0.75], [0.19, 0.79], [0.148, 0.8],
  [0.148, 0.82], [0.0, 0.82],
]

const KING: ProfilePoint[] = [
  [0.285, 0.0], [0.285, 0.055], [0.23, 0.105], [0.16, 0.155], [0.118, 0.21],
  [0.102, 0.35], [0.108, 0.44], [0.178, 0.49], [0.142, 0.52], [0.125, 0.55],
  [0.17, 0.62], [0.2, 0.69], [0.212, 0.77], [0.188, 0.815], [0.15, 0.825],
  [0.15, 0.845], [0.0, 0.845],
]

/**
 * The knight's head, drawn as a side view in the XY plane and extruded. Runs
 * clockwise from the base of the neck, up the mane, over the ears, down the
 * face to the muzzle, then back along the jaw.
 */
const KNIGHT_HEAD: Point2[] = [
  [-0.115, 0.0], [-0.16, 0.115], [-0.175, 0.235], [-0.14, 0.325], [-0.07, 0.395],
  [-0.085, 0.45], [-0.03, 0.415], [0.01, 0.45], [0.04, 0.40], [0.115, 0.375],
  [0.185, 0.315], [0.225, 0.245], [0.235, 0.185], [0.17, 0.17], [0.105, 0.185],
  [0.06, 0.155], [0.045, 0.075], [0.075, 0.0],
]

const PROFILES: Record<number, ProfilePoint[]> = {
  1: PAWN,
  2: KNIGHT_BASE,
  3: BISHOP,
  4: ROOK,
  5: QUEEN,
  6: KING,
}

/* ------------------------------------------------------------ materials -- */

export interface PieceMaterials {
  white: StandardMaterial
  black: StandardMaterial
}

function sideMaterial(side: SideKey): StandardMaterial {
  const palette = THEME.pieces[side]
  const material = new StandardMaterial()
  material.diffuse = palette.body.clone()
  material.emissive = palette.glow.clone()
  material.emissiveIntensity = side === 'white' ? 0.35 : 0.55
  material.useMetalness = true
  material.metalness = 0.86
  material.gloss = 0.92
  material.blendType = BLEND_NORMAL
  material.update()
  return material
}

export function createPieceMaterials(): PieceMaterials {
  return { white: sideMaterial('white'), black: sideMaterial('black') }
}

/* --------------------------------------------------------------- meshes -- */

/**
 * Shared piece meshes.
 *
 * A mesh is reference counted, and destroying a MeshInstance frees the mesh
 * once the last instance lets go of it. These meshes outlive any particular
 * piece — every reset destroys all 32 of them at once — so the cache holds a
 * reference of its own. Without it, the first `sync` after startup would take
 * every piece mesh down with it and leave the board rendering from freed
 * buffers.
 */
export class PieceMeshCache {
  private readonly bodies = new Map<number, Mesh>()
  private knightHead: Mesh | null = null

  constructor(private readonly device: GraphicsDevice) {}

  body(type: number): Mesh {
    let mesh = this.bodies.get(type)
    if (!mesh) {
      mesh = Mesh.fromGeometry(this.device, lathe(PROFILES[type]!, 28))
      mesh.incRefCount()
      this.bodies.set(type, mesh)
    }
    return mesh
  }

  head(): Mesh {
    if (!this.knightHead) {
      this.knightHead = Mesh.fromGeometry(this.device, extrude(KNIGHT_HEAD, 0.19))
      this.knightHead.incRefCount()
    }
    return this.knightHead
  }

  destroy(): void {
    for (const mesh of this.bodies.values()) {
      mesh.decRefCount()
      mesh.destroy()
    }
    this.bodies.clear()
    if (this.knightHead) {
      this.knightHead.decRefCount()
      this.knightHead.destroy()
      this.knightHead = null
    }
  }
}

/* -------------------------------------------------------------- factory -- */

function detail(name: string, type: 'box' | 'sphere' | 'cone' | 'cylinder', material: StandardMaterial): Entity {
  const entity = new Entity(name)
  entity.addComponent('render', { type, material, castShadows: true, receiveShadows: false })
  return entity
}

/**
 * Builds one piece. `facing` is the direction the knight looks in: -1 for the
 * white army (up the board) and +1 for black.
 */
export function createPiece(
  meshes: PieceMeshCache,
  type: number,
  material: StandardMaterial,
  facing: -1 | 1,
): Entity {
  const root = new Entity(`piece-${type}`)

  const body = new Entity('body')
  const instance = new MeshInstance(meshes.body(type), material)
  instance.castShadow = true
  body.addComponent('render', { meshInstances: [instance], castShadows: true, receiveShadows: true })
  root.addChild(body)

  switch (type) {
    case 2: {
      const head = new Entity('head')
      const headInstance = new MeshInstance(meshes.head(), material)
      headInstance.castShadow = true
      head.addComponent('render', { meshInstances: [headInstance], castShadows: true, receiveShadows: true })
      head.setLocalPosition(0, 0.35, 0)
      // The silhouette is drawn facing +X, so turn it to face down the board.
      head.setLocalEulerAngles(0, facing === -1 ? -90 : 90, 0)
      root.addChild(head)
      break
    }
    case 4: {
      // Four battlements around the crown.
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
        const merlon = detail('merlon', 'box', material)
        merlon.setLocalScale(0.1, 0.1, 0.1)
        merlon.setLocalPosition(Math.cos(angle) * 0.155, 0.755, Math.sin(angle) * 0.155)
        merlon.setLocalEulerAngles(0, (-angle * 180) / Math.PI, 0)
        root.addChild(merlon)
      }
      break
    }
    case 3: {
      const finial = detail('finial', 'sphere', material)
      finial.setLocalScale(0.075, 0.075, 0.075)
      finial.setLocalPosition(0, 0.885, 0)
      root.addChild(finial)
      break
    }
    case 5: {
      // A ring of points, plus the orb they surround.
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const spike = detail('point', 'cone', material)
        spike.setLocalScale(0.062, 0.11, 0.062)
        spike.setLocalPosition(Math.cos(angle) * 0.155, 0.855, Math.sin(angle) * 0.155)
        spike.setLocalEulerAngles((Math.sin(angle) * 22), 0, -(Math.cos(angle) * 22))
        root.addChild(spike)
      }
      const orb = detail('orb', 'sphere', material)
      orb.setLocalScale(0.115, 0.115, 0.115)
      orb.setLocalPosition(0, 0.885, 0)
      root.addChild(orb)
      break
    }
    case 6: {
      const collar = detail('collar', 'cylinder', material)
      collar.setLocalScale(0.3, 0.045, 0.3)
      collar.setLocalPosition(0, 0.855, 0)
      root.addChild(collar)
      const stem = detail('cross-stem', 'box', material)
      stem.setLocalScale(0.052, 0.2, 0.052)
      stem.setLocalPosition(0, 0.965, 0)
      root.addChild(stem)
      const arm = detail('cross-arm', 'box', material)
      arm.setLocalScale(0.15, 0.05, 0.052)
      arm.setLocalPosition(0, 0.995, 0)
      root.addChild(arm)
      break
    }
    default:
      break
  }

  return root
}

/** Where a piece's glow should originate — roughly its visual centre of mass. */
export function pieceCore(type: number): Vec3 {
  return new Vec3(0, PIECE_HEIGHT[type]! * 0.55, 0)
}

export const PIECE_MATERIAL_BASE = {
  whiteEmissive: 0.35,
  blackEmissive: 0.55,
} as const

export function tintFor(side: SideKey): Color {
  return THEME.pieces[side].glow.clone()
}
