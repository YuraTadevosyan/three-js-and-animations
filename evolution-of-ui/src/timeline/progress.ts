/**
 * Typed access to the state the boot script hangs on `window.__eou`.
 * Everything here is safe to call during SSR; it just reports t = 0.
 */

export interface EouState {
  /** Current position on the timeline, 0 … T_MAX. */
  t: number
  /** True when CSS scroll-driven animations are doing the work. */
  native: boolean
  /** Scroll so that the timeline reads `t`. */
  go(t: number, instant?: boolean): void
  /** Called on every change of `t` (at most once per frame), and once immediately. */
  on(fn: (t: number) => void): () => void
}

declare global {
  interface Window {
    __eou?: EouState
  }
}

const state = (): EouState | undefined => (typeof window === 'undefined' ? undefined : window.__eou)

export const prefersReducedMotion = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export const currentT = (): number => state()?.t ?? 0

/** Scroll so the timeline reads t. Smooth, unless the visitor prefers reduced motion. */
export const goTo = (t: number, instant = prefersReducedMotion()): void => state()?.go(t, instant)

export const onProgress = (fn: (t: number) => void): (() => void) => state()?.on(fn) ?? (() => {})

/** Linear 0 → 1 as t runs from a to b, clamped. */
export const ramp = (a: number, b: number, t: number): number => Math.min(1, Math.max(0, (t - a) / (b - a)))

/** Hermite-smoothed ramp. */
export const smooth = (a: number, b: number, t: number): number => {
  const x = ramp(a, b, t)
  return x * x * (3 - 2 * x)
}

/**
 * Run `fn` once, the first time t comes within `margin` of the window. This
 * is how the eras defer their heavy setup (WebGPU, rasterising the photo)
 * until someone is actually about to look at them.
 */
export function whenNear(range: readonly [number, number], margin: number, fn: () => void): () => void {
  let done = false
  let off: () => void = () => {}
  off = onProgress((t) => {
    if (done || t < range[0] - margin || t > range[1] + margin) return
    done = true
    // `on` calls back synchronously once, before `off` exists — defer.
    queueMicrotask(() => off())
    fn()
  })
  return () => {
    done = true
    off()
  }
}

/** True while t is inside the window. */
export const within = (range: readonly [number, number], t: number): boolean => t >= range[0] && t <= range[1]

