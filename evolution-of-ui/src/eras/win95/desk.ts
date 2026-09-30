import { createContextId } from '@builder.io/qwik'

/**
 * The Windows 95 window manager, as plain data plus plain functions so the
 * Qwik handlers can import them into any lazily-loaded chunk.
 */

export type WinId = 'notepad' | 'paint' | 'inbox' | 'mines' | 'computer' | 'bin' | 'welcome' | 'media'

export interface WinState {
  open: boolean
  min: boolean
  max: boolean
  /** Position as a fraction of the desktop, so it survives resizes. */
  x: number
  y: number
  z: number
}

export interface Alert {
  title: string
  text: string
  kind: 'error' | 'info' | 'warn'
}

export interface Desk {
  wins: Record<WinId, WinState>
  focus: WinId | null
  zTop: number
  start: boolean
  selected: string | null
  alert: Alert | null
  shutdown: boolean
}

const win = (open: boolean, x: number, y: number, z: number): WinState => ({ open, min: false, max: false, x, y, z })

export const initialDesk = (): Desk => ({
  wins: {
    paint: win(true, 0.11, 0.4, 1),
    welcome: win(true, 0.5, 0.34, 2),
    notepad: win(true, 0.2, 0.05, 3),
    inbox: win(false, 0.46, 0.12, 0),
    mines: win(false, 0.62, 0.4, 0),
    computer: win(false, 0.24, 0.14, 0),
    bin: win(false, 0.32, 0.24, 0),
    media: win(false, 0.55, 0.52, 0),
  },
  focus: 'notepad',
  zTop: 3,
  start: false,
  selected: null,
  alert: null,
  shutdown: false,
})

export const DeskContext = createContextId<Desk>('eou.win95.desk')

export function focusWin(d: Desk, id: WinId): void {
  const w = d.wins[id]
  if (d.focus === id && w.z === d.zTop) return
  d.zTop += 1
  w.z = d.zTop
  d.focus = id
}

export function openWin(d: Desk, id: WinId): void {
  const w = d.wins[id]
  w.open = true
  w.min = false
  focusWin(d, id)
  d.start = false
}

export function closeWin(d: Desk, id: WinId): void {
  d.wins[id].open = false
  if (d.focus === id) d.focus = topmost(d)
}

export function minimizeWin(d: Desk, id: WinId): void {
  d.wins[id].min = true
  if (d.focus === id) d.focus = topmost(d)
}

/** Taskbar click: minimise the active window, otherwise restore and raise. */
export function taskClick(d: Desk, id: WinId): void {
  const w = d.wins[id]
  if (d.focus === id && !w.min) minimizeWin(d, id)
  else {
    w.min = false
    focusWin(d, id)
  }
}

function topmost(d: Desk): WinId | null {
  let best: WinId | null = null
  let z = -1
  for (const [id, w] of Object.entries(d.wins) as [WinId, WinState][]) {
    if (w.open && !w.min && w.z > z) {
      z = w.z
      best = id
    }
  }
  return best
}

export const TITLES: Record<WinId, string> = {
  notepad: 'notes.txt - Notepad',
  paint: 'lake.bmp - Paint',
  inbox: 'Inbox - Microsoft Exchange',
  mines: 'Minesweeper',
  computer: 'My Computer',
  bin: 'Recycle Bin',
  welcome: 'Welcome',
  media: 'song.mid - Media Player',
}

export const TASK_LABELS: Record<WinId, string> = {
  notepad: 'notes.txt - Notepad',
  paint: 'lake.bmp - Paint',
  inbox: 'Inbox - Microsoft Ex...',
  mines: 'Minesweeper',
  computer: 'My Computer',
  bin: 'Recycle Bin',
  welcome: 'Welcome',
  media: 'song.mid - Media Pl...',
}
