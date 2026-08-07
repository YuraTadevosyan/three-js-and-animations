/** Small helpers shared across the OS shell. */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Maps `v` from one range to another, clamped to the output range. */
export function remap(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin
  return clamp(outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin), Math.min(outMin, outMax), Math.max(outMin, outMax))
}

/**
 * Deterministic 32-bit PRNG (mulberry32). Every simulated subsystem seeds its
 * own instance so a reload reproduces the same "hardware" personality.
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 1D value noise — smooth, cheap, and stable for telemetry drift. */
export function makeNoise(seed: number): (x: number) => number {
  const rng = makeRng(seed)
  const table = new Float32Array(256)
  for (let i = 0; i < 256; i++) table[i] = rng()
  return (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    const s = f * f * (3 - 2 * f)
    const a = table[((i % 256) + 256) % 256]
    const b = table[(((i + 1) % 256) + 256) % 256]
    return a + (b - a) * s
  }
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

export function formatBytes(bytes: number, digits = 1): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let v = bytes / 1024
  let u = 0
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024
    u++
  }
  return `${v.toFixed(digits)} ${units[u]}`
}

export function formatClock(d: Date, seconds = false): string {
  const h = pad2(d.getHours())
  const m = pad2(d.getMinutes())
  return seconds ? `${h}:${m}:${pad2(d.getSeconds())}` : `${h}:${m}`
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Uptime in `Nd HH:MM:SS`, used by the status bar and `neofetch`. */
export function formatUptime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${d > 0 ? `${d}d ` : ''}${pad2(h)}:${pad2(m)}:${pad2(s)}`
}

let idCounter = 0
export function uid(prefix = 'id'): string {
  idCounter += 1
  return `${prefix}-${idCounter.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

/**
 * A fixed-length circular buffer of floats. Telemetry graphs read straight out
 * of these on the render loop rather than round-tripping through signals — a
 * 10 Hz sampler feeding eight charts should not re-render the component tree.
 */
export class RingBuffer {
  readonly data: Float32Array
  readonly capacity: number
  private writeIndex = 0
  private filled = 0

  constructor(capacity: number, fill = 0) {
    this.capacity = capacity
    this.data = new Float32Array(capacity).fill(fill)
    this.filled = fill === 0 ? 0 : capacity
  }

  push(value: number): void {
    this.data[this.writeIndex] = value
    this.writeIndex = (this.writeIndex + 1) % this.capacity
    if (this.filled < this.capacity) this.filled++
  }

  /** Most recently pushed value. */
  get last(): number {
    return this.data[(this.writeIndex - 1 + this.capacity) % this.capacity]
  }

  get length(): number {
    return this.filled
  }

  /** Reads oldest → newest, so charts can walk left to right. */
  at(i: number): number {
    const start = this.filled < this.capacity ? 0 : this.writeIndex
    return this.data[(start + i) % this.capacity]
  }

  toArray(): number[] {
    const out: number[] = []
    for (let i = 0; i < this.filled; i++) out.push(this.at(i))
    return out
  }

  max(): number {
    let m = -Infinity
    for (let i = 0; i < this.filled; i++) m = Math.max(m, this.at(i))
    return m === -Infinity ? 0 : m
  }

  mean(): number {
    if (this.filled === 0) return 0
    let s = 0
    for (let i = 0; i < this.filled; i++) s += this.at(i)
    return s / this.filled
  }
}
