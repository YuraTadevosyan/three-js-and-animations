import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'

/**
 * Walking.
 *
 * The visitor is an invisible collision body that the camera rides on top of,
 * rather than a camera that collides on its own. That split is deliberate:
 * Babylon 9 routes `camera.cameraDirection` through a framerate-independent
 * velocity model that reinterprets whatever you write into it (and scales it by
 * frame time in milliseconds), so it is no longer a channel you can push an
 * exact per-frame displacement through. `AbstractMesh.moveWithCollisions` takes
 * a literal displacement and has stayed stable, so the body owns movement and
 * gravity, and the camera is positioned from it every frame.
 *
 * That also means the head bob is free: the camera's transform is ours alone,
 * with nothing else writing to it.
 */

const WALK_SPEED = 3.4
const RUN_SPEED = 6.4
const MOUSE_SENSITIVITY = 0.0022
const TOUCH_SENSITIVITY = 0.005
const PITCH_LIMIT = 1.45
/** Metres between footfalls at a walk. */
const STRIDE = 1.85

/** Half the visitor's height — the body's centre sits this far off the floor. */
export const BODY_HALF_HEIGHT = 0.9
export const BODY_RADIUS = 0.5
/** Camera height above the body centre. */
const EYE_OFFSET = 0.8
/** Snappier than real gravity, which is the convention for anything walkable. */
const GRAVITY = 22
const TERMINAL_VELOCITY = -32

export interface ControllerCallbacks {
  onFootstep: (speed: number) => void
  onInteract: () => void
  onPointerLockChange: (locked: boolean) => void
  onEscape: () => void
}

export class FirstPersonController {
  enabled = false

  private yaw = 0
  private pitch = 0
  private velocity = new Vector3(0, 0, 0)
  private keys = new Set<string>()
  private touchAxis = { x: 0, y: 0 }
  private pendingLook = { x: 0, y: 0 }
  private bobPhase = 0
  private strideAccumulator = 0
  private locked = false
  private verticalVelocity = 0
  private displacement = new Vector3()
  private disposers: Array<() => void> = []

  constructor(
    private camera: UniversalCamera,
    private body: AbstractMesh,
    private canvas: HTMLCanvasElement,
    private callbacks: ControllerCallbacks,
  ) {
    // Nothing but this class writes to the camera transform.
    camera.inputs.clear()
    this.yaw = camera.rotation.y
    this.pitch = camera.rotation.x
    this.bind()
  }

  private bind() {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'escape') {
        this.callbacks.onEscape()
        return
      }
      if (!this.enabled) return
      if (key === 'e' || key === 'enter') {
        this.callbacks.onInteract()
        e.preventDefault()
        return
      }
      // Don't let WASD/space scroll the page behind the canvas.
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
      }
      this.keys.add(key)
    }

    const onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase())

    const onMouseMove = (e: MouseEvent) => {
      if (!this.enabled || !this.locked) return
      this.pendingLook.x += e.movementX * MOUSE_SENSITIVITY
      this.pendingLook.y += e.movementY * MOUSE_SENSITIVITY
    }

    const onPointerLockChange = () => {
      this.locked = document.pointerLockElement === this.canvas
      this.callbacks.onPointerLockChange(this.locked)
      if (!this.locked) this.keys.clear()
    }

    // A blurred window would otherwise leave keys stuck down.
    const onBlur = () => this.keys.clear()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('blur', onBlur)
    document.addEventListener('pointerlockchange', onPointerLockChange)

    this.disposers.push(
      () => window.removeEventListener('keydown', onKeyDown),
      () => window.removeEventListener('keyup', onKeyUp),
      () => window.removeEventListener('mousemove', onMouseMove),
      () => window.removeEventListener('blur', onBlur),
      () => document.removeEventListener('pointerlockchange', onPointerLockChange),
    )
  }

  requestLock() {
    // Chrome rejects the promise if a lock is requested too soon after exiting.
    const result = this.canvas.requestPointerLock?.() as unknown as Promise<void> | undefined
    if (result && typeof result.catch === 'function') result.catch(() => undefined)
  }

  releaseLock() {
    if (document.pointerLockElement === this.canvas) document.exitPointerLock()
  }

  /** Touch joystick, both axes -1..1. */
  setMoveAxis(x: number, y: number) {
    this.touchAxis.x = x
    this.touchAxis.y = y
  }

  /** Touch look, in pixels since the last call. */
  addLookDelta(dx: number, dy: number) {
    if (!this.enabled) return
    this.pendingLook.x += dx * TOUCH_SENSITIVITY
    this.pendingLook.y += dy * TOUCH_SENSITIVITY
  }

  /** Point the camera somewhere specific — used when the tour hands control back. */
  setOrientation(yaw: number, pitch: number) {
    this.yaw = yaw
    this.pitch = pitch
  }

  get orientation() {
    return { yaw: this.yaw, pitch: this.pitch }
  }

  /**
   * Drop the body at an eye position — used when the guided tour ends, so free
   * roam resumes from wherever the tour left the camera rather than snapping.
   */
  teleportToEye(eye: Vector3) {
    this.body.position.set(eye.x, eye.y - EYE_OFFSET, eye.z)
    this.velocity.setAll(0)
    this.verticalVelocity = 0
    this.syncCamera()
  }

  private syncCamera() {
    this.camera.position.set(
      this.body.position.x,
      this.body.position.y + EYE_OFFSET,
      this.body.position.z,
    )
  }

  update(dt: number) {
    const camera = this.camera

    // Look — applied even when movement is locked so the view never feels stuck.
    this.yaw += this.pendingLook.x
    this.pitch += this.pendingLook.y
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch))
    this.pendingLook.x = 0
    this.pendingLook.y = 0

    if (!this.enabled) {
      camera.rotation.set(this.pitch, this.yaw, 0)
      this.syncCamera()
      return
    }

    // Movement intent, in camera space.
    let forward = 0
    let strafe = 0
    if (this.keys.has('w') || this.keys.has('arrowup')) forward += 1
    if (this.keys.has('s') || this.keys.has('arrowdown')) forward -= 1
    if (this.keys.has('a') || this.keys.has('arrowleft')) strafe -= 1
    if (this.keys.has('d') || this.keys.has('arrowright')) strafe += 1

    forward += this.touchAxis.y
    strafe += this.touchAxis.x

    const magnitude = Math.hypot(forward, strafe)
    if (magnitude > 1) {
      forward /= magnitude
      strafe /= magnitude
    }

    const running = this.keys.has('shift')
    const speed = running ? RUN_SPEED : WALK_SPEED

    // Project intent onto the floor plane using the current yaw.
    const sin = Math.sin(this.yaw)
    const cos = Math.cos(this.yaw)
    const targetX = (forward * sin + strafe * cos) * speed
    const targetZ = (forward * cos - strafe * sin) * speed

    // Exponential smoothing — frame-rate independent, unlike a raw lerp factor.
    const smoothing = 1 - Math.exp(-dt * 11)
    this.velocity.x += (targetX - this.velocity.x) * smoothing
    this.velocity.z += (targetZ - this.velocity.z) * smoothing
    if (Math.abs(this.velocity.x) < 0.001) this.velocity.x = 0
    if (Math.abs(this.velocity.z) < 0.001) this.velocity.z = 0

    // Gravity is integrated here rather than left to the scene, so the body's
    // vertical motion is in the same units and the same frame as the walking.
    this.verticalVelocity = Math.max(TERMINAL_VELOCITY, this.verticalVelocity - GRAVITY * dt)

    const beforeY = this.body.position.y
    this.displacement.set(this.velocity.x * dt, this.verticalVelocity * dt, this.velocity.z * dt)
    this.body.moveWithCollisions(this.displacement)

    // If the floor ate the fall, we are standing on something. Without this the
    // downward velocity keeps accumulating and the first unsupported step
    // launches the visitor at terminal velocity.
    const actualDrop = beforeY - this.body.position.y
    const requestedDrop = -this.verticalVelocity * dt
    if (requestedDrop > 0 && actualDrop < requestedDrop * 0.5) this.verticalVelocity = 0

    this.syncCamera()

    // Head bob rides the rotation, so it never fights the body's position.
    const planarSpeed = Math.hypot(this.velocity.x, this.velocity.z)
    const normalized = planarSpeed / RUN_SPEED
    this.bobPhase += dt * (6.2 + normalized * 5.5)
    const bobAmount = Math.min(planarSpeed / WALK_SPEED, 1.2)
    const bobPitch = Math.sin(this.bobPhase * 2) * 0.0075 * bobAmount
    const bobRoll = Math.sin(this.bobPhase) * 0.011 * bobAmount

    camera.rotation.set(this.pitch + bobPitch, this.yaw, bobRoll)

    // Footfalls, spaced by distance travelled rather than by time.
    if (planarSpeed > 0.4) {
      this.strideAccumulator += planarSpeed * dt
      const stride = running ? STRIDE * 1.25 : STRIDE
      if (this.strideAccumulator >= stride) {
        this.strideAccumulator = 0
        this.callbacks.onFootstep(normalized)
      }
    } else {
      this.strideAccumulator = STRIDE * 0.6
    }
  }

  dispose() {
    this.releaseLock()
    this.disposers.forEach((fn) => fn())
    this.disposers = []
    this.keys.clear()
  }
}
