/** Shared chart geometry helpers. */

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Default margins. The bottom band is sized to hold the x-axis labels — a
 * container that fits the plot but not its axis is how charts end up with a
 * tiny nested scrollbar.
 */
export const MARGIN: Margin = { top: 14, right: 22, bottom: 30, left: 56 }

export function withMargin(overrides: Partial<Margin>): Margin {
  return { ...MARGIN, ...overrides }
}

/** `var(--series-N)` for a 1-based categorical slot, clamped to the eight. */
export function seriesVar(slot: number): string {
  const n = Math.min(8, Math.max(1, Math.round(slot)))
  return `var(--series-${n})`
}

export function ordinalVar(step: number): string {
  const n = Math.min(5, Math.max(1, Math.round(step)))
  return `var(--ord-${n})`
}

const SEQ_STEPS = [100, 200, 300, 400, 500, 600, 700]

/** Maps 0–1 onto the sequential blue ramp. Light end = near zero. */
export function seqVar(t: number): string {
  const clamped = Math.min(1, Math.max(0, t))
  const idx = Math.min(SEQ_STEPS.length - 1, Math.round(clamped * (SEQ_STEPS.length - 1)))
  return `var(--seq-${SEQ_STEPS[idx]})`
}

/**
 * Maps a signed value onto the diverging ramp: blue below zero, red above,
 * neutral gray at the midpoint. Three steps per arm, equal counts.
 */
export function divVar(value: number, extent: number): string {
  if (extent <= 0) return 'var(--div-mid)'
  const t = Math.max(-1, Math.min(1, value / extent))
  const step = Math.min(3, Math.ceil(Math.abs(t) * 3))
  if (step === 0) return 'var(--div-mid)'
  return t < 0 ? `var(--div-neg-${step})` : `var(--div-pos-${step})`
}

export const STATUS_VAR = {
  good: 'var(--status-good)',
  warning: 'var(--status-warning)',
  serious: 'var(--status-serious)',
  critical: 'var(--status-critical)',
  info: 'var(--series-1)',
} as const

/**
 * A rect with its data-end rounded and its baseline end square, per the mark
 * spec. `side` is the edge the data grows toward.
 */
export function roundedBar(
  x: number,
  y: number,
  w: number,
  h: number,
  r = 4,
  side: 'top' | 'bottom' | 'left' | 'right' = 'top',
): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  if (w <= 0 || h <= 0) return ''
  switch (side) {
    case 'top':
      return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`
    case 'bottom':
      return `M${x},${y} L${x},${y + h - rr} Q${x},${y + h} ${x + rr},${y + h} L${x + w - rr},${y + h} Q${x + w},${y + h} ${x + w},${y + h - rr} L${x + w},${y} Z`
    case 'right':
      return `M${x},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h - rr} Q${x + w},${y + h} ${x + w - rr},${y + h} L${x},${y + h} Z`
    case 'left':
      return `M${x + w},${y} L${x + rr},${y} Q${x},${y} ${x},${y + rr} L${x},${y + h - rr} Q${x},${y + h} ${x + rr},${y + h} L${x + w},${y + h} Z`
  }
}

/** Cap a band's mark thickness — bars never fill their slot. */
export function barWidth(bandwidth: number, cap = 24): number {
  return Math.min(cap, Math.max(2, bandwidth))
}

/** Index of the datum nearest a pixel position, for crosshair snapping. */
export function nearestIndex(positions: number[], px: number): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < positions.length; i++) {
    const d = Math.abs(positions[i] - px)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
