/**
 * A shared requestAnimationFrame loop.
 *
 * Streaming views (telemetry, the ticker tape, packet flow) all want a clock.
 * Running one rAF loop and fanning out beats one loop per chart: the frames stay
 * in phase, so charts on the same page never disagree about "now".
 */

type Frame = (dt: number, elapsed: number) => void

const subscribers = new Set<Frame>()
let raf = 0
let last = 0
let elapsed = 0

function loop(now: number) {
  // Clamp dt so a backgrounded tab doesn't return and jump the sim forward by
  // thirty seconds of accumulated time.
  const dt = Math.min(0.05, (now - last) / 1000 || 0)
  last = now
  elapsed += dt
  for (const fn of subscribers) fn(dt, elapsed)
  raf = requestAnimationFrame(loop)
}

/** Subscribes to the frame loop. Returns the unsubscribe. */
export function onFrame(fn: Frame): () => void {
  subscribers.add(fn)
  if (!raf) {
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }
  return () => {
    subscribers.delete(fn)
    if (subscribers.size === 0 && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}

/**
 * Calls `fn` every `intervalMs` of simulated time, driven by the same frame
 * loop. Used by the streaming generators to append a data point on a cadence
 * without a second timer source.
 */
export function onInterval(intervalMs: number, fn: (steps: number) => void): () => void {
  let acc = 0
  return onFrame((dt) => {
    acc += dt * 1000
    if (acc < intervalMs) return
    const steps = Math.floor(acc / intervalMs)
    acc -= steps * intervalMs
    fn(Math.min(steps, 4))
  })
}

export function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}
