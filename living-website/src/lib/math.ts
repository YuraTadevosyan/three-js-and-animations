/** Small numeric helpers shared by every system. No dependencies. */

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Map `v` from [inMin,inMax] into [outMin,outMax], clamped. */
export const remap = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  lerp(outMin, outMax, clamp((v - inMin) / (inMax - inMin || 1)))

export const smoothstep = (edge0: number, edge1: number, v: number) => {
  const t = clamp((v - edge0) / (edge1 - edge0 || 1))
  return t * t * (3 - 2 * t)
}

/**
 * Frame-rate independent exponential approach. `smoothing` is the fraction of
 * the remaining distance still left after one second — 0.001 is snappy, 0.6 is
 * syrupy. Using this instead of a raw `lerp(a, b, 0.1)` keeps motion identical
 * on a 60Hz laptop and a 144Hz monitor.
 */
export const damp = (current: number, target: number, smoothing: number, dt: number) =>
  lerp(target, current, Math.pow(smoothing, dt))

/** Shortest-path interpolation around a 360° hue wheel. */
export const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a) % 360 + 540) % 360 - 180
  return a + d * t
}

export const TAU = Math.PI * 2

/**
 * A critically-damped-ish spring integrated with semi-implicit Euler.
 * Used for anything that should overshoot slightly and settle: pupils
 * chasing the cursor, cards tilting, the aura trailing the pointer.
 */
export class Spring {
  value: number
  velocity = 0
  target: number

  constructor(initial = 0, public stiffness = 120, public damping = 18) {
    this.value = initial
    this.target = initial
  }

  step(dt: number) {
    // Clamp dt so a backgrounded tab returning after 10s doesn't explode.
    const h = Math.min(dt, 1 / 30)
    const accel = (this.target - this.value) * this.stiffness - this.velocity * this.damping
    this.velocity += accel * h
    this.value += this.velocity * h
    return this.value
  }

  /** Teleport without a settling animation. */
  set(v: number) {
    this.value = v
    this.target = v
    this.velocity = 0
  }
}

/** Two springs travelling together — pointer positions, offsets, gaze. */
export class Spring2 {
  x: Spring
  y: Spring
  constructor(x = 0, y = 0, stiffness = 120, damping = 18) {
    this.x = new Spring(x, stiffness, damping)
    this.y = new Spring(y, stiffness, damping)
  }
  target(x: number, y: number) {
    this.x.target = x
    this.y.target = y
  }
  step(dt: number) {
    this.x.step(dt)
    this.y.step(dt)
  }
  set(x: number, y: number) {
    this.x.set(x)
    this.y.set(y)
  }
}
