import { damp, clamp } from '@/lib/math'
import type { Bus } from './bus'
import type { OrganismState } from './state'

/** Breaths per minute at each end of the arousal range. */
const CALM_BPM = 7.5
const EXCITED_BPM = 16
const ASLEEP_BPM = 5

/**
 * The breath is the page's master oscillator. It is deliberately slow and
 * asymmetric — a real inhale is shorter than the exhale, and matching that
 * ratio is most of the difference between "alive" and "pulsing".
 */
export function tickBreath(dt: number, state: OrganismState, bus: Bus) {
  const { breath, attention, prefs } = state

  const asleep = attention.mood === 'asleep'
  const targetRate = asleep
    ? ASLEEP_BPM
    : CALM_BPM + (EXCITED_BPM - CALM_BPM) * attention.excitement

  breath.rate = damp(breath.rate, targetRate, 0.25, dt)

  // Reduced motion keeps the rhythm — other systems still read `value` for
  // timing — but flattens the amplitude so nothing visibly moves.
  const targetDepth = prefs.reducedMotion ? 0.12 : asleep ? 0.62 : 0.78 + attention.excitement * 0.22
  breath.depth = damp(breath.depth, targetDepth, 0.3, dt)

  const before = breath.phase
  breath.phase = (breath.phase + (dt * breath.rate) / 60) % 1
  if (breath.phase < before) {
    breath.count++
    bus.emit('breath', { count: breath.count })
  }

  breath.value = breathCurve(breath.phase) * breath.depth
}

/**
 * -1 (fully exhaled) to 1 (fully inhaled). The inhale occupies the first 40%
 * of the cycle and the exhale the remaining 60%, with a brief hold at the top.
 */
export function breathCurve(phase: number): number {
  const p = clamp(phase, 0, 1)
  if (p < 0.4) {
    const t = p / 0.4
    return -Math.cos(t * Math.PI) // -1 → 1, eased at both ends
  }
  if (p < 0.48) return 1 // the hold
  const t = (p - 0.48) / 0.52
  return Math.cos(t * Math.PI) // 1 → -1, the long exhale
}
