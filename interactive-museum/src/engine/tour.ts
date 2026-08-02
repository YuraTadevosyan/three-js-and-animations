import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { EYE_HEIGHT, ROOMS, type RoomId } from '@/data/museum'
import { roomBounds } from './shell'

/**
 * The guided tour, for visitors who would rather be shown around.
 *
 * Between two rooms the camera follows a quadratic bezier whose control point
 * sits in the doorway, so the path always threads the gap instead of clipping a
 * wall corner. While parked in a room it pans slowly across the exhibits.
 */

export interface TourStop {
  room: RoomId
  position: Vector3
  /** Where the camera looks on arrival. */
  target: Vector3
  /** Seconds parked here. */
  dwell: number
  /** Radians of slow pan performed while parked. */
  sweep: number
}

const look = (from: Vector3, to: Vector3) => {
  const dx = to.x - from.x
  const dz = to.z - from.z
  const horizontal = Math.hypot(dx, dz)
  return {
    // At rotation.y === 0 a Babylon camera looks down +Z.
    yaw: Math.atan2(dx, dz),
    // Positive rotation.x tilts down, hence the negation.
    pitch: -Math.atan2(to.y - from.y, horizontal),
  }
}

/** Shortest signed angular distance from a to b. */
function angleDelta(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function buildTourStops(): TourStop[] {
  return ROOMS.map((room) => {
    const b = roomBounds(room)
    // Stand a third of the way in, looking at the middle of the room.
    const position = new Vector3(room.center.x, EYE_HEIGHT, b.maxZ - room.size.d * 0.3)
    const target = new Vector3(room.center.x, room.height * 0.32, room.center.z - room.size.d * 0.15)
    return {
      room: room.id,
      position,
      target,
      dwell: room.id === 'projects' || room.id === 'skills' ? 11 : 8,
      sweep: room.id === 'projects' ? 1.5 : room.id === 'career' ? 0.5 : 1.0,
    }
  })
}

type Mode = 'dwell' | 'travel'

export class GuidedTour {
  private stops = buildTourStops()
  private index = 0
  private mode: Mode = 'dwell'
  private elapsed = 0
  private travelDuration = 1
  private startYaw = 0
  private startPitch = 0
  private travelStart = new Vector3()
  private control = new Vector3()

  readonly position = new Vector3()
  yaw = 0
  pitch = 0

  /** Fired when the tour parks in a new room. */
  onArrive: ((room: RoomId) => void) | null = null
  /** Fired when the last room's dwell finishes. */
  onFinish: (() => void) | null = null

  /** Begin at the stop nearest the given position, so it picks you up where you are. */
  start(from: Vector3, yaw: number, pitch: number) {
    let nearest = 0
    let best = Infinity
    this.stops.forEach((stop, i) => {
      const d = Vector3.DistanceSquared(stop.position, from)
      if (d < best) {
        best = d
        nearest = i
      }
    })

    this.index = nearest
    this.position.copyFrom(from)
    this.yaw = yaw
    this.pitch = pitch
    this.beginTravel(this.stops[nearest])
  }

  /** Jump the tour to a specific room. */
  goto(room: RoomId) {
    const target = this.stops.findIndex((s) => s.room === room)
    if (target < 0) return
    this.index = target
    this.beginTravel(this.stops[target])
  }

  private beginTravel(stop: TourStop) {
    this.mode = 'travel'
    this.elapsed = 0
    this.startYaw = this.yaw
    this.startPitch = this.pitch
    this.travelStart = this.position.clone()
    this.control = this.controlPoint(this.travelStart, stop.position)
    const distance = Vector3.Distance(this.position, stop.position)
    // Roughly a stroll, with a floor so short hops still feel deliberate.
    this.travelDuration = Math.max(1.6, distance / 4.2)
  }

  /**
   * The doorway between the room we are leaving and the one we are entering —
   * used as the bezier control point so the path never cuts a corner.
   */
  private controlPoint(from: Vector3, to: Vector3): Vector3 {
    const fromRoom = ROOMS.find((r) => Math.abs(r.center.z - from.z) < r.size.d / 2 + 6)
    const toRoom = ROOMS.find((r) => Math.abs(r.center.z - to.z) < r.size.d / 2 + 6)

    if (fromRoom && toRoom && fromRoom.id !== toRoom.id) {
      const a = roomBounds(fromRoom)
      const b = roomBounds(toRoom)
      // Midpoint of the corridor joining them, on the shared centre line.
      const doorZ = from.z > to.z ? (a.minZ + b.maxZ) / 2 : (a.maxZ + b.minZ) / 2
      return new Vector3(0, EYE_HEIGHT, doorZ)
    }

    return Vector3.Center(from, to)
  }

  update(dt: number) {
    const stop = this.stops[this.index]
    this.elapsed += dt

    if (this.mode === 'travel') {
      const t = Math.min(1, this.elapsed / this.travelDuration)
      const eased = easeInOut(t)

      const start = this.travelStart
      const control = this.control

      // Quadratic bezier: (1-t)²·P0 + 2(1-t)t·C + t²·P1
      const inv = 1 - eased
      this.position.set(
        inv * inv * start.x + 2 * inv * eased * control.x + eased * eased * stop.position.x,
        inv * inv * start.y + 2 * inv * eased * control.y + eased * eased * stop.position.y,
        inv * inv * start.z + 2 * inv * eased * control.z + eased * eased * stop.position.z,
      )

      // Ease the gaze toward the arrival framing over the same interval.
      const framing = look(this.position, stop.target)
      this.yaw = this.startYaw + angleDelta(this.startYaw, framing.yaw) * eased
      this.pitch = this.startPitch + (framing.pitch - this.startPitch) * eased

      if (t >= 1) {
        this.mode = 'dwell'
        this.elapsed = 0
        this.onArrive?.(stop.room)
      }
      return
    }

    // Parked: pan slowly across the room, then move on.
    const progress = this.elapsed / stop.dwell
    const framing = look(this.position, stop.target)
    this.yaw = framing.yaw + Math.sin(progress * Math.PI * 2) * (stop.sweep / 2)
    this.pitch = framing.pitch

    if (this.elapsed >= stop.dwell) {
      if (this.index >= this.stops.length - 1) {
        this.onFinish?.()
        return
      }
      this.index += 1
      this.beginTravel(this.stops[this.index])
    }
  }

}
