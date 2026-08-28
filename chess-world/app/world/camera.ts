/**
 * Camera rig.
 *
 * An orbit camera the viewer can drag, which also takes direction: in Follow
 * and Cinema modes it swings to a three-quarter view of the move about to be
 * played, drops for captures, and pulls back out when the board goes quiet.
 */
import { Entity, Vec3, type AppBase } from 'playcanvas'
import { clamp, lerpAngle } from './anim'
import { squareToWorld } from './theme'

export type CameraMode = 'orbit' | 'follow' | 'cinema'

const MIN_ELEVATION = 0.12
const MAX_ELEVATION = 1.45
const HOME_TARGET = new Vec3(0, 0.35, 0)
const MIN_DISTANCE = 4.2
const MAX_DISTANCE = 18

interface Pose {
  azimuth: number
  elevation: number
  distance: number
  target: Vec3
}

export class CameraRig {
  readonly entity: Entity
  mode: CameraMode = 'follow'
  /** Which side is at the bottom of the screen. */
  orientation: 0 | 1 = 0

  private current: Pose
  private desired: Pose
  /** Higher is snappier. Dragging is instant; scripted moves ease. */
  private responsiveness = 3.2
  private drift = 0
  private readonly offset = new Vec3()
  private readonly position = new Vec3()
  private idleTime = 0

  constructor(app: AppBase, parent: Entity) {
    this.entity = new Entity('camera')
    this.entity.addComponent('camera', {
      fov: 42,
      nearClip: 0.1,
      farClip: 200,
    })
    parent.addChild(this.entity)

    this.current = { azimuth: 0, elevation: 0.72, distance: 12.4, target: new Vec3(0, 0.35, 0) }
    this.desired = {
      azimuth: 0,
      elevation: 0.72,
      distance: 12.4,
      target: new Vec3(0, 0.35, 0),
    }
    void app
  }

  /** Sits behind the given side, looking down the board. */
  faceSide(color: 0 | 1, immediate = false): void {
    this.orientation = color
    this.desired.azimuth = color === 0 ? 0 : Math.PI
    this.desired.elevation = 0.72
    this.desired.distance = 12.4
    this.desired.target.set(0, 0.35, 0)
    if (immediate) {
      this.current.azimuth = this.desired.azimuth
      this.current.elevation = this.desired.elevation
      this.current.distance = this.desired.distance
      this.current.target.copy(this.desired.target)
    }
  }

  /** Pulls back to a full view of the board without changing the angle. */
  wide(): void {
    this.desired.distance = clamp(12.4, MIN_DISTANCE, MAX_DISTANCE)
    this.desired.elevation = 0.72
    this.desired.target.set(0, 0.35, 0)
    this.responsiveness = 1.7
  }

  orbitBy(deltaAzimuth: number, deltaElevation: number): void {
    this.desired.azimuth += deltaAzimuth
    this.desired.elevation = clamp(this.desired.elevation + deltaElevation, MIN_ELEVATION, MAX_ELEVATION)
    this.current.azimuth += deltaAzimuth * 0.65
    this.current.elevation = clamp(this.current.elevation + deltaElevation * 0.65, MIN_ELEVATION, MAX_ELEVATION)
    this.responsiveness = 12
  }

  zoomBy(delta: number): void {
    this.desired.distance = clamp(this.desired.distance + delta, MIN_DISTANCE, MAX_DISTANCE)
    this.responsiveness = 8
  }

  /**
   * Frames a move: the camera swings to look across the path rather than down
   * it, so a knight's arc or a queen's slide is seen side-on.
   */
  frameMove(from: number, to: number, options: { drama?: number; hold?: boolean } = {}): void {
    if (this.mode === 'orbit') return
    const a = squareToWorld(from)
    const b = squareToWorld(to)
    const midX = (a.x + b.x) / 2
    const midZ = (a.z + b.z) / 2
    const span = Math.hypot(b.x - a.x, b.z - a.z)
    const drama = options.drama ?? 0

    // Look at the move from one side of its axis; pick whichever side keeps the
    // camera closer to where it already is, so the swing stays short.
    const pathAngle = Math.atan2(b.x - a.x, b.z - a.z)
    const optionA = pathAngle + Math.PI / 2
    const optionB = pathAngle - Math.PI / 2
    const distanceTo = (angle: number) => Math.abs(((angle - this.current.azimuth + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
    const chosen = distanceTo(optionA) <= distanceTo(optionB) ? optionA : optionB

    const homeAzimuth = this.orientation === 0 ? 0 : Math.PI
    // Blend the dramatic angle with the home view — a full swing on every move
    // is nauseating, so quiet moves barely move the camera.
    const blend = 0.25 + drama * 0.55
    this.desired.azimuth = lerpAngle(homeAzimuth, chosen, blend)
    this.desired.elevation = clamp(0.72 - drama * 0.34, MIN_ELEVATION, MAX_ELEVATION)
    this.desired.distance = clamp(11.4 - drama * 3.4 + span * 0.28, MIN_DISTANCE, MAX_DISTANCE)
    this.desired.target.set(midX, 0.42 + drama * 0.18, midZ)
    this.responsiveness = 2.4 + drama * 1.6
    this.idleTime = 0
  }

  /** Slow push-in on a single square — check, mate, promotion. */
  focus(square: number, options: { distance?: number; elevation?: number } = {}): void {
    if (this.mode === 'orbit') return
    const { x, z } = squareToWorld(square)
    this.desired.target.set(x, 0.5, z)
    this.desired.distance = clamp(options.distance ?? 6.4, MIN_DISTANCE, MAX_DISTANCE)
    this.desired.elevation = clamp(options.elevation ?? 0.42, MIN_ELEVATION, MAX_ELEVATION)
    this.responsiveness = 2.1
    this.idleTime = 0
  }

  update(dt: number, shake: Vec3): void {
    this.idleTime += dt

    if (this.mode === 'cinema') {
      // A slow crawl keeps the scene alive between moves.
      this.drift += dt * 0.055
      this.desired.azimuth += Math.sin(this.drift) * dt * 0.16
    }

    // After a while with nothing happening, drift back to the wide view.
    if (this.mode !== 'orbit' && this.idleTime > 3.5) {
      const home = this.orientation === 0 ? 0 : Math.PI
      this.desired.azimuth = lerpAngle(this.desired.azimuth, home, Math.min(1, dt * 0.35))
      this.desired.elevation += (0.72 - this.desired.elevation) * Math.min(1, dt * 0.4)
      this.desired.distance += (12.4 - this.desired.distance) * Math.min(1, dt * 0.4)
      this.desired.target.lerp(this.desired.target, HOME_TARGET, Math.min(1, dt * 0.5))
    }

    const blend = 1 - Math.exp(-this.responsiveness * dt)
    this.current.azimuth = lerpAngle(this.current.azimuth, this.desired.azimuth, blend)
    this.current.elevation += (this.desired.elevation - this.current.elevation) * blend
    this.current.distance += (this.desired.distance - this.current.distance) * blend
    this.current.target.lerp(this.current.target, this.desired.target, blend)
    this.responsiveness += (3.2 - this.responsiveness) * Math.min(1, dt * 2)

    const cosElevation = Math.cos(this.current.elevation)
    this.position.set(
      this.current.target.x + Math.sin(this.current.azimuth) * cosElevation * this.current.distance,
      this.current.target.y + Math.sin(this.current.elevation) * this.current.distance,
      this.current.target.z + Math.cos(this.current.azimuth) * cosElevation * this.current.distance,
    )
    this.offset.copy(this.position).add(shake)
    this.entity.setPosition(this.offset)
    this.entity.lookAt(
      this.current.target.x + shake.x * 0.35,
      this.current.target.y + shake.y * 0.35,
      this.current.target.z + shake.z * 0.35,
    )
  }

  get right(): Vec3 {
    return this.entity.right
  }

  get up(): Vec3 {
    return this.entity.up
  }
}
