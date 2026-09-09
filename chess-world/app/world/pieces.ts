/**
 * Piece construction.
 *
 * The shapes themselves live in `sets.ts`; this turns one of those sets into
 * entities. A piece is a surface of revolution (the turned body) plus a handful
 * of children: an extruded silhouette for the knight's head — the one shape a
 * lathe cannot make — and primitives for battlements, crowns and crosses.
 */
import {
  BLEND_NORMAL, Color, Entity, Geometry, GraphicsDevice, Mesh, MeshInstance, StandardMaterial, Vec3,
} from 'playcanvas'
import { extrude, faceted, lathe } from './geometry'
import { DEFAULT_PIECE_SET, type PieceSet, type SilhouettePart } from './sets'
import { THEME, type SideKey } from './theme'

/**
 * The envelope every set is drawn to. The choreography, the camera framing and
 * the capture bursts are all tuned against these, so a set that kept its own
 * heights would knock all three out of true.
 */
export const PIECE_HEIGHT: Record<number, number> = {
  1: 0.62, // pawn
  2: 0.80, // knight
  3: 0.86, // bishop
  4: 0.74, // rook
  5: 0.98, // queen
  6: 1.08, // king
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

/**
 * Repaints both armies from the current theme. The two materials are shared by
 * every piece, so this recolours the whole board in one step.
 */
export function applyPieceMaterials(materials: PieceMaterials): void {
  for (const side of ['white', 'black'] as SideKey[]) {
    const material = materials[side]
    const palette = THEME.pieces[side]
    material.diffuse.copy(palette.body)
    material.emissive.copy(palette.glow)
    material.emissiveIntensity = side === 'white' ? 0.35 : 0.55
    material.update()
  }
}

/* --------------------------------------------------------------- meshes -- */

/**
 * Shared piece meshes, keyed by set and piece.
 *
 * A mesh is reference counted, and destroying a MeshInstance frees the mesh
 * once the last instance lets go of it. These meshes outlive any particular
 * piece — every reset destroys all 32 of them at once, and switching sets
 * destroys them all again — so the cache holds a reference of its own. Without
 * it, the first `sync` after startup would take every piece mesh down with it
 * and leave the board rendering from freed buffers.
 */
export class PieceMeshCache {
  private readonly meshes = new Map<string, Mesh>()

  constructor(private readonly device: GraphicsDevice) {}

  private acquire(key: string, build: () => Geometry): Mesh {
    let mesh = this.meshes.get(key)
    if (!mesh) {
      mesh = Mesh.fromGeometry(this.device, build())
      mesh.incRefCount()
      this.meshes.set(key, mesh)
    }
    return mesh
  }

  /** The turned body, or null for a set whose piece is all silhouette. */
  body(set: PieceSet, type: number): Mesh | null {
    const profile = set.shapes[type]?.profile
    if (!profile) return null
    return this.acquire(`${set.id}:${type}:body`, () => {
      const geometry = lathe(profile, set.segments)
      return set.flat ? faceted(geometry) : geometry
    })
  }

  part(set: PieceSet, type: number, index: number, part: SilhouettePart): Mesh {
    return this.acquire(`${set.id}:${type}:part:${index}`, () => {
      const geometry = extrude(part.outline, part.thickness)
      return set.flat ? faceted(geometry) : geometry
    })
  }

  destroy(): void {
    for (const mesh of this.meshes.values()) {
      mesh.decRefCount()
      mesh.destroy()
    }
    this.meshes.clear()
  }
}

/* -------------------------------------------------------------- factory -- */

function detail(name: string, type: 'box' | 'sphere' | 'cone' | 'cylinder', material: StandardMaterial): Entity {
  const entity = new Entity(name)
  entity.addComponent('render', { type, material, castShadows: true, receiveShadows: false })
  return entity
}

/** Which way a slab is turned, given the army it belongs to. */
function slabYaw(part: SilhouettePart, facing: -1 | 1): number {
  // The outline is drawn facing +X. `board` swings it to look down the board;
  // `viewer` leaves it flat on to the camera and turns the second army round,
  // so the two armies of a cut-out set mirror each other instead of both
  // facing the same way.
  if (part.facing === 'board') return facing === -1 ? -90 : 90
  if (part.facing === 'viewer') return facing === -1 ? 0 : 180
  return 0
}

/**
 * Builds one piece. `facing` is the direction it looks in: -1 for the army
 * that moves first (up the board) and +1 for the other.
 */
export function createPiece(
  meshes: PieceMeshCache,
  set: PieceSet,
  type: number,
  material: StandardMaterial,
  facing: -1 | 1,
): Entity {
  const root = new Entity(`piece-${set.id}-${type}`)
  const shape = set.shapes[type] ?? DEFAULT_PIECE_SET.shapes[type]!

  const bodyMesh = meshes.body(set, type)
  if (bodyMesh) {
    const body = new Entity('body')
    const instance = new MeshInstance(bodyMesh, material)
    instance.castShadow = true
    body.addComponent('render', { meshInstances: [instance], castShadows: true, receiveShadows: true })
    root.addChild(body)
  }

  ;(shape.parts ?? []).forEach((part, index) => {
    const entity = new Entity('silhouette')
    const instance = new MeshInstance(meshes.part(set, type, index, part), material)
    instance.castShadow = true
    entity.addComponent('render', { meshInstances: [instance], castShadows: true, receiveShadows: true })
    entity.setLocalPosition(...part.position)
    entity.setLocalEulerAngles(0, slabYaw(part, facing), 0)
    root.addChild(entity)
  })

  for (const piece of shape.details ?? []) {
    const entity = detail(piece.kind, piece.kind, material)
    entity.setLocalScale(...piece.scale)
    entity.setLocalPosition(...piece.position)
    if (piece.rotation) entity.setLocalEulerAngles(...piece.rotation)
    root.addChild(entity)
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
