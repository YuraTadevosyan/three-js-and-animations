/**
 * Deterministic pseudo-randomness.
 *
 * Every dataset in this app is generated, and every generator takes a seed, so a
 * reload reproduces the exact same series. That matters for a demo: the AI
 * analyst's findings reference specific timestamps and magnitudes, and those
 * would be nonsense if the data reshuffled underneath them.
 */

/** mulberry32 — small, fast, good enough for synthetic data. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hashes a string into a 32-bit seed so datasets can be keyed by name. */
export function hashSeed(str: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export class Rng {
  private next: () => number
  private spare: number | null = null

  constructor(seed: number | string) {
    this.next = makeRng(typeof seed === 'string' ? hashSeed(seed) : seed)
  }

  /** Uniform in [0, 1). */
  unit(): number {
    return this.next()
  }

  /** Uniform in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  /** Integer in [min, max]. */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1))
  }

  /** Standard normal via Box–Muller, caching the second variate. */
  normal(mean = 0, sd = 1): number {
    if (this.spare !== null) {
      const v = this.spare
      this.spare = null
      return mean + v * sd
    }
    let u = 0
    let v = 0
    let s = 0
    do {
      u = this.next() * 2 - 1
      v = this.next() * 2 - 1
      s = u * u + v * v
    } while (s === 0 || s >= 1)
    const f = Math.sqrt((-2 * Math.log(s)) / s)
    this.spare = v * f
    return mean + u * f * sd
  }

  /** Bernoulli trial. */
  chance(p: number): boolean {
    return this.next() < p
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)]
  }
}

/**
 * 1-D value noise with cosine interpolation — smooth, cheap, and enough to give
 * generated series an organic shape without pulling in a noise library.
 */
export function makeNoise1d(seed: number | string) {
  const rng = new Rng(seed)
  const table = Array.from({ length: 512 }, () => rng.unit())
  return (x: number): number => {
    const i = Math.floor(x)
    const f = x - i
    const a = table[((i % 512) + 512) % 512]
    const b = table[(((i + 1) % 512) + 512) % 512]
    const t = (1 - Math.cos(f * Math.PI)) / 2
    return a * (1 - t) + b * t
  }
}

/** Sums octaves of value noise for a more natural, multi-scale wobble. */
export function fbm1d(seed: number | string, octaves = 4) {
  const layers = Array.from({ length: octaves }, (_, i) => makeNoise1d(`${seed}:${i}`))
  return (x: number): number => {
    let sum = 0
    let amp = 1
    let freq = 1
    let norm = 0
    for (const layer of layers) {
      sum += layer(x * freq) * amp
      norm += amp
      amp *= 0.5
      freq *= 2
    }
    return sum / norm
  }
}
