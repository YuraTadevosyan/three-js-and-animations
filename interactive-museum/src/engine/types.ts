import type { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Scene } from '@babylonjs/core/scene'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { ExhibitDef, RoomDef, RoomId } from '@/data/museum'

/** Something the visitor can walk up to and press E on. */
export interface Interactable {
  id: string
  /** World position used for the proximity test. */
  position: Vector3
  /** How close the visitor must be, in metres. */
  radius: number
  /** Prompt shown in the HUD while in range. Omit for proximity-only exhibits. */
  prompt?: string
  /** Catalogue entry surfaced in the HUD panel while in range. */
  exhibit?: ExhibitDef
  /** Runs on E / tap. Return a secret id to log a discovery. */
  activate?: () => string | void
  /** Called on the frames where in-range state changes. */
  onProximity?: (inRange: boolean) => void
  /** One-shot interactables set this once used. */
  spent?: boolean
  /** Internal: last proximity state, so `onProximity` fires on edges only. */
  wasInRange?: boolean
}

/** Everything a room builder is handed. */
export interface RoomContext {
  scene: Scene
  room: RoomDef
  /**
   * Nominate a mesh as a shadow caster. The generator is created after the
   * rooms are built (it needs a light that a room builder owns), so these are
   * collected and attached once it exists.
   */
  addShadowCaster: (mesh: AbstractMesh) => void
}

/** What a room hands back to the orchestrator. */
export interface RoomRuntime {
  id: RoomId
  /** Advance the room's animation. `dt` is seconds, `t` is seconds since start. */
  update: (dt: number, t: number) => void
  /** Interactables this room contributes. */
  interactables: Interactable[]
  /** Lights that should only burn while the visitor is in or next to the room. */
  setActive: (active: boolean) => void
  /** Restyle for after-hours mode. */
  setAfterHours?: (on: boolean) => void
  /** Make the room's lights pulse — used by the bell in Room VI. */
  pulse?: () => void
  /**
   * Polled each frame for secrets the room tripped by itself — Room II fires on
   * dwell rather than on a key press, so it has no interactable to hang it off.
   * Returns the secret id once, then null.
   */
  takeSecret?: () => string | null
}

/** The surface the Solid UI drives the engine through. */
export interface MuseumHandle {
  /** Leave the start overlay and take control. */
  enter: () => void
  /** Release pointer lock and show the menu. */
  pause: () => void
  startTour: () => void
  stopTour: () => void
  toggleMute: () => void
  /** Touch joystick, both axes in -1..1. */
  setMoveAxis: (x: number, y: number) => void
  /** Touch look, in pixels since the last call. */
  addLookDelta: (dx: number, dy: number) => void
  /** Fire the interactable currently in range. */
  interact: () => void
  /** Jump straight to a room — used by the tour list. */
  gotoRoom: (id: RoomId) => void
  dispose: () => void
}
