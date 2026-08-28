/**
 * The world: one PlayCanvas application that owns the board, the pieces, the
 * camera rig and the effects, and exposes a small API to the Vue layer —
 * `sync` to place a position, `playMove` to animate one, and pointer callbacks
 * for picking squares. Nothing above this file knows PlayCanvas exists.
 */
import {
  Application, Color, Entity, FILLMODE_NONE, FOG_EXP2, RESOLUTION_AUTO, SHADOW_PCF3_32F,
  StandardMaterial, TONEMAP_ACES2, Vec3,
} from 'playcanvas'
import { CameraFrame } from 'playcanvas'
import type { BoardPiece, MoveRecord } from '../game/game'
import { Animator, Timeline, ease } from './anim'
import { Board, type MarkerKind } from './board'
import { CameraRig, type CameraMode } from './camera'
import { choreographMove, type CapturedPiece, type MoveScene } from './choreography'
import { Fx } from './fx'
import { PieceMeshCache, createPiece, createPieceMaterials, type PieceMaterials } from './pieces'
import { Sound } from './sound'
import { THEME, sideKey, squareToWorld, worldToSquare } from './theme'

export interface WorldCallbacks {
  onPick?: (square: number) => void
  onHover?: (square: number) => void
}

export interface PlayMoveOptions {
  /** Square of the king that is in check after the move, or -1. */
  kingSquare?: number
  /** Piece type a promoting pawn becomes. */
  promoteTo?: number
}

interface PieceInstance {
  entity: Entity
  type: number
  color: 0 | 1
}

const DRAG_THRESHOLD = 7

export class ChessWorld {
  readonly app: Application
  readonly sound = new Sound()
  private readonly root: Entity
  private readonly piecesRoot: Entity
  private readonly rig: CameraRig
  private readonly board: Board
  private readonly fx: Fx
  private readonly animator = new Animator()
  private readonly meshes: PieceMeshCache
  private readonly materials: PieceMaterials
  private readonly pieces = new Map<number, PieceInstance>()
  private readonly shake = new Vec3()
  private readonly pointers = new Map<number, { x: number; y: number }>()
  private frame: CameraFrame | null = null
  private observer: ResizeObserver | null = null
  private pointerStart: { x: number; y: number; time: number } | null = null
  private pinchDistance = 0
  private elapsed = 0
  private disposed = false

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly callbacks: WorldCallbacks = {},
  ) {
    this.app = new Application(canvas, {
      graphicsDeviceOptions: {
        alpha: false,
        antialias: false,
        depth: true,
        powerPreference: 'high-performance',
      },
    })
    this.app.setCanvasFillMode(FILLMODE_NONE)
    this.app.setCanvasResolution(RESOLUTION_AUTO)
    this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2)

    this.root = new Entity('world')
    this.app.root.addChild(this.root)
    this.piecesRoot = new Entity('pieces')
    this.root.addChild(this.piecesRoot)

    this.meshes = new PieceMeshCache(this.app.graphicsDevice)
    this.materials = createPieceMaterials()

    this.rig = new CameraRig(this.app, this.root)
    this.board = new Board(this.app, this.root, (timeline) => this.animator.spawn(timeline))
    this.fx = new Fx(this.app, this.root, (timeline) => this.animator.spawn(timeline))

    this.setupScene()
    this.setupPost()
    this.attachInput()

    this.app.on('update', (dt: number) => this.update(dt))
    this.app.start()
    this.resize()
  }

  /* ---------------------------------------------------------- scene ---- */

  private setupScene(): void {
    const scene = this.app.scene
    scene.ambientLight = THEME.ambient.clone()
    scene.fog.type = FOG_EXP2
    scene.fog.color = THEME.fog.clone()
    scene.fog.density = 0.021
    scene.skyboxIntensity = 0
    scene.exposure = 1.05

    const camera = this.rig.entity.camera!
    camera.clearColor = THEME.background.clone()

    const key = new Entity('key-light')
    key.addComponent('light', {
      type: 'directional',
      color: THEME.lights.key.clone(),
      intensity: 1.35,
      castShadows: true,
      shadowType: SHADOW_PCF3_32F,
      shadowResolution: 2048,
      shadowDistance: 26,
      shadowBias: 0.03,
      normalOffsetBias: 0.06,
      shadowIntensity: 0.7,
    })
    key.setLocalEulerAngles(58, 32, 0)
    this.root.addChild(key)

    // Rim lights sit behind each army, so pieces read as lit glass edges.
    const whiteRim = new Entity('white-rim')
    whiteRim.addComponent('light', {
      type: 'omni',
      color: THEME.lights.whiteRim.clone(),
      intensity: 3.2,
      range: 13,
      castShadows: false,
    })
    whiteRim.setLocalPosition(0, 1.6, 6.6)
    this.root.addChild(whiteRim)

    const blackRim = new Entity('black-rim')
    blackRim.addComponent('light', {
      type: 'omni',
      color: THEME.lights.blackRim.clone(),
      intensity: 3.2,
      range: 13,
      castShadows: false,
    })
    blackRim.setLocalPosition(0, 1.6, -6.6)
    this.root.addChild(blackRim)

    const fill = new Entity('fill-light')
    fill.addComponent('light', {
      type: 'directional',
      color: new Color(0.35, 0.55, 0.9),
      intensity: 0.35,
      castShadows: false,
    })
    fill.setLocalEulerAngles(-40, -140, 0)
    this.root.addChild(fill)
  }

  private setupPost(): void {
    try {
      const frame = new CameraFrame(this.app, this.rig.entity.camera!)
      frame.rendering.toneMapping = TONEMAP_ACES2
      frame.rendering.samples = 4
      frame.rendering.sharpness = 0.35
      frame.bloom.intensity = 0.035
      frame.bloom.blurLevel = 12
      frame.vignette.inner = 0.55
      frame.vignette.outer = 1.4
      frame.vignette.curvature = 0.6
      frame.vignette.intensity = 0.45
      frame.grading.enabled = true
      frame.grading.saturation = 1.12
      frame.grading.contrast = 1.06
      frame.grading.brightness = 1.0
      frame.update()
      this.frame = frame
    } catch (error) {
      // Post-processing needs an HDR-capable float render target; without one
      // the scene still renders, just without bloom.
      console.warn('[chess-world] post-processing unavailable', error)
    }
  }

  setQuality(level: 'high' | 'low'): void {
    if (!this.frame) return
    this.frame.rendering.samples = level === 'high' ? 4 : 1
    this.frame.rendering.renderTargetScale = level === 'high' ? 1 : 0.75
    this.frame.bloom.intensity = level === 'high' ? 0.035 : 0.02
    this.frame.update()
  }

  /* ---------------------------------------------------------- pieces ---- */

  private spawnPiece(square: number, type: number, color: 0 | 1): PieceInstance {
    const material = color === 0 ? this.materials.white : this.materials.black
    const entity = createPiece(this.meshes, type, material, color === 0 ? -1 : 1)
    const { x, z } = squareToWorld(square)
    entity.setLocalPosition(x, 0, z)
    this.piecesRoot.addChild(entity)
    const instance: PieceInstance = { entity, type, color }
    this.pieces.set(square, instance)
    return instance
  }

  /** Places a whole position at once, with an optional arrival animation. */
  sync(position: BoardPiece[], animate = false): void {
    this.animator.finishAll()
    this.fx.clear()
    for (const instance of this.pieces.values()) instance.entity.destroy()
    this.pieces.clear()

    for (const piece of position) {
      const instance = this.spawnPiece(piece.square, piece.type, piece.color)
      if (!animate) continue
      const target = squareToWorld(piece.square)
      const delay = (piece.square & 7) * 0.03 + (7 - (piece.square >> 4)) * 0.04
      instance.entity.setLocalScale(0.001, 0.001, 0.001)
      this.animator.spawn(
        new Timeline().at(delay, {
          duration: 0.55,
          easing: ease.outElastic,
          onUpdate: (t) => {
            instance.entity.setLocalScale(t, t, t)
            instance.entity.setLocalPosition(target.x, (1 - t) * 1.4, target.z)
          },
          onComplete: () => {
            instance.entity.setLocalScale(1, 1, 1)
            instance.entity.setLocalPosition(target.x, 0, target.z)
          },
        }),
      )
    }

    this.board.clearMarkers()
  }

  /**
   * Animates one move. The registry is updated immediately so the next move can
   * be built while this one is still playing; only the visuals are queued.
   */
  playMove(record: MoveRecord, options: PlayMoveOptions = {}): Promise<void> {
    const mover = this.pieces.get(record.from)
    if (!mover) return Promise.resolve()

    const fromPosition = this.board.worldPosition(record.from)
    const toPosition = this.board.worldPosition(record.to)

    let captured: CapturedPiece | null = null
    const victim = record.captured ? this.pieces.get(record.capturedSquare) : undefined
    if (victim) {
      this.pieces.delete(record.capturedSquare)
      captured = {
        entity: victim.entity,
        square: record.capturedSquare,
        type: victim.type,
        side: sideKey(victim.color),
        dispose: () => victim.entity.destroy(),
      }
    }

    let rook: MoveScene['rook'] = null
    if (record.castle) {
      const rookInstance = this.pieces.get(record.castle.rookFrom)
      if (rookInstance) {
        this.pieces.delete(record.castle.rookFrom)
        this.pieces.set(record.castle.rookTo, rookInstance)
        rook = {
          entity: rookInstance.entity,
          from: this.board.worldPosition(record.castle.rookFrom),
          to: this.board.worldPosition(record.castle.rookTo),
          toSquare: record.castle.rookTo,
        }
      }
    }

    this.pieces.delete(record.from)
    this.pieces.set(record.to, mover)

    // A promoting pawn is replaced by a piece created up front and revealed
    // mid-animation, so the registry never holds a pawn on the back rank.
    let promote: (() => Entity) | undefined
    if (record.promotion) {
      const replacement = createPiece(
        this.meshes,
        record.promotion,
        mover.color === 0 ? this.materials.white : this.materials.black,
        mover.color === 0 ? -1 : 1,
      )
      replacement.setLocalPosition(toPosition)
      replacement.setLocalScale(0.001, 0.001, 0.001)
      replacement.enabled = false
      this.piecesRoot.addChild(replacement)
      const pawnEntity = mover.entity
      this.pieces.set(record.to, { entity: replacement, type: record.promotion, color: mover.color })
      promote = () => {
        pawnEntity.destroy()
        replacement.enabled = true
        return replacement
      }
    }

    const kingSquare = options.kingSquare ?? -1
    const kingEntity = kingSquare >= 0 ? (this.pieces.get(kingSquare)?.entity ?? null) : null

    const scene: MoveScene = {
      entity: mover.entity,
      type: mover.type,
      side: sideKey(mover.color),
      from: record.from,
      to: record.to,
      fromPosition,
      toPosition,
      captured,
      rook,
      promote,
      check: record.check,
      mate: record.mate,
      board: this.board,
      fx: this.fx,
      camera: this.rig,
      sound: {
        step: (side) => this.sound.step(side),
        slide: (side) => this.sound.slide(side),
        leap: (side) => this.sound.leap(side),
        impact: (strength) => this.sound.impact(strength),
        teleport: (side) => this.sound.teleport(side),
        capture: () => this.sound.capture(),
        check: () => this.sound.check(),
        mate: () => this.sound.mate(),
        promote: () => this.sound.promote(),
      },
      onArrive: () => {
        this.board.clearMarkers(['last'])
        this.board.addMarker(record.from, 'last')
        this.board.addMarker(record.to, 'last')
      },
    }

    const timeline = choreographMove(scene, kingSquare, kingEntity)
    return this.animator.play(timeline)
  }

  /* --------------------------------------------------------- markers ---- */

  setMarkers(markers: { square: number; kind: MarkerKind }[], replace: MarkerKind[]): void {
    this.board.clearMarkers(replace)
    for (const marker of markers) this.board.addMarker(marker.square, marker.kind)
  }

  clearMarkers(kinds?: MarkerKind[]): void {
    this.board.clearMarkers(kinds)
  }

  /* ---------------------------------------------------------- camera ---- */

  setCameraMode(mode: CameraMode): void {
    this.rig.mode = mode
    if (mode === 'orbit') return
    this.rig.wide()
  }

  faceSide(color: 0 | 1, immediate = false): void {
    this.rig.faceSide(color, immediate)
  }

  setSpeed(scale: number): void {
    this.animator.timeScale = scale
  }

  get busy(): boolean {
    return this.animator.busy
  }

  /** Drops every queued animation and jumps to the end state. */
  finishAnimations(): void {
    this.animator.finishAll()
    this.fx.clear()
  }

  /* ----------------------------------------------------------- input ---- */

  private attachInput(): void {
    const canvas = this.canvas
    canvas.style.touchAction = 'none'

    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerUp)
    canvas.addEventListener('pointerleave', this.onPointerLeave)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })

    this.observer = new ResizeObserver(() => this.resize())
    this.observer.observe(canvas.parentElement ?? canvas)
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.sound.resume()
    this.canvas.setPointerCapture(event.pointerId)
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    this.pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() }
    if (this.pointers.size === 2) this.pinchDistance = this.currentPinch()
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const previous = this.pointers.get(event.pointerId)
    if (!previous) {
      const square = this.squareAt(event.clientX, event.clientY)
      this.callbacks.onHover?.(square)
      return
    }

    const dx = event.clientX - previous.x
    const dy = event.clientY - previous.y
    previous.x = event.clientX
    previous.y = event.clientY

    if (this.pointers.size >= 2) {
      const distance = this.currentPinch()
      if (this.pinchDistance > 0) this.rig.zoomBy((this.pinchDistance - distance) * 0.03)
      this.pinchDistance = distance
      return
    }

    this.rig.orbitBy(-dx * 0.006, dy * 0.005)
  }

  private readonly onPointerUp = (event: PointerEvent): void => {
    const start = this.pointerStart
    this.pointers.delete(event.pointerId)
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId)
    this.pointerStart = null
    if (this.pointers.size < 2) this.pinchDistance = 0
    if (!start) return

    const travelled = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    const held = performance.now() - start.time
    // A click is a tap that did not turn into a drag.
    if (travelled > DRAG_THRESHOLD || held > 600) return
    const square = this.squareAt(event.clientX, event.clientY)
    if (square >= 0) this.callbacks.onPick?.(square)
  }

  private readonly onPointerLeave = (): void => {
    this.callbacks.onHover?.(-1)
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault()
    this.rig.zoomBy(Math.sign(event.deltaY) * 0.75)
  }

  private currentPinch(): number {
    const points = [...this.pointers.values()]
    if (points.length < 2) return 0
    return Math.hypot(points[0]!.x - points[1]!.x, points[0]!.y - points[1]!.y)
  }

  /** Screen point → board square, by intersecting the view ray with y = 0. */
  private squareAt(clientX: number, clientY: number): number {
    const camera = this.rig.entity.camera
    if (!camera) return -1
    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    const near = camera.screenToWorld(x, y, camera.nearClip)
    const far = camera.screenToWorld(x, y, camera.farClip)
    const dy = far.y - near.y
    if (Math.abs(dy) < 1e-5) return -1
    const t = -near.y / dy
    if (t < 0 || t > 1) return -1
    return worldToSquare(near.x + (far.x - near.x) * t, near.z + (far.z - near.z) * t)
  }

  /* ------------------------------------------------------------ frame ---- */

  private update(dt: number): void {
    if (this.disposed) return
    const step = Math.min(dt, 0.05)
    this.elapsed += step
    this.animator.update(step)
    this.board.update(step)
    this.fx.shakeOffset(step, this.elapsed, this.shake)
    this.rig.update(step, this.shake)
    this.fx.update(step, this.rig.right, this.rig.up)
  }

  resize(): void {
    const parent = this.canvas.parentElement
    if (!parent) return
    const width = Math.max(1, parent.clientWidth)
    const height = Math.max(1, parent.clientHeight)
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.app.resizeCanvas(width, height)
  }

  destroy(): void {
    if (this.disposed) return
    this.disposed = true
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerup', this.onPointerUp)
    this.canvas.removeEventListener('pointercancel', this.onPointerUp)
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave)
    this.canvas.removeEventListener('wheel', this.onWheel)
    this.observer?.disconnect()
    this.observer = null
    this.animator.finishAll()
    this.sound.destroy()
    this.frame?.destroy()
    this.frame = null
    this.meshes.destroy()
    this.app.destroy()
  }
}

export type { CameraMode, MarkerKind, StandardMaterial }
