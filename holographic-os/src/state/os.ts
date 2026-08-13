import { signal } from '@preact/signals'
import { uid } from '@/lib/util'

export type BootPhase = 'booting' | 'ready'

export const bootPhase = signal<BootPhase>('booting')
export const clock = signal<Date>(new Date())
export const launcherOpen = signal(false)

/** Projection parameters — every one of these drives a live shader uniform. */
export interface Projection {
  /** Hue rotation in degrees applied to the whole desktop. */
  hue: number
  /** 0–1 scanline strength (also feeds the CSS `.scanlines` overlay). */
  scanline: number
  /** Floor grid density multiplier. */
  grid: number
  /** Bloom / glow gain. */
  glow: number
  /** Film grain amount. */
  grain: number
  /** Pointer parallax strength. */
  parallax: number
  /** Background scene. */
  scene: 'lattice' | 'nebula' | 'void'
  /** Pauses shader time and heavy CSS animation. */
  reduceMotion: boolean
}

export const projection = signal<Projection>({
  hue: 0,
  scanline: 0.75,
  grid: 1,
  glow: 1,
  grain: 0.5,
  parallax: 1,
  scene: 'lattice',
  reduceMotion: false,
})

export function setProjection(patch: Partial<Projection>): void {
  projection.value = { ...projection.value, ...patch }
}

export function resetProjection(): void {
  projection.value = {
    hue: 0,
    scanline: 0.75,
    grid: 1,
    glow: 1,
    grain: 0.5,
    parallax: 1,
    scene: 'lattice',
    reduceMotion: false,
  }
}

// --- notifications ----------------------------------------------------------

export interface Notice {
  id: string
  title: string
  body: string
  tone: 'info' | 'warn' | 'ok'
  at: number
}

export const notices = signal<Notice[]>([])

export function notify(title: string, body: string, tone: Notice['tone'] = 'info'): void {
  const notice: Notice = { id: uid('n'), title, body, tone, at: Date.now() }
  notices.value = [...notices.value, notice].slice(-4)
  window.setTimeout(() => {
    notices.value = notices.value.filter((n) => n.id !== notice.id)
  }, 5200)
}

export function dismissNotice(id: string): void {
  notices.value = notices.value.filter((n) => n.id !== id)
}

// --- lock screen ------------------------------------------------------------

export const locked = signal(false)

/** Idle delay before auto-locking, in ms. `0` disables it. */
export const lockDelayMs = signal(180_000)

export const LOCK_DELAYS: Array<{ label: string; ms: number }> = [
  { label: 'Never', ms: 0 },
  { label: '1 min', ms: 60_000 },
  { label: '3 min', ms: 180_000 },
  { label: '10 min', ms: 600_000 },
]

export function lockScreen(): void {
  locked.value = true
}

export function unlockScreen(): void {
  locked.value = false
}

/**
 * Auto-lock after a stretch of no input.
 *
 * A single timer reset on activity, rather than a polling interval — the
 * listeners are passive and capture-phase so they still see events that inner
 * handlers stop propagating.
 */
export function startIdleWatch(): () => void {
  let timer = 0

  const arm = () => {
    window.clearTimeout(timer)
    const delay = lockDelayMs.peek()
    if (delay <= 0 || locked.peek()) return
    timer = window.setTimeout(lockScreen, delay)
  }

  const onActivity = () => {
    if (locked.peek()) return
    arm()
  }

  const events: Array<keyof WindowEventMap> = ['pointermove', 'pointerdown', 'keydown', 'wheel']
  events.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }))

  // Re-arm when the delay setting changes or the screen is unlocked.
  const stopWatching = locked.subscribe(() => arm())
  const stopDelay = lockDelayMs.subscribe(() => arm())

  return () => {
    window.clearTimeout(timer)
    events.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }))
    stopWatching()
    stopDelay()
  }
}

// --- pointer ----------------------------------------------------------------

/** Normalised pointer position (-1 … 1), read by the background shader. */
export const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

export function startClock(): () => void {
  const id = window.setInterval(() => {
    clock.value = new Date()
  }, 1000)
  return () => window.clearInterval(id)
}

export function startPointerTracking(): () => void {
  const onMove = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return () => window.removeEventListener('pointermove', onMove)
}
