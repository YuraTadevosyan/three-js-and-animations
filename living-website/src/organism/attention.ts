import { clamp, damp } from '@/lib/math'
import type { Bus } from './bus'
import type { Mood, OrganismState } from './state'

const MOOD_THRESHOLDS: [number, Mood][] = [
  [3_500, 'alert'],
  [22_000, 'awake'],
  [55_000, 'drowsy'],
]

/**
 * Tracks where the visitor is and how animated they are being about it.
 * Pointer samples come in on their own schedule, so raw deltas are noisy —
 * everything downstream reads the smoothed values written during the tick.
 */
export class Attention {
  #lastX = 0
  #lastY = 0
  #lastMove = 0
  #rawSpeed = 0
  #docHeight = 0
  #heightAge = 0
  #detach: (() => void)[] = []

  constructor(private state: OrganismState, private bus: Bus) {}

  attach() {
    const s = this.state

    const onPointer = (e: PointerEvent) => {
      const now = performance.now()
      const dt = Math.max((now - this.#lastMove) / 1000, 1 / 240)
      const dx = e.clientX - this.#lastX
      const dy = e.clientY - this.#lastY

      // Ignore the first sample; its delta is measured from (0,0).
      if (this.#lastMove) this.#rawSpeed = Math.hypot(dx, dy) / dt

      this.#lastX = e.clientX
      this.#lastY = e.clientY
      this.#lastMove = now

      s.attention.x = e.clientX
      s.attention.y = e.clientY
      s.attention.inside = true
      s.attention.idleMs = 0
    }

    const onLeave = () => {
      s.attention.inside = false
    }
    const onEnter = () => {
      s.attention.inside = true
      s.attention.idleMs = 0
    }
    const onInteract = () => {
      s.attention.interactions++
      s.attention.idleMs = 0
      // A click is a jolt of arousal even without pointer movement.
      s.attention.excitement = clamp(s.attention.excitement + 0.28)
    }
    const onScroll = () => {
      s.attention.idleMs = 0
    }
    const onResize = () => {
      s.viewport.w = window.innerWidth
      s.viewport.h = window.innerHeight
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onInteract, { passive: true })
    window.addEventListener('keydown', onInteract, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.documentElement.addEventListener('pointerenter', onEnter)

    onResize()
    s.attention.x = s.viewport.w / 2
    s.attention.y = s.viewport.h / 2

    this.#detach = [
      () => window.removeEventListener('pointermove', onPointer),
      () => window.removeEventListener('pointerdown', onInteract),
      () => window.removeEventListener('keydown', onInteract),
      () => window.removeEventListener('scroll', onScroll),
      () => window.removeEventListener('resize', onResize),
      () => document.documentElement.removeEventListener('pointerleave', onLeave),
      () => document.documentElement.removeEventListener('pointerenter', onEnter),
    ]
  }

  detach() {
    for (const fn of this.#detach) fn()
    this.#detach = []
  }

  tick(dt: number) {
    const s = this.state
    const a = s.attention
    const v = s.viewport

    a.idleMs += dt * 1000

    // Decay the raw reading so a pointer that stops reports zero rather than
    // holding its last velocity forever.
    this.#rawSpeed *= Math.pow(0.02, dt)
    a.speed = damp(a.speed, this.#rawSpeed, 0.04, dt)

    a.nx = v.w ? (a.x / v.w) * 2 - 1 : 0
    a.ny = v.h ? (a.y / v.h) * 2 - 1 : 0

    const arousal = clamp(a.speed / 1200)
    // Rises quickly, falls slowly — the site stays a bit wound up after you
    // stop moving, which is a much warmer read than snapping straight to calm.
    const smoothing = arousal > a.excitement ? 0.05 : 0.72
    a.excitement = damp(a.excitement, arousal, smoothing, dt)

    const scrollY = window.scrollY
    // Document height is a layout query. It changes when sections reveal or
    // fonts land — neither of which needs noticing more than a few times a
    // second — so it is sampled rather than read every frame.
    this.#heightAge += dt
    if (this.#heightAge > 0.25 || this.#docHeight === 0) {
      this.#heightAge = 0
      this.#docHeight = document.documentElement.scrollHeight
    }
    const range = Math.max(1, this.#docHeight - v.h)
    v.scrollVelocity = damp(v.scrollVelocity, (scrollY - v.scrollY) / Math.max(dt, 1e-3), 0.02, dt)
    v.scrollY = scrollY
    v.scrollProgress = clamp(scrollY / range)

    let mood: Mood = 'asleep'
    for (const [limit, name] of MOOD_THRESHOLDS) {
      if (a.idleMs < limit) {
        mood = name
        break
      }
    }
    if (mood === 'alert' && a.speed < 24) mood = 'awake'

    if (mood !== a.mood) {
      const from = a.mood
      a.mood = mood
      this.bus.emit('mood', { from, to: mood })
    }

    // Dreaming builds over roughly fifteen seconds of sleep and collapses the
    // instant you move. Slow in, fast out — the page should never look like it
    // is still hallucinating once you are clearly back.
    const asleep = mood === 'asleep'
    a.dream = damp(a.dream, asleep ? 1 : 0, asleep ? 0.93 : 0.0005, dt)
  }
}
