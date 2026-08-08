import { signal } from '@preact/signals'
import { clamp } from '@/lib/util'

/**
 * Desktop icon placement.
 *
 * Icons fall into a default column-major grid and stay there until the user
 * drags one; only dragged icons get an entry here, so the rest keep reflowing
 * with the viewport instead of being pinned to stale coordinates.
 */

/** Icon hit box, used for both layout and drag clamping. */
export const ICON_W = 84
export const ICON_H = 86

const CELL_W = 92
const CELL_H = 94
const PAD = 12

export interface IconPos {
  x: number
  y: number
}

/** Positions of icons the user has moved, keyed by icon id. Session-lived. */
export const iconPositions = signal<Record<string, IconPos>>({})

export interface Size {
  w: number
  h: number
}

/** Where icon `index` sits before anyone has dragged it. */
export function defaultIconPos(index: number, bounds: Size): IconPos {
  const rows = Math.max(1, Math.floor((bounds.h - PAD) / CELL_H))
  const col = Math.floor(index / rows)
  const row = index % rows
  return {
    x: clamp(PAD + col * CELL_W, 0, Math.max(0, bounds.w - ICON_W)),
    y: clamp(PAD + row * CELL_H, 0, Math.max(0, bounds.h - ICON_H)),
  }
}

export function setIconPosition(id: string, pos: IconPos): void {
  iconPositions.value = { ...iconPositions.peek(), [id]: pos }
}

/** Pulls moved icons back into view after the viewport shrinks. */
export function reflowIcons(bounds: Size): void {
  const current = iconPositions.peek()
  const ids = Object.keys(current)
  if (!ids.length) return

  const maxX = Math.max(0, bounds.w - ICON_W)
  const maxY = Math.max(0, bounds.h - ICON_H)

  let changed = false
  const next: Record<string, IconPos> = {}
  for (const id of ids) {
    const p = current[id]
    const x = clamp(p.x, 0, maxX)
    const y = clamp(p.y, 0, maxY)
    if (x !== p.x || y !== p.y) changed = true
    next[id] = { x, y }
  }
  if (changed) iconPositions.value = next
}

/** Drops every icon back into the default grid. */
export function resetIconLayout(): void {
  iconPositions.value = {}
}
