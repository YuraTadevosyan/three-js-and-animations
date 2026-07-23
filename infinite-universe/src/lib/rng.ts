/**
 * Tiny deterministic PRNG helpers. Everything procedural in the universe is a
 * pure function of an integer slot, so the same slot always regenerates the
 * exact same world — that keeps streaming seamless (a world that scrolls off
 * and back looks identical) and makes the cosmos reproducible.
 */

/** mulberry32 — fast, decent-quality 32-bit seeded generator. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer avalanche hash — turns a slot index into a well-mixed seed. */
export function hashInt(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = x ^ (x >>> 16);
  return x >>> 0;
}

/** A convenience wrapper exposing the small helpers a generator needs. */
export interface Rng {
  next(): number;
  range(min: number, max: number): number;
  int(min: number, max: number): number;
  chance(p: number): boolean;
  pick<T>(items: readonly T[]): T;
  /** Weighted pick over a `{ key: weight }` map. */
  weighted(weights: Record<string, number>): string;
}

export function makeRng(seed: number): Rng {
  const rnd = mulberry32(seed);
  const range = (min: number, max: number) => min + (max - min) * rnd();
  return {
    next: rnd,
    range,
    int: (min, max) => Math.floor(range(min, max + 1)),
    chance: (p) => rnd() < p,
    pick: (items) => items[Math.floor(rnd() * items.length)],
    weighted: (weights) => {
      const entries = Object.entries(weights);
      const total = entries.reduce((s, [, w]) => s + w, 0);
      let r = rnd() * total;
      for (const [key, w] of entries) {
        r -= w;
        if (r <= 0) return key;
      }
      return entries[entries.length - 1][0];
    },
  };
}
