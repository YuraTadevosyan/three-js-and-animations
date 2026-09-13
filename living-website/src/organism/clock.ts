import type { OrganismState } from './state'

export type TickFn = (dt: number, state: OrganismState) => void

/**
 * The single heartbeat.
 *
 * Every moving thing on this page — the WebGL sky, the pupils, the plants,
 * the CSS variables — is driven from this one requestAnimationFrame loop.
 * That is the whole architectural conceit: CSS animations and per-component
 * rAF loops each run on their own timeline and drift out of phase within
 * seconds, which is exactly what makes most "animated" pages feel like a pile
 * of unrelated widgets rather than one creature.
 */
export class Heartbeat {
  #subs = new Set<TickFn>()
  #raf = 0
  #last = 0
  #running = false
  #hiddenAt = 0

  /** Set when the tab comes back, so systems can account for lost time. */
  awayMs = 0

  constructor(private state: OrganismState) {}

  subscribe(fn: TickFn): () => void {
    this.#subs.add(fn)
    return () => this.#subs.delete(fn)
  }

  start() {
    if (this.#running) return
    this.#running = true
    this.#last = performance.now()
    document.addEventListener('visibilitychange', this.#onVisibility)
    this.#raf = requestAnimationFrame(this.#frame)
  }

  stop() {
    this.#running = false
    cancelAnimationFrame(this.#raf)
    document.removeEventListener('visibilitychange', this.#onVisibility)
  }

  #onVisibility = () => {
    if (document.hidden) {
      this.#hiddenAt = Date.now()
      cancelAnimationFrame(this.#raf)
    } else if (this.#running) {
      this.awayMs = this.#hiddenAt ? Date.now() - this.#hiddenAt : 0
      this.#hiddenAt = 0
      // Reset the delta baseline, otherwise the first frame back reports the
      // entire time the tab was hidden and every spring detonates.
      this.#last = performance.now()
      this.#raf = requestAnimationFrame(this.#frame)
    }
  }

  #frame = (t: number) => {
    if (!this.#running) return
    this.#raf = requestAnimationFrame(this.#frame)

    // 100ms ceiling: a slow frame stretches time rather than teleporting it.
    const dt = Math.min((t - this.#last) / 1000, 0.1)
    this.#last = t

    const s = this.state
    s.time.dt = dt
    s.time.elapsed += dt
    s.time.now = Date.now()
    s.vitals.ticks++
    s.vitals.fps += (1 / Math.max(dt, 1e-4) - s.vitals.fps) * 0.05

    for (const fn of this.#subs) {
      try {
        fn(dt, s)
      } catch (err) {
        console.error('[organism] tick subscriber threw', err)
      }
    }
  }
}
