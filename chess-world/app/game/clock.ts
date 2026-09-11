/**
 * The chess clock.
 *
 * Deliberately free of any timer: nothing here fires on an interval and
 * nothing reads the wall clock on its own. Every method takes `now`, so the
 * whole thing can be driven a millisecond at a time in a test, and the UI can
 * poll it as often or as rarely as it likes without the time drifting — the
 * remaining time is always computed from a timestamp, never accumulated tick
 * by tick.
 */
import { BLACK, WHITE, type Color } from './types'

export interface TimeControl {
  id: string
  name: string
  /** Base time per side, in seconds. Zero means no clock at all. */
  base: number
  /** Seconds added to a player's clock when they complete a move. */
  increment: number
  short: string
}

export const TIME_CONTROLS: TimeControl[] = [
  { id: 'off', name: 'Untimed', base: 0, increment: 0, short: '∞' },
  { id: 'bullet', name: 'Bullet', base: 60, increment: 0, short: '1+0' },
  { id: 'blitz', name: 'Blitz', base: 180, increment: 2, short: '3+2' },
  { id: 'rapid', name: 'Rapid', base: 600, increment: 5, short: '10+5' },
  { id: 'classical', name: 'Classical', base: 1800, increment: 0, short: '30+0' },
]

export const TIME_CONTROL_BY_ID = new Map(TIME_CONTROLS.map((control) => [control.id, control]))
export const DEFAULT_TIME_CONTROL: TimeControl = TIME_CONTROLS[0]!

/** Below this a clock is shown to a tenth of a second, and starts ticking. */
export const URGENT_MS = 10_000
/** Below this the clock is marked low. */
export const LOW_MS = 30_000

export class Clock {
  private readonly banked: [number, number]
  private running: Color | null = null
  private since = 0

  constructor(readonly control: TimeControl, times?: readonly [number, number]) {
    const base = control.base * 1000
    this.banked = times ? [times[0], times[1]] : [base, base]
  }

  /** A clock with no base time is a clock that is not being kept. */
  get enabled(): boolean {
    return this.control.base > 0
  }

  get active(): Color | null {
    return this.running
  }

  /** Hands the move to `side`, if it is not already theirs. */
  start(side: Color, now: number): void {
    if (!this.enabled || this.running === side) return
    if (this.running !== null) this.bank(now)
    this.running = side
    this.since = now
  }

  /** Stops the clock without ending anyone's move — the pause button. */
  stop(now: number): void {
    if (this.running === null) return
    this.bank(now)
    this.running = null
  }

  /**
   * `side` has completed a move. Their time stops and the increment goes on.
   *
   * Nothing is charged and nothing is added when their clock was not running:
   * that is White's first move, which starts the game rather than being timed
   * by it, and it is also how a clock that has already fallen stays down.
   */
  press(side: Color, now: number): void {
    if (!this.enabled || this.running !== side) {
      this.running = null
      return
    }
    this.bank(now)
    this.running = null
    if (this.banked[side]! > 0) this.banked[side]! += this.control.increment * 1000
  }

  remaining(side: Color, now: number): number {
    const banked = this.banked[side]!
    if (this.running !== side) return Math.max(0, banked)
    return Math.max(0, banked - (now - this.since))
  }

  /** The side whose time has run out, or null. Only a running clock falls. */
  flagged(now: number): Color | null {
    if (!this.enabled || this.running === null) return null
    return this.remaining(this.running, now) <= 0 ? this.running : null
  }

  /** Both clocks as they stand, for the undo stack to put back. */
  snapshot(now: number): [number, number] {
    return [this.remaining(WHITE, now), this.remaining(BLACK, now)]
  }

  restore(times: readonly [number, number], now: number): void {
    this.banked[WHITE] = times[0]
    this.banked[BLACK] = times[1]
    this.since = now
  }

  private bank(now: number): void {
    const side = this.running!
    this.banked[side] = Math.max(0, this.banked[side]! - (now - this.since))
    this.since = now
  }
}

/**
 * `m:ss`, or `m:ss.t` under ten seconds — the point where a tenth of a second
 * is the difference between moving and losing.
 */
export function formatClock(ms: number): string {
  const clamped = Math.max(0, ms)
  const totalSeconds = clamped / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds - minutes * 60
  if (clamped < URGENT_MS) return `${minutes}:${Math.floor(seconds).toString().padStart(2, '0')}.${Math.floor((seconds % 1) * 10)}`
  return `${minutes}:${Math.floor(seconds).toString().padStart(2, '0')}`
}
