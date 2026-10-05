/**
 * The guided tour: sixty years in about a minute.
 *
 * The plan is pure data (legs of glide-then-dwell between the stops), so it
 * can be tested in Node. The controller below drives the scrollbar through
 * it one frame at a time, because the transitions are the point, and native
 * smooth scrolling would race through them at whatever speed it likes.
 */

import { ERAS, T_MAX, type EraId } from './eras'
import { currentT, goTo, prefersReducedMotion } from './progress'
import type { World } from '@/state/world'

export interface Stop {
  t: number
  /** Seconds to sit still here. */
  dwell: number
  era: EraId | null
  label: string
}

export const STOPS: readonly Stop[] = [
  { t: 0, dwell: 2.5, era: null, label: 'The Evolution of UI' },
  // DOS gets longer: it types a command for you while you watch.
  ...ERAS.map((e) => ({ t: e.snap, dwell: e.id === 'dos' ? 9 : 7, era: e.id, label: `${e.year}, ${e.name}` })),
  { t: T_MAX, dwell: 0, era: null, label: '2060, and the end' },
]

/** Units of t per second while travelling: slow enough to watch a transition happen. */
export const TRAVEL_SPEED = 0.42
const MIN_TRAVEL = 1.2
const NEAR = 0.02

export interface Leg {
  kind: 'travel' | 'dwell'
  from: number
  to: number
  /** Seconds. Zero for an instant jump. */
  dur: number
  /** Index into STOPS of the stop this leg arrives at or sits on. */
  stop: number
}

/**
 * Every leg from `from` to the end. Starting at the very end replays from the
 * top. `speed` of Infinity turns every glide into a jump (reduced motion).
 */
export function plan(from: number, speed = TRAVEL_SPEED): Leg[] {
  const legs: Leg[] = []
  let t = Math.min(T_MAX, Math.max(0, from))
  if (t >= T_MAX - NEAR) {
    legs.push({ kind: 'travel', from: t, to: 0, dur: 0, stop: 0 })
    t = 0
  }
  const first = STOPS.findIndex((s) => s.t >= t - NEAR)
  for (let i = first; i < STOPS.length; i++) {
    const s = STOPS[i]
    const d = Math.abs(s.t - t)
    if (d > NEAR) legs.push({ kind: 'travel', from: t, to: s.t, dur: Number.isFinite(speed) ? Math.max(MIN_TRAVEL, d / speed) : 0, stop: i })
    if (s.dwell > 0) legs.push({ kind: 'dwell', from: s.t, to: s.t, dur: s.dwell, stop: i })
    t = s.t
  }
  return legs
}

export const duration = (legs: readonly Leg[]): number => legs.reduce((sum, l) => sum + l.dur, 0)

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2)

/** Where the tour is after `elapsed` seconds. */
export function sample(legs: readonly Leg[], elapsed: number): { t: number; leg: number; done: boolean } {
  let acc = 0
  for (let i = 0; i < legs.length; i++) {
    const l = legs[i]
    if (elapsed < acc + l.dur) {
      const k = Math.max(0, (elapsed - acc) / l.dur)
      return { t: l.from + (l.to - l.from) * easeInOut(k), leg: i, done: false }
    }
    acc += l.dur
  }
  return { t: legs.at(-1)?.to ?? 0, leg: legs.length - 1, done: true }
}

/** The next stop after t (dir 1) or before it (dir -1), for the keyboard. */
export function stepStop(t: number, dir: 1 | -1): number {
  const ts = STOPS.map((s) => s.t)
  return dir > 0 ? (ts.find((x) => x > t + 0.05) ?? T_MAX) : ([...ts].reverse().find((x) => x < t - 0.05) ?? 0)
}

// ── the controller ───────────────────────────────────────────────────────

export const TOUR_EVENT = 'eou:tour'

export interface TourArrival {
  era: EraId | null
}

let world: World | null = null
let legs: Leg[] = []
let total = 1
let elapsed = 0
let last = 0
let raf = 0
let current = -1
let detach: (() => void) | null = null

const stage = () => document.getElementById('stage')

function frame(now: number): void {
  raf = 0
  if (!world || world.tour !== 'playing') return
  elapsed += Math.min(0.1, (now - last) / 1000) // a hidden tab doesn't skip ahead
  last = now
  const s = sample(legs, elapsed)
  goTo(s.t, true)
  stage()?.style.setProperty('--tour', (elapsed / total).toFixed(4))
  const leg = legs[s.leg]
  if (leg?.kind === 'dwell' && s.leg !== current) {
    current = s.leg
    const stop = STOPS[leg.stop]
    world.tourAt = stop.label
    window.dispatchEvent(new CustomEvent<TourArrival>(TOUR_EVENT, { detail: { era: stop.era } }))
  }
  if (s.done) {
    stopTour()
    return
  }
  raf = requestAnimationFrame(frame)
}

/** Take the visitor's input as a request for the wheel back. */
function listen(): () => void {
  const stop = () => stopTour()
  // Clicking into an era to try something pauses rather than ends the tour.
  const onPointer = (e: PointerEvent) => {
    const layer = (e.target as Element | null)?.closest?.('.layer')
    if (layer && !layer.matches('.layer-intro, .layer-outro')) pauseTour()
  }
  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('touchmove', stop, { passive: true })
  window.addEventListener('pointerdown', onPointer, true)
  return () => {
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchmove', stop)
    window.removeEventListener('pointerdown', onPointer, true)
  }
}

export function startTour(w: World): void {
  stopTour()
  world = w
  legs = plan(currentT(), prefersReducedMotion() ? Infinity : TRAVEL_SPEED)
  total = Math.max(0.001, duration(legs))
  elapsed = 0
  current = -1
  // Scroll-snap would pull every programmatic step toward the nearest era.
  document.documentElement.style.scrollSnapType = 'none'
  stage()?.setAttribute('data-tour', 'on')
  detach = listen()
  w.tour = 'playing'
  last = performance.now()
  raf = requestAnimationFrame(frame)
}

export function pauseTour(): void {
  if (world?.tour !== 'playing') return
  world.tour = 'paused'
  cancelAnimationFrame(raf)
  raf = 0
}

export function resumeTour(): void {
  if (world?.tour !== 'paused') return
  world.tour = 'playing'
  last = performance.now()
  raf = requestAnimationFrame(frame)
}

export function stopTour(): void {
  cancelAnimationFrame(raf)
  raf = 0
  detach?.()
  detach = null
  document.documentElement.style.scrollSnapType = ''
  stage()?.removeAttribute('data-tour')
  if (world) {
    world.tour = 'off'
    world.tourAt = ''
  }
  world = null
}

export const tourActive = (): boolean => !!world && world.tour !== 'off'

export function toggleTour(w: World): void {
  if (w.tour === 'playing') pauseTour()
  else if (w.tour === 'paused') resumeTour()
  else startTour(w)
}
