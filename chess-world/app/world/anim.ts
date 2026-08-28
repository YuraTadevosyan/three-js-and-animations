/**
 * A tiny keyframe engine.
 *
 * Every move in this app is a hand-authored timeline — a knight's jump is an
 * arc plus a spin plus a landing squash plus a shockwave, each on its own
 * schedule. That is a few hundred bytes of scheduling logic, so it is written
 * here rather than pulled in as a dependency.
 */

export type Easing = (t: number) => number

export const ease = {
  linear: (t: number) => t,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => t * (2 - t),
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => 1 - (1 - t) ** 3,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  inQuart: (t: number) => t ** 4,
  outQuart: (t: number) => 1 - (1 - t) ** 4,
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  inExpo: (t: number) => (t <= 0 ? 0 : 2 ** (10 * t - 10)),
  outBack: (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  inBack: (t: number) => 2.70158 * t * t * t - 1.70158 * t * t,
  outElastic: (t: number) => {
    if (t <= 0 || t >= 1) return t
    return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
  },
  outBounce: (t: number) => {
    const n = 7.5625
    const d = 2.75
    if (t < 1 / d) return n * t * t
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
    return n * (t -= 2.625 / d) * t + 0.984375
  },
  /** Fast attack, slow settle — the "heavy piece lands" curve. */
  impact: (t: number) => 1 - (1 - t) ** 5,
} satisfies Record<string, Easing>

export interface Track {
  start: number
  duration: number
  easing: Easing
  onStart?: () => void
  /** `t` is eased progress 0→1, `raw` is linear progress. */
  onUpdate?: (t: number, raw: number) => void
  onComplete?: () => void
}

export interface TrackSpec extends Partial<Omit<Track, 'start' | 'duration'>> {
  duration?: number
}

/** An ordered set of tracks sharing one clock. */
export class Timeline {
  private tracks: Track[] = []
  private started = new Set<Track>()
  private finished = new Set<Track>()
  private cursor = 0
  time = 0

  /** Appends at the current cursor and advances it by `duration`. */
  add(spec: TrackSpec): this {
    return this.at(this.cursor, spec, true)
  }

  /** Adds a track at an absolute time without moving the cursor. */
  at(start: number, spec: TrackSpec, advance = false): this {
    const duration = Math.max(spec.duration ?? 0, 0)
    this.tracks.push({
      start,
      duration,
      easing: spec.easing ?? ease.inOutCubic,
      onStart: spec.onStart,
      onUpdate: spec.onUpdate,
      onComplete: spec.onComplete,
    })
    if (advance) this.cursor = start + duration
    else this.cursor = Math.max(this.cursor, 0)
    return this
  }

  /** Runs `fn` once, `delay` seconds in. */
  call(delay: number, fn: () => void): this {
    return this.at(this.cursor + delay, { duration: 0, onStart: fn })
  }

  /** Moves the insertion cursor, e.g. `.gap(-0.2)` to overlap the previous track. */
  gap(seconds: number): this {
    this.cursor = Math.max(0, this.cursor + seconds)
    return this
  }

  get duration(): number {
    return this.tracks.reduce((max, track) => Math.max(max, track.start + track.duration), 0)
  }

  get cursorTime(): number {
    return this.cursor
  }

  /** Advances the clock. Returns true once every track has completed. */
  update(dt: number): boolean {
    this.time += dt
    for (const track of this.tracks) {
      const end = track.start + track.duration
      if (this.time < track.start) continue
      if (this.finished.has(track)) continue

      if (!this.started.has(track)) {
        this.started.add(track)
        track.onStart?.()
      }

      const raw = track.duration > 0 ? Math.min(1, (this.time - track.start) / track.duration) : 1
      track.onUpdate?.(track.easing(raw), raw)

      if (this.time >= end) {
        this.finished.add(track)
        track.onComplete?.()
      }
    }
    return this.finished.size === this.tracks.length
  }

  /** Jumps to the end, firing everything that has not run yet. */
  finish(): void {
    this.update(Math.max(0, this.duration - this.time) + 1e-4)
  }
}

/**
 * Runs one timeline at a time and queues the rest — moves must not overlap, or
 * two pieces end up animating onto the same square.
 */
export class Animator {
  private current: { timeline: Timeline; resolve: () => void } | null = null
  private queue: { timeline: Timeline; resolve: () => void }[] = []
  /** Independent of the queue: ambient loops, hover pulses, camera drift. */
  private ambient: Timeline[] = []
  /** Multiplier on every timeline's clock — Cinema's speed control. */
  timeScale = 1

  play(timeline: Timeline): Promise<void> {
    return new Promise((resolve) => {
      const entry = { timeline, resolve }
      if (this.current) this.queue.push(entry)
      else this.current = entry
    })
  }

  /** Fire-and-forget effects that run alongside whatever else is playing. */
  spawn(timeline: Timeline): void {
    this.ambient.push(timeline)
  }

  get busy(): boolean {
    return this.current !== null || this.queue.length > 0
  }

  get pending(): number {
    return this.queue.length + (this.current ? 1 : 0)
  }

  update(dt: number): void {
    const scaled = dt * this.timeScale

    for (let i = this.ambient.length - 1; i >= 0; i--) {
      if (this.ambient[i]!.update(scaled)) this.ambient.splice(i, 1)
    }

    if (!this.current) {
      const next = this.queue.shift()
      if (!next) return
      this.current = next
    }

    if (this.current.timeline.update(scaled)) {
      const done = this.current
      this.current = null
      done.resolve()
      // Start the next one in the same frame so queued moves stay tight.
      const next = this.queue.shift()
      if (next) this.current = next
    }
  }

  /** Snaps everything to its end state — used when skipping or resetting. */
  finishAll(): void {
    const drain = [this.current, ...this.queue].filter(Boolean) as { timeline: Timeline; resolve: () => void }[]
    this.current = null
    this.queue = []
    for (const entry of drain) {
      entry.timeline.finish()
      entry.resolve()
    }
    for (const timeline of this.ambient) timeline.finish()
    this.ambient = []
  }
}

/* ------------------------------------------------------------- utilities -- */

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value

/** Shortest-path interpolation between two angles in radians. */
export function lerpAngle(a: number, b: number, t: number): number {
  const difference = ((((b - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI
  return a + difference * t
}

/** Deterministic noise for shakes and drift, so replays look identical. */
export function noise1D(x: number): number {
  const s = Math.sin(x * 12.9898) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}
