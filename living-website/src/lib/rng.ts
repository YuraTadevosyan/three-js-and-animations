/**
 * Deterministic randomness. Every plant in the garden is stored as a single
 * integer seed — its whole shape, colour and temperament are re-derived from
 * that number on load, so a garden persists in a few hundred bytes.
 */

/** xmur3 string hash → 32-bit seed. */
export function hashString(str: string): number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return (h ^= h >>> 16) >>> 0
}

/** mulberry32 — small, fast, good enough for visuals. */
export function makeRng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    /** Float in [lo, hi). */
    range: (lo: number, hi: number) => lo + next() * (hi - lo),
    /** Integer in [lo, hi]. */
    int: (lo: number, hi: number) => Math.floor(lo + next() * (hi - lo + 1)),
    /** Pick one element. */
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)]!,
    /** True with probability p. */
    chance: (p: number) => next() < p,
    /** Roughly-gaussian via the mean of four samples. */
    gauss: () => (next() + next() + next() + next()) / 2 - 1,
  }
}

export type Rng = ReturnType<typeof makeRng>

/** Cheap 2D value noise — used for cloud masks and wind gusts. */
export function valueNoise2D(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const h = (ix: number, iy: number) => {
    let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 2147483647)
    n = Math.imul(n ^ (n >>> 13), 1274126177)
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296
  }
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = h(xi, yi)
  const b = h(xi + 1, yi)
  const c = h(xi, yi + 1)
  const d = h(xi + 1, yi + 1)
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v
}

/** Layered value noise. Two octaves is plenty for drifting weather. */
export function fbm2D(x: number, y: number, octaves = 3, seed = 0): number {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise2D(x * freq, y * freq, seed + i * 977) * amp
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}
