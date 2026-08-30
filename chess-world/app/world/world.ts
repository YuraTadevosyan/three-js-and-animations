/**
 * The world: one PlayCanvas application that owns the board, the pieces, the
 * camera rig and the effects, and exposes a small API to the Vue layer —
 * `sync` to place a position, `playMove` to animate one, and pointer callbacks
 * for picking squares. Nothing above this file knows PlayCanvas exists.
 */
import {
  Application, Color, Entity, FILLMODE_NONE, FOG_EXP2, type GraphicsDevice, RESOLUTION_AUTO,
  SHADOW_PCF3_32F, StandardMaterial, TONEMAP_ACES2, Vec3,
} from 'playcanvas'
import { CameraFrame } from 'playcanvas'
import type { BoardPiece, MoveRecord } from '../game/game'
import { Animator, Timeline, ease } from './anim'
import { Board, type MarkerKind } from './board'
import { CameraRig, type CameraMode } from './camera'
import { choreographMove, type CapturedPiece, type MoveScene } from './choreography'
import { Fx } from './fx'
import {
  PieceMeshCache, applyPieceMaterials, createPiece, createPieceMaterials, type PieceMaterials,
} from './pieces'
import { Sound } from './sound'
import {
  THEME, applyPaletteToTheme, sideKey, squareToWorld, worldToSquare, type PaletteValues,
} from './theme'

export interface WorldCallbacks {
  onPick?: (square: number) => void
  onHover?: (square: number) => void
  /** May this square's piece be picked up and dragged right now? */
  canGrab?: (square: number) => boolean
  /** A dragged piece was released. `to` is -1 when dropped off the board. */
  onDrop?: (from: number, to: number) => void
  /** Something threw inside the frame loop. Reported once per distinct message. */
  onFrameError?: (message: string) => void
}

export interface WorldStats {
  fps: number
  frames: number
  /**
   * Completed renders. If `frames` climbs while this stays at zero, the update
   * loop is alive and the *render* is throwing — which leaves the canvas frozen
   * or blank while the HTML interface carries on as if nothing were wrong.
   */
  renders: number
  particles: number
  postProcessing: PostState
  effectsEnabled: boolean
  lastError: string | null
  /** CSS size and backbuffer size — a zero here explains an empty canvas. */
  canvas: string
}

/**
 * `pending` — waiting for proof that plain rendering works before adding
 * post-processing; `unavailable` — it was tried and produced nothing, so it
 * was rolled back.
 */
export type PostState = 'pending' | 'on' | 'off' | 'unavailable'

export interface WorldOptions {
  /**
   * Graphics device override. Production leaves this unset and gets WebGL;
   * the headless test harness passes a null device so the whole world —
   * scene build, move choreography, per-frame update — can be run in Node.
   */
  graphicsDevice?: GraphicsDevice
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
  private dragging = false
  private grab: { square: number; entity: Entity; pointerId: number } | null = null
  private pinchDistance = 0
  private elapsed = 0
  private disposed = false
  private frames = 0
  private renders = 0
  private fps = 0
  private fpsWindow = 0
  private fpsFrames = 0
  private effectsEnabled = true
  private effectFailures = 0
  private lastError: string | null = null
  private keyLight: Entity | null = null
  private whiteRim: Entity | null = null
  private blackRim: Entity | null = null
  private quality: 'high' | 'low' = 'high'
  private postState: PostState = 'pending'
  private rendersAtPost = -1
  private postWatchdog = 0

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly callbacks: WorldCallbacks = {},
    options: WorldOptions = {},
  ) {
    this.app = new Application(canvas, {
      graphicsDevice: options.graphicsDevice,
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
    this.attachInput()

    this.animator.onError = (error) => this.recordError(error)
    this.app.on('update', (dt: number) => this.update(dt))
    this.app.on('postrender', () => this.renders++)
    // A throw inside PlayCanvas's own render pass escapes to the window, so
    // this is the only way to see a driver or shader failure from in here.
    window.addEventListener('error', this.onWindowError)
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
    this.keyLight = key
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
    this.whiteRim = whiteRim

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
    this.blackRim = blackRim

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

  /**
   * Post-processing is the one part of this scene that can disagree with a
   * driver, and when it does the result is a blank canvas rather than an
   * error. So it is never assumed: the plain scene has to render first, and if
   * switching it on stops frames appearing it is rolled straight back.
   */
  private enablePost(): boolean {
    if (this.frame) {
      this.frame.enabled = true
      this.frame.update()
      return true
    }
    try {
      const frame = new CameraFrame(this.app, this.rig.entity.camera!)
      frame.rendering.toneMapping = TONEMAP_ACES2
      frame.rendering.samples = this.quality === 'high' ? 4 : 1
      frame.rendering.sharpness = 0.35
      frame.rendering.renderTargetScale = this.quality === 'high' ? 1 : 0.75
      frame.bloom.intensity = this.quality === 'high' ? 0.035 : 0.02
      frame.bloom.blurLevel = 12
      frame.vignette.inner = 0.55
      frame.vignette.outer = 1.4
      frame.vignette.curvature = 0.6
      frame.vignette.intensity = 0.45
      frame.grading.enabled = true
      frame.grading.saturation = 1.12
      frame.grading.contrast = 1.06
      frame.grading.brightness = 1
      frame.update()
      this.frame = frame
      return true
    } catch (error) {
      this.recordError(error)
      return false
    }
  }

  private disablePost(): void {
    if (!this.frame) return
    this.frame.enabled = false
  }

  /** Runs once per frame; owns the enable-then-verify-then-roll-back dance. */
  private supervisePost(): void {
    if (this.postState === 'pending') {
      // 20 clean frames is proof the plain pipeline works.
      if (this.renders < 20) return
      this.postState = this.enablePost() ? 'on' : 'unavailable'
      this.rendersAtPost = this.renders
      this.postWatchdog = 0
      return
    }

    if (this.postState !== 'on' || this.rendersAtPost < 0) return
    if (++this.postWatchdog < 45) return
    // Nothing rendered in the 45 frames since it was switched on: it is the
    // reason the canvas is blank, so take it back out.
    if (this.renders === this.rendersAtPost) {
      this.disablePost()
      this.postState = 'unavailable'
      this.recordError('post-processing rendered no frames and has been switched off')
    }
    this.rendersAtPost = -1
  }

  setQuality(level: 'high' | 'low'): void {
    this.quality = level
    if (!this.frame) return
    this.frame.rendering.samples = level === 'high' ? 4 : 1
    this.frame.rendering.renderTargetScale = level === 'high' ? 1 : 0.75
    this.frame.bloom.intensity = level === 'high' ? 0.035 : 0.02
    this.frame.update()
  }

  /**
   * Recolours the whole arena: both armies, all 64 squares, the frame, the
   * floor grid, the lights and the fog. Materials are updated in place, so
   * this is safe to call mid-game — nothing is rebuilt and no piece moves.
   */
  applyPalette(values: PaletteValues): void {
    applyPaletteToTheme(values)
    applyPieceMaterials(this.materials)
    this.board.applyPalette()

    const scene = this.app.scene
    scene.ambientLight = THEME.ambient.clone()
    scene.fog.color = THEME.fog.clone()

    const camera = this.rig.entity.camera
    if (camera) camera.clearColor = THEME.background.clone()

    if (this.keyLight?.light) this.keyLight.light.color = THEME.lights.key.clone()
    if (this.whiteRim?.light) this.whiteRim.light.color = THEME.lights.whiteRim.clone()
    if (this.blackRim?.light) this.blackRim.light.color = THEME.lights.blackRim.clone()

    // Existing markers were built from the old colours; rebuild the ones the
    // board owns so nothing is left in a stale hue.
    this.board.clearMarkers(['last', 'hover'])
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
    this.grab = null
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
    this.grab = null
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
    canvas.addEventListener('pointercancel', this.onPointerCancel)
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
    this.dragging = false
    if (this.pointers.size === 2) {
      this.pinchDistance = this.currentPinch()
      this.releaseGrab(true)
      return
    }

    // Pressing a piece selects it *and* picks it up: click-to-move and
    // drag-and-drop are the same gesture until the pointer starts moving.
    const square = this.squareAt(event.clientX, event.clientY)
    if (square < 0) return
    // Only your own pieces respond on press. Every other square waits for the
    // release, so a click on a destination is not handled twice.
    if (!this.callbacks.canGrab?.(square)) return
    this.callbacks.onPick?.(square)
    const instance = this.pieces.get(square)
    if (!instance) return
    this.grab = { square, entity: instance.entity, pointerId: event.pointerId }
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

    // Nothing happens until the pointer clears the dead zone, so a click with
    // a shaky hand stays a click instead of nudging the camera.
    if (!this.dragging) {
      const start = this.pointerStart
      if (!start) return
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) <= DRAG_THRESHOLD) return
      this.dragging = true
    }

    if (this.grab) {
      this.dragPiece(event.clientX, event.clientY)
      return
    }

    this.rig.orbitBy(-dx * 0.006, dy * 0.005)
  }

  /** Carries the held piece along the board plane, lifted off its square. */
  private dragPiece(clientX: number, clientY: number): void {
    const grab = this.grab
    if (!grab) return
    const point = this.boardPoint(clientX, clientY)
    if (point) {
      grab.entity.setLocalPosition(
        Math.max(-4.6, Math.min(4.6, point.x)),
        0.55,
        Math.max(-4.6, Math.min(4.6, point.z)),
      )
    }
    this.callbacks.onHover?.(this.squareAt(clientX, clientY))
  }

  /** Puts a held piece back on its own square. */
  private releaseGrab(restore: boolean): void {
    const grab = this.grab
    if (!grab) return
    if (restore) {
      const home = this.board.worldPosition(grab.square)
      grab.entity.setLocalPosition(home)
    }
    this.grab = null
  }

  private readonly onPointerUp = (event: PointerEvent): void => {
    const start = this.pointerStart
    const wasDragging = this.dragging
    const grab = this.grab
    this.pointers.delete(event.pointerId)
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId)
    this.pointerStart = null
    this.dragging = false
    if (this.pointers.size < 2) this.pinchDistance = 0

    if (grab) {
      const target = this.squareAt(event.clientX, event.clientY)
      // Always put the piece back first: if the drop is legal the move
      // animation replays it from here, and if not it never left.
      this.releaseGrab(true)
      if (wasDragging) this.callbacks.onDrop?.(grab.square, target)
      return
    }

    if (!start || wasDragging) return
    // A click is a press and release without a drag — no time limit, because
    // people hold the button while they decide.
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_THRESHOLD) return
    const square = this.squareAt(event.clientX, event.clientY)
    if (square >= 0) this.callbacks.onPick?.(square)
  }

  private readonly onPointerLeave = (): void => {
    this.callbacks.onHover?.(-1)
  }

  private readonly onPointerCancel = (event: PointerEvent): void => {
    this.releaseGrab(true)
    this.onPointerUp(event)
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

  /** Screen point → the point where the view ray crosses the board plane. */
  private boardPoint(clientX: number, clientY: number): { x: number; z: number } | null {
    const camera = this.rig.entity.camera
    if (!camera) return null
    const rect = this.canvas.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return null
    const x = clientX - rect.left
    const y = clientY - rect.top

    const near = camera.screenToWorld(x, y, camera.nearClip)
    const far = camera.screenToWorld(x, y, camera.farClip)
    const dy = far.y - near.y
    if (!Number.isFinite(dy) || Math.abs(dy) < 1e-5) return null
    const t = -near.y / dy
    if (!Number.isFinite(t) || t < 0 || t > 1) return null
    const point = { x: near.x + (far.x - near.x) * t, z: near.z + (far.z - near.z) * t }
    return Number.isFinite(point.x) && Number.isFinite(point.z) ? point : null
  }

  /** Screen point → board square, or -1. */
  private squareAt(clientX: number, clientY: number): number {
    const point = this.boardPoint(clientX, clientY)
    return point ? worldToSquare(point.x, point.z) : -1
  }

  /* ------------------------------------------------------------ frame ---- */

  private readonly onWindowError = (event: ErrorEvent): void => {
    if (this.disposed) return
    this.recordError(event.error ?? event.message)
  }

  private recordError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error)
    if (this.lastError === message) return
    this.lastError = message
    console.error('[chess-world] frame error', error)
    this.callbacks.onFrameError?.(message)
  }

  /**
   * PlayCanvas schedules the next frame *before* running this, so a throw here
   * does not stop the loop — it just means `render()` is never reached, and the
   * canvas sits frozen on its last good frame while the UI keeps responding.
   * Catching it keeps the board alive even when an effect misbehaves.
   */
  private update(dt: number): void {
    if (this.disposed) return
    const step = Math.min(dt, 0.05)

    this.frames++
    this.fpsWindow += dt
    this.fpsFrames++
    if (this.fpsWindow >= 0.5) {
      this.fps = this.fpsFrames / this.fpsWindow
      this.fpsWindow = 0
      this.fpsFrames = 0
    }

    this.supervisePost()
    if (this.renders === 0 && this.frames === 180) {
      this.recordError('the scene updates but never renders — nothing is reaching the canvas')
    }

    try {
      this.elapsed += step
      this.animator.update(step)
      this.board.update(step)
      this.fx.shakeOffset(step, this.elapsed, this.shake)
      this.rig.update(step, this.shake)
    } catch (error) {
      this.recordError(error)
    }

    if (!this.effectsEnabled) return
    try {
      this.fx.update(step, this.rig.right, this.rig.up)
    } catch (error) {
      this.recordError(error)
      // Particles are the most exotic thing on screen; if they keep failing,
      // drop them rather than lose the whole board.
      if (++this.effectFailures >= 3) {
        this.effectsEnabled = false
        this.fx.clear()
        console.warn('[chess-world] particle effects disabled after repeated errors')
      }
    }
  }

  /** Manual override for the Settings toggle. */
  setPostProcessing(enabled: boolean): void {
    if (enabled) {
      this.postState = this.enablePost() ? 'on' : 'unavailable'
      this.rendersAtPost = this.renders
      this.postWatchdog = 0
      return
    }
    this.disablePost()
    this.postState = 'off'
  }

  stats(): WorldStats {
    return {
      fps: Math.round(this.fps),
      frames: this.frames,
      renders: this.renders,
      particles: this.fx.particles.count,
      postProcessing: this.postState,
      effectsEnabled: this.effectsEnabled,
      lastError: this.lastError,
      canvas: `${this.canvas.clientWidth}×${this.canvas.clientHeight} css, ${this.app.graphicsDevice.width}×${this.app.graphicsDevice.height} buffer`,
    }
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
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel)
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave)
    this.canvas.removeEventListener('wheel', this.onWheel)
    this.observer?.disconnect()
    this.observer = null
    window.removeEventListener('error', this.onWindowError)
    this.animator.finishAll()
    this.sound.destroy()
    this.frame?.destroy()
    this.frame = null
    this.fx.destroy()
    this.board.destroy()
    this.meshes.destroy()
    this.app.destroy()
  }
}

export type { CameraMode, MarkerKind, StandardMaterial }
