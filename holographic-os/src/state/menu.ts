import { signal } from '@preact/signals'
import type { JSX } from 'preact'

/**
 * A single global context menu.
 *
 * Menus are described as data and rendered by one component near the root, so
 * they escape the `overflow: hidden` of whatever surface opened them and always
 * stack above the window layer.
 */

export interface MenuItem {
  id: string
  label?: string
  icon?: JSX.Element
  /** Right-aligned hint, e.g. a keyboard shortcut. */
  hint?: string
  onSelect?: () => void
  disabled?: boolean
  danger?: boolean
  /** Renders a check mark in the icon column. */
  checked?: boolean
  /** Renders a divider instead of a row; every other field is ignored. */
  separator?: boolean
}

export interface MenuState {
  x: number
  y: number
  items: MenuItem[]
}

export const contextMenu = signal<MenuState | null>(null)

export function openMenu(event: MouseEvent, items: MenuItem[]): void {
  event.preventDefault()
  event.stopPropagation()
  contextMenu.value = { x: event.clientX, y: event.clientY, items }
}

export function closeMenu(): void {
  if (contextMenu.peek()) contextMenu.value = null
}

let separatorSeq = 0

/** Convenience for building menus without inventing separator ids. */
export function divider(): MenuItem {
  separatorSeq += 1
  return { id: `sep-${separatorSeq}`, separator: true }
}
