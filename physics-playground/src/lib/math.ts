/** Clamp `v` into the inclusive `[min, max]` range. */
export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

/** Linear interpolation between `a` and `b` by `t` (0..1). */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Frame-rate independent smoothing — moves `a` toward `b` by `lambda` per
 * second. Use in animation loops so the feel doesn't change with the tick rate.
 */
export const damp = (a: number, b: number, lambda: number, dt: number): number =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

/** Uniform random float in `[min, max)`. */
export const rand = (min: number, max: number): number =>
  min + Math.random() * (max - min);

/** Pick a random element from a non-empty array. */
export const pick = <T,>(arr: readonly T[]): T =>
  arr[(Math.random() * arr.length) | 0];

/** Distance between two points. */
export const dist = (ax: number, ay: number, bx: number, by: number): number =>
  Math.hypot(ax - bx, ay - by);
