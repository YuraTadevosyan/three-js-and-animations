/**
 * The board: frame, 64 tiles, the glowing floor grid it floats above, and the
 * marker overlays that show selection, legal moves, the last move and check.
 */
import {
  ADDRESS_CLAMP_TO_EDGE, BLEND_ADDITIVE, CULLFACE_NONE, Color, Entity, FILTER_LINEAR, Mesh,
  MeshInstance, StandardMaterial, Texture, Vec3, type AppBase,
} from 'playcanvas'
import { Timeline, ease } from './anim'
import { plane, ring } from './geometry'
import { BOARD_THICKNESS, THEME, TILE, isLightSquare, squareToWorld } from './theme'

export type MarkerKind = 'select' | 'move' | 'capture' | 'last' | 'check' | 'hover'

/** Canvas-drawn grid so the app ships no image files. */
function gridTexture(app: AppBase, size = 512): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')!

  context.fillStyle = '#000000'
  context.fillRect(0, 0, size, size)

  const grid = THEME.board.grid
  context.strokeStyle = `rgba(${Math.round(grid.r * 255)}, ${Math.round(grid.g * 255)}, ${Math.round(grid.b * 255)}, 1)`
  context.lineWidth = 1.25
  const step = size / 32
  context.beginPath()
  for (let i = 0; i <= 32; i++) {
    const p = Math.round(i * step) + 0.5
    context.moveTo(p, 0)
    context.lineTo(p, size)
    context.moveTo(0, p)
    context.lineTo(size, p)
  }
  context.stroke()

  // Every fourth line brighter, so the grid reads at a distance.
  context.strokeStyle = `rgba(${Math.round(grid.r * 255)}, ${Math.round(grid.g * 255)}, ${Math.round(grid.b * 255)}, 1)`
  context.lineWidth = 3
  context.beginPath()
  for (let i = 0; i <= 8; i++) {
    const p = Math.round(i * step * 4) + 0.5
    context.moveTo(p, 0)
    context.lineTo(p, size)
    context.moveTo(0, p)
    context.lineTo(size, p)
  }
  context.stroke()

  // Fade to black at the edges. Additive blending turns black into nothing, so
  // this is what stops the floor from being an obvious square.
  const fade = context.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size * 0.5)
  fade.addColorStop(0, 'rgba(255,255,255,1)')
  fade.addColorStop(0.55, 'rgba(160,160,160,1)')
  fade.addColorStop(1, 'rgba(0,0,0,1)')
  context.globalCompositeOperation = 'multiply'
  context.fillStyle = fade
  context.fillRect(0, 0, size, size)
  context.globalCompositeOperation = 'source-over'

  const texture = new Texture(app.graphicsDevice, {
    name: 'floor-grid',
    width: size,
    height: size,
    mipmaps: true,
    addressU: ADDRESS_CLAMP_TO_EDGE,
    addressV: ADDRESS_CLAMP_TO_EDGE,
    minFilter: FILTER_LINEAR,
    magFilter: FILTER_LINEAR,
  })
  texture.setSource(canvas)
  return texture
}

interface Tile {
  entity: Entity
  material: StandardMaterial
  /** Resting values, so overlapping pulses always restore to the same look. */
  baseColor: Color
  baseIntensity: number
}

interface Marker {
  entity: Entity
  material: StandardMaterial
  kind: MarkerKind
  square: number
  pulse: boolean
  intensity: number
}

export class Board {
  readonly root: Entity
  private readonly tiles = new Map<number, Tile>()
  private readonly markers: Marker[] = []
  private readonly dotMesh: Mesh
  private readonly ringMesh: Mesh
  private readonly squareMesh: Mesh
  private frameMaterial: StandardMaterial | null = null
  private lipMaterial: StandardMaterial | null = null
  private floorMaterial: StandardMaterial | null = null
  private floorTexture: Texture | null = null
  private time = 0

  constructor(
    private readonly app: AppBase,
    parent: Entity,
    private readonly spawn: (timeline: Timeline) => void,
  ) {
    this.root = new Entity('board')
    parent.addChild(this.root)

    const device = app.graphicsDevice
    this.dotMesh = Mesh.fromGeometry(device, ring(0, 0.16, 24))
    this.ringMesh = Mesh.fromGeometry(device, ring(0.34, 0.46, 40))
    this.squareMesh = Mesh.fromGeometry(device, plane(0.94, 0.94))
    // Markers come and go constantly; these shared meshes must not be freed
    // along with the last marker that happened to be using them.
    for (const mesh of [this.dotMesh, this.ringMesh, this.squareMesh]) mesh.incRefCount()

    this.buildFrame()
    this.buildTiles()
    this.buildFloor()
  }

  private buildFrame(): void {
    const material = new StandardMaterial()
    material.diffuse = THEME.board.frame.clone()
    material.emissive = THEME.board.grid.clone()
    material.emissiveIntensity = 0.06
    material.useMetalness = true
    material.metalness = 0.75
    material.gloss = 0.7
    material.update()
    this.frameMaterial = material

    const frame = new Entity('frame')
    frame.addComponent('render', { type: 'box', material, castShadows: true, receiveShadows: true })
    frame.setLocalScale(8 * TILE + 0.7, BOARD_THICKNESS, 8 * TILE + 0.7)
    frame.setLocalPosition(0, -BOARD_THICKNESS / 2 - 0.03, 0)
    this.root.addChild(frame)

    // A thin emissive lip around the rim.
    const lipMaterial = new StandardMaterial()
    lipMaterial.useLighting = false
    lipMaterial.emissive = THEME.board.grid.clone()
    lipMaterial.emissiveIntensity = 0.9
    lipMaterial.blendType = BLEND_ADDITIVE
    lipMaterial.depthWrite = false
    lipMaterial.useFog = false
    lipMaterial.update()
    this.lipMaterial = lipMaterial

    for (const [dx, dz, sx, sz] of [
      [0, 4.32, 8.7, 0.06],
      [0, -4.32, 8.7, 0.06],
      [4.32, 0, 0.06, 8.7],
      [-4.32, 0, 0.06, 8.7],
    ] as const) {
      const lip = new Entity('lip')
      const instance = new MeshInstance(this.squareMesh, lipMaterial)
      instance.castShadow = false
      lip.addComponent('render', { meshInstances: [instance], castShadows: false, receiveShadows: false })
      lip.setLocalPosition(dx, 0.005, dz)
      lip.setLocalScale(sx / 0.94, 1, sz / 0.94)
      this.root.addChild(lip)
    }
  }

  private buildTiles(): void {
    const light = new StandardMaterial()
    light.diffuse = THEME.board.light.clone()
    light.emissive = THEME.board.grid.clone()
    light.emissiveIntensity = 0.05
    light.useMetalness = true
    light.metalness = 0.35
    light.gloss = 0.62
    light.update()

    const dark = new StandardMaterial()
    dark.diffuse = THEME.board.dark.clone()
    dark.emissive = THEME.board.grid.clone()
    dark.emissiveIntensity = 0.02
    dark.useMetalness = true
    dark.metalness = 0.45
    dark.gloss = 0.55
    dark.update()

    for (let square = 0; square < 128; square++) {
      if (square & 0x88) continue
      const { x, z } = squareToWorld(square)
      // Each tile gets its own material: they are pulsed individually when a
      // piece lands, and a shared material would light all 32 of a colour.
      const material = (isLightSquare(square) ? light : dark).clone()
      const tile = new Entity(`tile-${square}`)
      tile.addComponent('render', { type: 'box', material, castShadows: false, receiveShadows: true })
      tile.setLocalScale(TILE * 0.98, 0.06, TILE * 0.98)
      tile.setLocalPosition(x, -0.03, z)
      this.root.addChild(tile)
      this.tiles.set(square, {
        entity: tile,
        material,
        baseColor: material.emissive.clone(),
        baseIntensity: material.emissiveIntensity,
      })
    }
  }

  private buildFloor(): void {
    const material = new StandardMaterial()
    material.useLighting = false
    material.emissive = new Color(1, 1, 1)
    this.floorTexture = gridTexture(this.app)
    material.emissiveMap = this.floorTexture
    material.emissiveIntensity = 0.55
    material.blendType = BLEND_ADDITIVE
    material.depthWrite = false
    material.useFog = false
    material.update()

    const floor = new Entity('floor')
    const instance = new MeshInstance(Mesh.fromGeometry(this.app.graphicsDevice, plane(46, 46)), material)
    instance.castShadow = false
    floor.addComponent('render', { meshInstances: [instance], castShadows: false, receiveShadows: false })
    floor.setLocalPosition(0, -1.35, 0)
    this.root.addChild(floor)
    this.floorMaterial = material
  }

  /**
   * Repaints the board in place. Materials are reused rather than rebuilt, so
   * a colour change costs nothing and never disturbs what is on the board.
   */
  applyPalette(): void {
    for (const [square, tile] of this.tiles) {
      const isLight = isLightSquare(square)
      tile.material.diffuse.copy(isLight ? THEME.board.light : THEME.board.dark)
      tile.material.emissive.copy(THEME.board.grid)
      tile.material.emissiveIntensity = isLight ? 0.05 : 0.02
      tile.baseColor.copy(THEME.board.grid)
      tile.baseIntensity = tile.material.emissiveIntensity
      tile.material.update()
    }

    if (this.frameMaterial) {
      this.frameMaterial.diffuse.copy(THEME.board.frame)
      this.frameMaterial.emissive.copy(THEME.board.grid)
      this.frameMaterial.update()
    }

    if (this.lipMaterial) {
      this.lipMaterial.emissive.copy(THEME.board.grid)
      this.lipMaterial.update()
    }

    // The grid is drawn into a canvas, so its colour lives in pixels and the
    // texture has to be redrawn.
    if (this.floorMaterial) {
      const replacement = gridTexture(this.app)
      this.floorMaterial.emissiveMap = replacement
      this.floorMaterial.update()
      this.floorTexture?.destroy()
      this.floorTexture = replacement
    }
  }

  /* ------------------------------------------------------------ markers -- */

  private markerColor(kind: MarkerKind): Color {
    return THEME.markers[kind].clone()
  }

  private markerMesh(kind: MarkerKind): Mesh {
    if (kind === 'move') return this.dotMesh
    if (kind === 'capture' || kind === 'check') return this.ringMesh
    return this.squareMesh
  }

  addMarker(square: number, kind: MarkerKind): void {
    const { x, z } = squareToWorld(square)
    const material = new StandardMaterial()
    material.useLighting = false
    material.emissive = this.markerColor(kind)
    material.emissiveIntensity = kind === 'last' ? 0.5 : kind === 'hover' ? 0.35 : 1.1
    material.blendType = BLEND_ADDITIVE
    material.depthWrite = false
    material.useFog = false
    // Flat decals stay visible even when the camera dips below the board.
    material.cull = CULLFACE_NONE
    material.update()

    const entity = new Entity(`marker-${kind}-${square}`)
    const instance = new MeshInstance(this.markerMesh(kind), material)
    instance.castShadow = false
    entity.addComponent('render', { meshInstances: [instance], castShadows: false, receiveShadows: false })
    entity.setLocalPosition(x, 0.012 + this.markers.length * 0.0006, z)
    this.root.addChild(entity)

    const marker: Marker = {
      entity,
      material,
      kind,
      square,
      pulse: kind === 'check' || kind === 'select',
      intensity: material.emissiveIntensity,
    }
    this.markers.push(marker)

    if (kind === 'select' || kind === 'move' || kind === 'capture') {
      entity.setLocalScale(0.2, 1, 0.2)
      this.spawn(
        new Timeline().add({
          duration: 0.22,
          easing: ease.outBack,
          onUpdate: (t) => entity.setLocalScale(0.2 + 0.8 * t, 1, 0.2 + 0.8 * t),
        }),
      )
    }
  }

  clearMarkers(kinds?: MarkerKind[]): void {
    for (let i = this.markers.length - 1; i >= 0; i--) {
      const marker = this.markers[i]!
      if (kinds && !kinds.includes(marker.kind)) continue
      marker.entity.destroy()
      marker.material.destroy()
      this.markers.splice(i, 1)
    }
  }

  hasMarker(square: number, kind: MarkerKind): boolean {
    return this.markers.some((marker) => marker.square === square && marker.kind === kind)
  }

  /** A one-off pulse under a square — used when a piece lands. */
  pulse(square: number, color: Color, strength = 1): void {
    const tile = this.tiles.get(square)
    if (!tile) return
    const { material, baseColor, baseIntensity } = tile
    material.emissive = color.clone()
    this.spawn(
      new Timeline().add({
        duration: 0.55,
        easing: ease.outQuart,
        onUpdate: (t) => {
          material.emissiveIntensity = baseIntensity + (1 - t) * strength
          material.update()
        },
        onComplete: () => {
          material.emissive = baseColor.clone()
          material.emissiveIntensity = baseIntensity
          material.update()
        },
      }),
    )
  }

  update(dt: number): void {
    this.time += dt
    for (const marker of this.markers) {
      if (!marker.pulse) continue
      const wave = 0.72 + 0.28 * Math.sin(this.time * (marker.kind === 'check' ? 7 : 3.4))
      marker.material.emissiveIntensity = marker.intensity * wave
      marker.material.update()
    }
  }

  destroy(): void {
    for (const mesh of [this.dotMesh, this.ringMesh, this.squareMesh]) {
      mesh.decRefCount()
      mesh.destroy()
    }
    this.floorTexture?.destroy()
    this.floorTexture = null
  }

  worldPosition(square: number, y = 0): Vec3 {
    const { x, z } = squareToWorld(square)
    return new Vec3(x, y, z)
  }
}
