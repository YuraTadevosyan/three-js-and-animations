/**
 * Move choreography.
 *
 * One timeline per piece type. A pawn hops, a knight leaps the corner of its L
 * and lands hard enough to shake the camera, a bishop streaks down the diagonal,
 * a rook charges behind a shockwave, a queen dissolves into particles and
 * reassembles on the far square, and the king walks with an escort of light.
 */
import { Color, Entity, Quat, Vec3 } from 'playcanvas'
import { Timeline, ease, lerp } from './anim'
import type { Board } from './board'
import type { CameraRig } from './camera'
import type { Fx } from './fx'
import { PIECE_HEIGHT } from './pieces'
import { THEME, type SideKey } from './theme'

export const PAWN = 1
export const KNIGHT = 2
export const BISHOP = 3
export const ROOK = 4
export const QUEEN = 5
export const KING = 6

export interface CapturedPiece {
  entity: Entity
  square: number
  type: number
  side: SideKey
  /** Removes it from the scene; called once its death animation is done. */
  dispose: () => void
}

export interface MoveScene {
  entity: Entity
  type: number
  side: SideKey
  from: number
  to: number
  fromPosition: Vec3
  toPosition: Vec3
  captured: CapturedPiece | null
  /** Rook that travels with the king when castling. */
  rook: { entity: Entity; from: Vec3; to: Vec3; toSquare: number } | null
  /** Called at the moment the piece arrives, before check/mate reactions. */
  onArrive?: () => void
  /** Swaps a promoting pawn for its new piece; returns the replacement. */
  promote?: () => Entity
  check: boolean
  mate: boolean
  board: Board
  fx: Fx
  camera: CameraRig
  sound: MoveSounds
}

export interface MoveSounds {
  step: (side: SideKey) => void
  slide: (side: SideKey) => void
  leap: (side: SideKey) => void
  impact: (strength: number) => void
  teleport: (side: SideKey) => void
  capture: () => void
  check: () => void
  mate: () => void
  promote: () => void
}

const UP = new Vec3(0, 1, 0)
const scratch = new Vec3()
const scratchQuat = new Quat()
const baseQuat = new Quat()

const tint = (side: SideKey): Color => THEME.pieces[side].glow.clone()
const spark = (side: SideKey): Color => THEME.pieces[side].particle.clone()

/** Height of a piece's visual centre, for aiming effects at its body. */
const core = (type: number): number => PIECE_HEIGHT[type]! * 0.5

function pointOnArc(from: Vec3, to: Vec3, control: Vec3 | null, t: number, height: number, out: Vec3): Vec3 {
  if (control) {
    // Quadratic Bézier through the corner, so a knight visibly jumps the L.
    const inverse = 1 - t
    out.set(
      inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x,
      0,
      inverse * inverse * from.z + 2 * inverse * t * control.z + t * t * to.z,
    )
  } else {
    out.set(lerp(from.x, to.x, t), 0, lerp(from.z, to.z, t))
  }
  out.y = lerp(from.y, to.y, t) + Math.sin(Math.PI * t) * height
  return out
}

/** Squash and stretch driven by vertical speed — the classic jump cheat. */
function applySquash(entity: Entity, amount: number): void {
  const horizontal = 1 - amount * 0.42
  entity.setLocalScale(horizontal, 1 + amount, horizontal)
}

function spinAround(entity: Entity, axis: Vec3, degrees: number): void {
  scratchQuat.setFromAxisAngle(axis, degrees)
  entity.setLocalRotation(scratchQuat)
}

/**
 * Emits a trail at fixed points along a track rather than at random, so a
 * replayed game throws the same sparks regardless of frame rate.
 */
function everyStep(steps: number): (raw: number) => boolean {
  let last = -1
  return (raw: number) => {
    const step = Math.floor(raw * steps)
    if (step === last) return false
    last = step
    return true
  }
}

/* ------------------------------------------------------------- captures -- */

/**
 * The victim's death: it flares, tears itself apart into a sphere of sparks,
 * and takes a chunk of the board's light with it.
 */
function addCapture(timeline: Timeline, scene: MoveScene, at: number): void {
  const victim = scene.captured
  if (!victim) return

  const position = scene.board.worldPosition(victim.square)
  const centre = new Vec3(position.x, core(victim.type), position.z)
  const colour = spark(victim.side)
  const duration = 0.42

  timeline.at(at, {
    duration,
    easing: ease.inQuad,
    onStart: () => {
      scene.sound.capture()
      scene.fx.flash(centre, colour, { intensity: 9, duration: 0.5, range: 5.5 })
      scene.fx.burst(centre, {
        color: colour,
        count: 150,
        speed: [1.8, 5.6],
        size: [0.035, 0.11],
        life: [0.55, 1.35],
        gravity: -4.2,
        drag: 1.1,
        spread: 0.28,
      })
      scene.fx.burst(centre, {
        color: new Color(1, 1, 1),
        count: 26,
        speed: [3.2, 7.4],
        size: [0.02, 0.05],
        life: [0.25, 0.5],
        gravity: -1.5,
        drag: 0.8,
      })
      scene.fx.ring(position, colour, { from: 0.3, to: 2.4, duration: 0.65, intensity: 2.8 })
      scene.fx.shake(0.09, 0.4)
      scene.board.pulse(victim.square, colour, 1.4)
    },
    onUpdate: (t) => {
      // Comes apart rather than simply shrinking: it stretches, then collapses.
      const stretch = 1 + t * 0.5
      const squeeze = Math.max(0, 1 - t * 1.15)
      victim.entity.setLocalScale(squeeze, stretch * squeeze, squeeze)
      victim.entity.setLocalEulerAngles(0, t * 320, 0)
      victim.entity.setLocalPosition(position.x, t * 0.35, position.z)
    },
    onComplete: () => victim.dispose(),
  })
}

/* ---------------------------------------------------------------- pieces -- */

function pawnMove(scene: MoveScene): Timeline {
  const timeline = new Timeline()
  const { entity, fromPosition: from, toPosition: to } = scene
  const distance = Math.hypot(to.x - from.x, to.z - from.z)
  const duration = 0.34 + distance * 0.08
  const colour = spark(scene.side)

  timeline.add({
    duration: 0.09,
    easing: ease.outQuad,
    onStart: () => scene.sound.step(scene.side),
    onUpdate: (t) => applySquash(entity, -t * 0.22),
  })

  timeline.add({
    duration,
    easing: ease.inOutQuad,
    onUpdate: (t) => {
      pointOnArc(from, to, null, t, 0.26 + distance * 0.04, scratch)
      entity.setLocalPosition(scratch)
      applySquash(entity, Math.sin(Math.PI * t) * 0.16)
    },
  })

  addCapture(timeline, scene, timeline.cursorTime - 0.16)

  timeline.add({
    duration: 0.24,
    easing: ease.outElastic,
    onStart: () => {
      scene.onArrive?.()
      scene.sound.impact(0.35)
      scene.fx.ring(to, colour, { from: 0.2, to: 0.95, duration: 0.4, intensity: 1.5 })
      scene.fx.burst(new Vec3(to.x, 0.06, to.z), {
        color: colour,
        count: 18,
        speed: [0.6, 1.9],
        size: [0.02, 0.05],
        life: [0.25, 0.55],
        gravity: -5,
        direction: UP,
        focus: 0.55,
      })
      scene.board.pulse(scene.to, colour, 0.7)
    },
    onUpdate: (t) => applySquash(entity, (1 - t) * -0.22),
    onComplete: () => entity.setLocalScale(1, 1, 1),
  })

  return timeline
}

function knightMove(scene: MoveScene): Timeline {
  const timeline = new Timeline()
  const { entity, fromPosition: from, toPosition: to } = scene
  const colour = spark(scene.side)

  // The corner of the L: travel the long leg first, then turn.
  const dx = to.x - from.x
  const dz = to.z - from.z
  const control = new Vec3(
    Math.abs(dx) > Math.abs(dz) ? to.x : from.x,
    0,
    Math.abs(dx) > Math.abs(dz) ? from.z : to.z,
  )
  const axis = new Vec3(dz, 0, -dx).normalize()
  const knightTrail = everyStep(22)
  const flightTime = 0.62

  timeline.add({
    duration: 0.16,
    easing: ease.outQuad,
    onStart: () => scene.sound.leap(scene.side),
    onUpdate: (t) => {
      // Crouch and load.
      applySquash(entity, -t * 0.3)
      entity.setLocalPosition(from.x, from.y - t * 0.03, from.z)
    },
  })

  timeline.add({
    duration: flightTime,
    easing: ease.inOutQuad,
    onStart: () => {
      scene.fx.ring(from, colour, { from: 0.2, to: 1.4, duration: 0.45, intensity: 1.8 })
      scene.fx.burst(new Vec3(from.x, 0.05, from.z), {
        color: colour,
        count: 30,
        speed: [1.4, 3.2],
        size: [0.02, 0.06],
        life: [0.3, 0.7],
        gravity: -6,
        radial: 1.2,
      })
      scene.camera.frameMove(scene.from, scene.to, { drama: 0.55 })
    },
    onUpdate: (t, raw) => {
      pointOnArc(from, to, control, t, 1.55, scratch)
      entity.setLocalPosition(scratch)
      // A full forward somersault, easing out of the tuck before landing.
      spinAround(entity, axis, -360 * ease.inOutCubic(raw))
      applySquash(entity, 0.18 * Math.sin(Math.PI * raw) - 0.05)
      if (raw > 0.1 && raw < 0.95 && knightTrail(raw)) {
        scene.fx.burst(scratch, {
          color: colour,
          count: 2,
          speed: [0.2, 0.7],
          size: [0.015, 0.04],
          life: [0.25, 0.55],
          gravity: -2.4,
        })
      }
    },
  })

  addCapture(timeline, scene, timeline.cursorTime - 0.22)

  timeline.add({
    duration: 0.34,
    easing: ease.outElastic,
    onStart: () => {
      scene.onArrive?.()
      entity.setLocalRotation(baseQuat)
      scene.sound.impact(0.85)
      scene.fx.shake(0.14, 0.45)
      scene.fx.ring(to, colour, { from: 0.25, to: 2.1, duration: 0.55, intensity: 2.6 })
      scene.fx.flash(new Vec3(to.x, 0.4, to.z), colour, { intensity: 4, duration: 0.35, range: 4 })
      scene.fx.burst(new Vec3(to.x, 0.05, to.z), {
        color: colour,
        count: 46,
        speed: [1.6, 4.4],
        size: [0.02, 0.07],
        life: [0.3, 0.8],
        gravity: -7,
        radial: 2.2,
      })
      scene.board.pulse(scene.to, colour, 1.6)
    },
    onUpdate: (t) => {
      entity.setLocalPosition(to)
      applySquash(entity, (1 - t) * -0.34)
    },
    onComplete: () => entity.setLocalScale(1, 1, 1),
  })

  return timeline
}

function sliderMove(scene: MoveScene): Timeline {
  const timeline = new Timeline()
  const { entity, fromPosition: from, toPosition: to, type } = scene
  const colour = spark(scene.side)
  const distance = Math.hypot(to.x - from.x, to.z - from.z)
  const isRook = type === ROOK
  const travel = isRook ? 0.2 + distance * 0.036 : 0.3 + distance * 0.05

  timeline.add({
    duration: isRook ? 0.16 : 0.2,
    easing: ease.outQuad,
    onStart: () => scene.sound.slide(scene.side),
    onUpdate: (t) => {
      // Anticipation: rooks rock back before charging, bishops rise and spin up.
      if (isRook) {
        entity.setLocalPosition(lerp(from.x, from.x - (to.x - from.x) * 0.05, t), from.y, lerp(from.z, from.z - (to.z - from.z) * 0.05, t))
        applySquash(entity, -t * 0.18)
      } else {
        entity.setLocalPosition(from.x, from.y + t * 0.16, from.z)
        entity.setLocalEulerAngles(0, t * 180, 0)
      }
    },
  })

  timeline.add({
    duration: travel,
    easing: isRook ? ease.outExpo : ease.inOutCubic,
    onStart: () => {
      scene.camera.frameMove(scene.from, scene.to, { drama: isRook ? 0.4 : 0.3 })
      scene.fx.beam(from, to, colour, {
        width: isRook ? 0.55 : 0.32,
        duration: isRook ? 0.4 : 0.55,
        y: 0.045,
      })
      if (isRook) {
        scene.fx.ring(from, colour, { from: 0.3, to: 1.5, duration: 0.4, intensity: 2 })
      }
    },
    onUpdate: (t, raw) => {
      const height = isRook ? 0.02 : 0.16 + Math.sin(Math.PI * t) * 0.1
      scratch.set(lerp(from.x, to.x, t), from.y + height, lerp(from.z, to.z, t))
      entity.setLocalPosition(scratch)
      if (isRook) {
        applySquash(entity, -0.18 + raw * 0.18)
      } else {
        // The bishop spins faster the further it slides.
        entity.setLocalEulerAngles(0, 180 + t * (360 + distance * 90), 0)
      }
      scene.fx.burst(scratch, {
        color: colour,
        count: isRook ? 3 : 2,
        speed: [0.15, 0.8],
        size: [0.015, isRook ? 0.055 : 0.04],
        life: [0.2, 0.5],
        gravity: isRook ? -3 : -0.8,
      })
    },
  })

  addCapture(timeline, scene, timeline.cursorTime - (isRook ? 0.12 : 0.16))

  timeline.add({
    duration: isRook ? 0.3 : 0.26,
    easing: isRook ? ease.outBounce : ease.outBack,
    onStart: () => {
      scene.onArrive?.()
      scene.sound.impact(isRook ? 1 : 0.5)
      if (isRook) {
        scene.fx.shake(0.16, 0.5)
        scene.fx.ring(to, colour, { from: 0.3, to: 2.6, duration: 0.6, intensity: 3 })
        scene.fx.burst(new Vec3(to.x, 0.05, to.z), {
          color: colour,
          count: 54,
          speed: [2.2, 5.2],
          size: [0.02, 0.08],
          life: [0.3, 0.85],
          gravity: -8,
          radial: 3,
        })
      } else {
        scene.fx.ring(to, colour, { from: 0.2, to: 1.3, duration: 0.45, intensity: 1.9 })
        scene.fx.burst(new Vec3(to.x, core(type), to.z), {
          color: colour,
          count: 26,
          speed: [0.8, 2.4],
          size: [0.015, 0.05],
          life: [0.3, 0.7],
          gravity: -3,
        })
      }
      scene.board.pulse(scene.to, colour, isRook ? 1.5 : 1)
    },
    onUpdate: (t) => {
      entity.setLocalPosition(to.x, lerp(isRook ? 0.02 : 0.2, 0, t), to.z)
      if (isRook) applySquash(entity, (1 - t) * -0.26)
      else entity.setLocalEulerAngles(0, (1 - t) * 40, 0)
    },
    onComplete: () => {
      entity.setLocalScale(1, 1, 1)
      entity.setLocalEulerAngles(0, 0, 0)
      entity.setLocalPosition(to)
    },
  })

  return timeline
}

function queenMove(scene: MoveScene): Timeline {
  const timeline = new Timeline()
  const { entity, fromPosition: from, toPosition: to } = scene
  const colour = spark(scene.side)
  const glow = tint(scene.side)
  const chargeTrail = everyStep(14)
  const fromCentre = new Vec3(from.x, core(QUEEN), from.z)
  const toCentre = new Vec3(to.x, core(QUEEN), to.z)

  // 1. Charge: she draws light in and lifts off the square.
  timeline.add({
    duration: 0.3,
    easing: ease.inCubic,
    onStart: () => {
      scene.sound.teleport(scene.side)
      scene.camera.frameMove(scene.from, scene.to, { drama: 0.7 })
      scene.fx.ring(from, glow, { from: 1.5, to: 0.2, duration: 0.32, intensity: 3 })
    },
    onUpdate: (t) => {
      entity.setLocalPosition(from.x, from.y + t * 0.22, from.z)
      entity.setLocalEulerAngles(0, t * 420, 0)
      entity.setLocalScale(1 + t * 0.12, 1 + t * 0.16, 1 + t * 0.12)
      if (chargeTrail(t)) {
        scene.fx.burst(fromCentre, {
          color: colour,
          count: 3,
          speed: [0.4, 1.4],
          size: [0.015, 0.05],
          life: [0.2, 0.45],
          gravity: 1.2,
          spread: 0.5,
        })
      }
    },
  })

  // 2. Dissolve: the body comes apart into a column of sparks.
  timeline.add({
    duration: 0.22,
    easing: ease.inQuart,
    onStart: () => {
      scene.fx.burst(fromCentre, {
        color: colour,
        count: 130,
        speed: [1.4, 4.2],
        size: [0.02, 0.07],
        life: [0.4, 0.9],
        gravity: 1.8,
        drag: 1.4,
        direction: UP,
        focus: 0.45,
        spread: 0.3,
      })
      scene.fx.flash(fromCentre, glow, { intensity: 7, duration: 0.4, range: 5 })
      scene.fx.shake(0.06, 0.3)
    },
    onUpdate: (t) => {
      const scale = Math.max(0.001, 1.12 - t * 1.12)
      entity.setLocalScale(scale * (1 - t * 0.6), 1.16 + t * 1.4, scale * (1 - t * 0.6))
      entity.setLocalEulerAngles(0, 420 + t * 540, 0)
    },
    onComplete: () => entity.enabled = false,
  })

  // 3. Transit: nothing is on the board but a line of light.
  timeline.add({
    duration: 0.16,
    easing: ease.linear,
    onStart: () => {
      scene.fx.beam(from, to, glow, { width: 0.22, duration: 0.4, y: 0.06 })
    },
    onUpdate: (t) => {
      scratch.set(lerp(from.x, to.x, t), 0.5 + Math.sin(Math.PI * t) * 0.9, lerp(from.z, to.z, t))
      scene.fx.burst(scratch, {
        color: colour,
        count: 5,
        speed: [0.3, 1.2],
        size: [0.02, 0.06],
        life: [0.2, 0.5],
        gravity: -1,
      })
    },
  })

  addCapture(timeline, scene, timeline.cursorTime - 0.12)

  // 4. Rematerialise.
  timeline.add({
    duration: 0.42,
    easing: ease.outElastic,
    onStart: () => {
      scene.onArrive?.()
      entity.enabled = true
      entity.setLocalPosition(to)
      scene.sound.impact(0.7)
      scene.fx.flash(toCentre, glow, { intensity: 8, duration: 0.45, range: 5.5 })
      scene.fx.ring(to, glow, { from: 0.2, to: 2.2, duration: 0.6, intensity: 3.2 })
      scene.fx.burst(toCentre, {
        color: colour,
        count: 110,
        speed: [1.2, 3.6],
        size: [0.02, 0.07],
        life: [0.35, 0.85],
        gravity: -3.4,
        drag: 1.8,
        spread: 0.35,
      })
      scene.board.pulse(scene.to, glow, 1.8)
      scene.fx.shake(0.1, 0.4)
    },
    onUpdate: (t) => {
      entity.setLocalScale(t, Math.max(0.001, 2.2 - t * 1.2), t)
      entity.setLocalEulerAngles(0, (1 - t) * -360, 0)
      entity.setLocalPosition(to)
    },
    onComplete: () => {
      entity.setLocalScale(1, 1, 1)
      entity.setLocalEulerAngles(0, 0, 0)
    },
  })

  return timeline
}

function kingMove(scene: MoveScene): Timeline {
  const timeline = new Timeline()
  const { entity, fromPosition: from, toPosition: to } = scene
  const glow = tint(scene.side)
  const colour = spark(scene.side)
  const castling = scene.rook
  const walkTrail = everyStep(9)

  timeline.add({
    duration: 0.22,
    easing: ease.outQuad,
    onStart: () => {
      scene.sound.step(scene.side)
      if (castling) {
        scene.camera.frameMove(scene.from, scene.to, { drama: 0.45 })
        scene.fx.ring(from, glow, { from: 0.3, to: 1.8, duration: 0.5, intensity: 2 })
      }
    },
    onUpdate: (t) => {
      entity.setLocalPosition(from.x, from.y + t * 0.1, from.z)
      applySquash(entity, t * 0.08)
    },
  })

  const travel = castling ? 0.5 : 0.42
  timeline.add({
    duration: travel,
    easing: ease.inOutCubic,
    onUpdate: (t) => {
      pointOnArc(from, to, null, t, 0.18, scratch)
      entity.setLocalPosition(scratch)
      // A slow guard turn as he walks.
      entity.setLocalEulerAngles(0, Math.sin(Math.PI * t) * 24, 0)
      if (walkTrail(t)) {
        scene.fx.burst(new Vec3(scratch.x, 0.08, scratch.z), {
          color: colour,
          count: 2,
          speed: [0.2, 0.7],
          size: [0.015, 0.045],
          life: [0.3, 0.6],
          gravity: -1.6,
        })
      }
    },
  })

  if (castling) {
    const rook = castling
    // The rook sweeps behind the king and arrives with him.
    timeline.at(0.28, {
      duration: 0.46,
      easing: ease.inOutCubic,
      onStart: () => {
        scene.sound.slide(scene.side)
        scene.fx.beam(rook.from, rook.to, colour, { width: 0.4, duration: 0.5, y: 0.05 })
      },
      onUpdate: (t) => {
        pointOnArc(rook.from, rook.to, null, t, 0.5, scratch)
        rook.entity.setLocalPosition(scratch)
        rook.entity.setLocalEulerAngles(0, t * 360, 0)
      },
      onComplete: () => {
        rook.entity.setLocalPosition(rook.to)
        rook.entity.setLocalEulerAngles(0, 0, 0)
        scene.board.pulse(rook.toSquare, colour, 1.1)
        scene.fx.ring(rook.to, colour, { from: 0.2, to: 1.4, duration: 0.4, intensity: 1.8 })
      },
    })
  }

  addCapture(timeline, scene, timeline.cursorTime - 0.16)

  timeline.add({
    duration: 0.26,
    easing: ease.outBack,
    onStart: () => {
      scene.onArrive?.()
      scene.sound.impact(0.5)
      scene.fx.ring(to, glow, { from: 0.2, to: 1.5, duration: 0.5, intensity: 2 })
      scene.board.pulse(scene.to, glow, 1.1)
    },
    onUpdate: (t) => {
      entity.setLocalPosition(to.x, lerp(0.1, 0, t), to.z)
      entity.setLocalEulerAngles(0, (1 - t) * 12, 0)
      applySquash(entity, (1 - t) * -0.14)
    },
    onComplete: () => {
      entity.setLocalScale(1, 1, 1)
      entity.setLocalEulerAngles(0, 0, 0)
      entity.setLocalPosition(to)
    },
  })

  return timeline
}

/* ------------------------------------------------------------ promotion -- */

function addPromotion(timeline: Timeline, scene: MoveScene): void {
  if (!scene.promote) return
  const { toPosition: to } = scene
  const glow = tint(scene.side)
  const colour = spark(scene.side)
  let promoted: Entity | null = null

  timeline.add({
    duration: 0.3,
    easing: ease.inQuad,
    onStart: () => {
      scene.sound.promote()
      scene.camera.focus(scene.to, { distance: 5.6, elevation: 0.38 })
      scene.fx.flash(new Vec3(to.x, 0.7, to.z), glow, { intensity: 9, duration: 0.7, range: 6 })
    },
    onUpdate: (t) => {
      scene.entity.setLocalPosition(to.x, to.y + t * 0.6, to.z)
      scene.entity.setLocalEulerAngles(0, t * 540, 0)
      scene.entity.setLocalScale(1 - t * 0.7, 1 - t * 0.7, 1 - t * 0.7)
      scene.fx.burst(new Vec3(to.x, 0.2 + t * 0.6, to.z), {
        color: colour,
        count: 6,
        speed: [0.5, 1.8],
        size: [0.02, 0.06],
        life: [0.3, 0.7],
        gravity: 1.4,
        direction: UP,
        focus: 0.5,
      })
    },
    onComplete: () => {
      promoted = scene.promote!()
      promoted.setLocalScale(0.001, 0.001, 0.001)
    },
  })

  timeline.add({
    duration: 0.5,
    easing: ease.outElastic,
    onStart: () => {
      scene.fx.ring(to, glow, { from: 0.2, to: 2.6, duration: 0.75, intensity: 3.4 })
      scene.fx.burst(new Vec3(to.x, 0.5, to.z), {
        color: colour,
        count: 120,
        speed: [1.4, 4],
        size: [0.02, 0.08],
        life: [0.4, 1],
        gravity: -3,
        drag: 1.5,
        spread: 0.4,
      })
      scene.fx.shake(0.1, 0.45)
    },
    onUpdate: (t) => {
      if (!promoted) return
      promoted.setLocalScale(t, Math.max(0.001, 1.6 - t * 0.6), t)
      promoted.setLocalPosition(to.x, to.y + (1 - t) * 0.25, to.z)
      promoted.setLocalEulerAngles(0, (1 - t) * 260, 0)
    },
    onComplete: () => {
      if (!promoted) return
      promoted.setLocalScale(1, 1, 1)
      promoted.setLocalEulerAngles(0, 0, 0)
      promoted.setLocalPosition(to)
    },
  })
}

/* ------------------------------------------------------- check and mate -- */

function addReactions(timeline: Timeline, scene: MoveScene, kingSquare: number, kingEntity: Entity | null): void {
  if (!scene.check || kingSquare < 0) return
  const position = scene.board.worldPosition(kingSquare)
  const danger = THEME.markers.check.clone()

  timeline.add({
    duration: scene.mate ? 0.2 : 0.34,
    easing: ease.outQuad,
    onStart: () => {
      scene.sound.check()
      scene.fx.ring(position, danger, { from: 0.3, to: 2.2, duration: 0.7, intensity: 3 })
      scene.fx.flash(new Vec3(position.x, 0.6, position.z), danger, { intensity: 6, duration: 0.5, range: 5 })
      scene.fx.shake(0.08, 0.35)
      scene.camera.focus(kingSquare, { distance: scene.mate ? 5 : 7.5, elevation: scene.mate ? 0.3 : 0.5 })
    },
  })

  if (!scene.mate || !kingEntity) return

  // Checkmate: the king gives up standing.
  timeline.add({
    duration: 1.1,
    easing: ease.outBounce,
    onStart: () => {
      scene.sound.mate()
      scene.fx.shake(0.2, 0.9)
      scene.fx.burst(new Vec3(position.x, 0.5, position.z), {
        color: danger,
        count: 180,
        speed: [1.5, 5],
        size: [0.025, 0.09],
        life: [0.6, 1.6],
        gravity: -4,
        drag: 1.2,
        spread: 0.4,
      })
      scene.fx.ring(position, danger, { from: 0.4, to: 4.5, duration: 1.3, intensity: 3.6 })
    },
    onUpdate: (t) => {
      // Topple sideways, pivoting on the base of the crown.
      const angle = t * 88
      kingEntity.setLocalEulerAngles(angle, 0, 0)
      kingEntity.setLocalPosition(position.x, Math.sin(t * Math.PI) * 0.04, position.z + t * 0.28)
    },
  })
}

/* --------------------------------------------------------------- public -- */

export function choreographMove(scene: MoveScene, kingSquare: number, kingEntity: Entity | null): Timeline {
  let timeline: Timeline
  switch (scene.type) {
    case KNIGHT:
      timeline = knightMove(scene)
      break
    case BISHOP:
    case ROOK:
      timeline = sliderMove(scene)
      break
    case QUEEN:
      timeline = queenMove(scene)
      break
    case KING:
      timeline = kingMove(scene)
      break
    default:
      timeline = pawnMove(scene)
      break
  }

  addPromotion(timeline, scene)
  addReactions(timeline, scene, kingSquare, kingEntity)
  return timeline
}
