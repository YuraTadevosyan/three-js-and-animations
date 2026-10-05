/**
 * Keyboard travel through the decades.
 *
 *   ← → PageUp PageDown   previous / next decade
 *   1 – 6                 straight to a decade (0: back to the start)
 *   Space                 pause / resume the tour (scrolls as usual otherwise)
 *   Esc                   end the tour
 *
 * ↑ ↓ Home End are left alone: fine scrubbing through a transition with the
 * arrow keys is half the fun. Everything is ignored while you're typing
 * somewhere, or while a dialog is open.
 */

import { ERAS, T_MAX } from './eras'
import { currentT, goTo, onProgress } from './progress'
import { pauseTour, resumeTour, stepStop, stopTour } from './tour'
import type { World } from '@/state/world'

export interface Shortcut {
  keys: string
  does: string
}

export const SHORTCUTS: readonly Shortcut[] = [
  { keys: '← →  or  PgUp PgDn', does: 'Previous / next decade' },
  { keys: '1 – 6', does: 'Jump to a decade (0: back to the start)' },
  { keys: '↑ ↓', does: 'Scrub slowly through a transition' },
  { keys: 'Space', does: 'Pause or resume the tour' },
  { keys: 'Esc', does: 'End the tour' },
]

const typing = (el: EventTarget | null): boolean => {
  const e = el as HTMLElement | null
  if (!e || !e.closest) return false
  return !!e.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"]')
}

export function installKeys(world: World): () => void {
  // Where the last keypress sent us. Pressing → twice quickly should move two
  // decades, not aim at the same one again from halfway there.
  let target: number | null = null
  let targetAt = 0

  const travel = (t: number) => {
    stopTour()
    target = Math.min(T_MAX, Math.max(0, t))
    targetAt = performance.now()
    goTo(target)
  }
  const base = () => (target !== null && performance.now() - targetAt < 1800 ? target : currentT())
  const off = onProgress((t) => {
    if (target !== null && Math.abs(t - target) < 0.02) target = null
  })

  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    if (typing(e.target) || document.querySelector('dialog[open]')) return
    let handled = true
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        travel(stepStop(base(), 1))
        break
      case 'ArrowLeft':
      case 'PageUp':
        travel(stepStop(base(), -1))
        break
      case ' ':
        if (world.tour === 'playing') pauseTour()
        else if (world.tour === 'paused') resumeTour()
        else handled = false // let Space scroll the page like it always does
        break
      case 'Escape':
        if (world.tour !== 'off') stopTour()
        else handled = false
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Home':
      case 'End':
        // Native scrolling, but it means the visitor is driving now.
        if (world.tour !== 'off') stopTour()
        handled = false
        break
      default:
        if (/^[0-6]$/.test(e.key)) travel(e.key === '0' ? 0 : ERAS[Number(e.key) - 1].snap)
        else handled = false
    }
    if (handled) e.preventDefault()
  }

  document.addEventListener('keydown', onKey)
  return () => {
    off()
    document.removeEventListener('keydown', onKey)
  }
}
