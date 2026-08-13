import { batch, computed, signal } from '@preact/signals'
import { APPS, type AppId } from '@/apps/manifest'
import { clamp, uid } from '@/lib/util'

/** Chrome heights the desktop must keep clear. */
export const TOPBAR_H = 40
export const DOCK_H = 80
export const EDGE_PAD = 10

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface WindowProps {
  /** `viewer` — path of the document being displayed. */
  filePath?: string
  /** `files` — folder the explorer should open on. */
  folderPath?: string
}

export interface WinState extends Rect {
  id: string
  appId: AppId
  title: string
  z: number
  minimized: boolean
  maximized: boolean
  /** Geometry to return to when un-maximizing. */
  restore: Rect | null
  props: WindowProps
  /** Per-app hue offset applied to this window's chrome. */
  hue: number
  /** Virtual desktop this window lives on. */
  workspace: number
  /** Always-on-top: floats above unpinned windows on the same workspace. */
  pinned: boolean
}

export const windows = signal<WinState[]>([])
export const focusedId = signal<string | null>(null)

/** Virtual desktops. Windows stay mounted when their workspace is hidden, so
 *  terminal scrollback and half-typed messages survive a switch. */
export const WORKSPACE_COUNT = 3
export const activeWorkspace = signal(0)

/**
 * Pinned windows float in a band above unpinned ones. The offset is generous
 * enough that focus order never lets an unpinned window cross it, while staying
 * far below the shell chrome (snap ghost 8000, top bar and dock 9000).
 */
const PIN_BAND = 4000

export function effectiveZ(win: WinState): number {
  return win.pinned ? win.z + PIN_BAND : win.z
}

/** Usable desktop area, recomputed on viewport resize. */
export const desktopBounds = signal<Rect>({
  x: 0,
  y: TOPBAR_H,
  w: typeof window === 'undefined' ? 1280 : window.innerWidth,
  h: typeof window === 'undefined' ? 720 : window.innerHeight - TOPBAR_H - DOCK_H,
})

export const openAppIds = computed(() => new Set(windows.value.map((w) => w.appId)))

export const hasWindows = computed(() => windows.value.length > 0)

let zCounter = 10
let cascade = 0

function nextZ(): number {
  zCounter += 1
  return zCounter
}

export function updateDesktopBounds(): void {
  desktopBounds.value = {
    x: 0,
    y: TOPBAR_H,
    w: window.innerWidth,
    h: Math.max(220, window.innerHeight - TOPBAR_H - DOCK_H),
  }
}

/**
 * Places a new window in a cascade, biased toward the centre, and clamped so it
 * always lands fully inside the desktop even on small viewports.
 */
function placeWindow(w: number, h: number): Rect {
  const b = desktopBounds.value
  const width = Math.min(w, b.w - EDGE_PAD * 2)
  const height = Math.min(h, b.h - EDGE_PAD * 2)
  const offset = (cascade % 6) * 28
  cascade += 1

  const baseX = b.x + Math.max(EDGE_PAD, (b.w - width) / 2 - 90) + offset
  const baseY = b.y + Math.max(EDGE_PAD, (b.h - height) / 2 - 60) + offset

  return {
    x: clamp(baseX, b.x + EDGE_PAD, b.x + b.w - width - EDGE_PAD),
    y: clamp(baseY, b.y + EDGE_PAD, b.y + b.h - height - EDGE_PAD),
    w: width,
    h: height,
  }
}

/** Apps that may only ever have one window; opening again just focuses it. */
const SINGLETON: ReadonlySet<AppId> = new Set<AppId>([
  'assistant',
  'monitor',
  'weather',
  'projector',
  'settings',
  'about',
])

export function openApp(appId: AppId, props: WindowProps = {}, title?: string): string {
  const manifest = APPS[appId]

  if (SINGLETON.has(appId)) {
    const existing = windows.value.find((w) => w.appId === appId)
    if (existing) {
      surfaceHere(existing.id)
      return existing.id
    }
  }

  // A viewer for an already-open document should surface, not duplicate.
  if (appId === 'viewer' && props.filePath) {
    const existing = windows.value.find((w) => w.appId === 'viewer' && w.props.filePath === props.filePath)
    if (existing) {
      surfaceHere(existing.id)
      return existing.id
    }
  }

  const rect = placeWindow(manifest.defaultSize.w, manifest.defaultSize.h)
  const id = uid('win')

  const win: WinState = {
    id,
    appId,
    title: title ?? manifest.title,
    ...rect,
    z: nextZ(),
    minimized: false,
    maximized: false,
    restore: null,
    props,
    hue: manifest.hue,
    workspace: activeWorkspace.value,
    pinned: false,
  }

  batch(() => {
    windows.value = [...windows.value, win]
    focusedId.value = id
  })
  return id
}

/**
 * Topmost focusable window on a workspace, or null. Used everywhere focus has
 * to fall through — closing, minimizing, switching desktops.
 */
function topmostOn(list: WinState[], workspace: number): string | null {
  const candidates = list.filter((w) => !w.minimized && w.workspace === workspace)
  if (!candidates.length) return null
  return candidates.reduce((a, b) => (effectiveZ(a) > effectiveZ(b) ? a : b)).id
}

export function closeWindow(id: string): void {
  batch(() => {
    windows.value = windows.value.filter((w) => w.id !== id)
    if (focusedId.value === id) {
      focusedId.value = topmostOn(windows.value, activeWorkspace.value)
    }
  })
}

export function closeApp(appId: AppId): void {
  const targets = windows.value.filter((w) => w.appId === appId).map((w) => w.id)
  targets.forEach(closeWindow)
}

export function focusWindow(id: string): void {
  const win = windows.value.find((w) => w.id === id)
  if (!win) return
  // Already on top and visible — nothing to do (avoids pointless re-renders
  // on every mousedown inside the focused window).
  if (focusedId.value === id && !win.minimized && win.z === zCounter) return

  batch(() => {
    windows.value = windows.value.map((w) => (w.id === id ? { ...w, z: nextZ(), minimized: false } : w))
    focusedId.value = id
  })
}

export function minimizeWindow(id: string): void {
  batch(() => {
    windows.value = windows.value.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    if (focusedId.value === id) {
      focusedId.value = topmostOn(windows.value, activeWorkspace.value)
    }
  })
}

/** Un-minimizes (if needed) and raises. */
export function restoreWindow(id: string): void {
  batch(() => {
    windows.value = windows.value.map((w) => (w.id === id ? { ...w, minimized: false, z: nextZ() } : w))
    focusedId.value = id
  })
}

/** Dock behaviour: focus if backgrounded, minimize if already frontmost. */
export function toggleWindow(id: string): void {
  const win = windows.value.find((w) => w.id === id)
  if (!win) return
  if (win.minimized) restoreWindow(id)
  else if (focusedId.value === id) minimizeWindow(id)
  else focusWindow(id)
}

export function toggleMaximize(id: string): void {
  const b = desktopBounds.value
  windows.value = windows.value.map((w) => {
    if (w.id !== id) return w
    if (w.maximized && w.restore) {
      return { ...w, ...w.restore, maximized: false, restore: null, z: nextZ() }
    }
    return {
      ...w,
      restore: { x: w.x, y: w.y, w: w.w, h: w.h },
      x: b.x + EDGE_PAD,
      y: b.y + EDGE_PAD,
      w: b.w - EDGE_PAD * 2,
      h: b.h - EDGE_PAD * 2,
      maximized: true,
      z: nextZ(),
    }
  })
  focusedId.value = id
}

/** Commits geometry after a drag/resize gesture ends. */
export function setWindowRect(id: string, rect: Partial<Rect>): void {
  windows.value = windows.value.map((w) => (w.id === id ? { ...w, ...rect, maximized: false } : w))
}

export function setWindowTitle(id: string, title: string): void {
  windows.value = windows.value.map((w) => (w.id === id ? { ...w, title } : w))
}

export function setWindowProps(id: string, props: WindowProps): void {
  windows.value = windows.value.map((w) => (w.id === id ? { ...w, props: { ...w.props, ...props } } : w))
}

export type SnapZone = 'left' | 'right' | 'maximize' | 'tl' | 'tr' | 'bl' | 'br'

/** Zone the in-flight drag would snap to, rendered as a ghost by the desktop. */
export const snapPreview = signal<SnapZone | null>(null)

/**
 * Maps a pointer position to a snap zone, or null if it is not near an edge.
 * Corners win over edges, which is why they are tested first.
 */
export function snapZoneAt(clientX: number, clientY: number): SnapZone | null {
  const b = desktopBounds.value
  const EDGE = 8
  const CORNER = 130

  const nearLeft = clientX <= b.x + EDGE
  const nearRight = clientX >= b.x + b.w - EDGE
  const nearTop = clientY <= b.y + EDGE
  const nearBottom = clientY >= b.y + b.h - EDGE

  if (nearLeft && clientY <= b.y + CORNER) return 'tl'
  if (nearLeft && clientY >= b.y + b.h - CORNER) return 'bl'
  if (nearRight && clientY <= b.y + CORNER) return 'tr'
  if (nearRight && clientY >= b.y + b.h - CORNER) return 'br'
  if (nearLeft) return 'left'
  if (nearRight) return 'right'
  if (nearTop) return 'maximize'
  if (nearBottom) return null
  return null
}

/** Geometry for an Aero-style snap zone, used for both preview and commit. */
export function snapRect(zone: SnapZone): Rect {
  const b = desktopBounds.value
  const halfW = (b.w - EDGE_PAD * 3) / 2
  const halfH = (b.h - EDGE_PAD * 3) / 2
  const fullW = b.w - EDGE_PAD * 2
  const fullH = b.h - EDGE_PAD * 2
  const left = b.x + EDGE_PAD
  const right = b.x + EDGE_PAD * 2 + halfW
  const top = b.y + EDGE_PAD
  const bottom = b.y + EDGE_PAD * 2 + halfH

  switch (zone) {
    case 'left':
      return { x: left, y: top, w: halfW, h: fullH }
    case 'right':
      return { x: right, y: top, w: halfW, h: fullH }
    case 'tl':
      return { x: left, y: top, w: halfW, h: halfH }
    case 'tr':
      return { x: right, y: top, w: halfW, h: halfH }
    case 'bl':
      return { x: left, y: bottom, w: halfW, h: halfH }
    case 'br':
      return { x: right, y: bottom, w: halfW, h: halfH }
    case 'maximize':
      return { x: left, y: top, w: fullW, h: fullH }
  }
}

export function applySnap(id: string, zone: SnapZone): void {
  const rect = snapRect(zone)
  windows.value = windows.value.map((w) => {
    if (w.id !== id) return w
    return {
      ...w,
      ...rect,
      // Keep the pre-snap geometry so un-maximize still has somewhere to go.
      restore: w.restore ?? { x: w.x, y: w.y, w: w.w, h: w.h },
      maximized: zone === 'maximize',
    }
  })
}

/**
 * Keeps every window reachable after the viewport shrinks — maximized windows
 * re-fill, and floating ones are pulled back inside the new bounds.
 */
export function reflowWindows(): void {
  const b = desktopBounds.value
  windows.value = windows.value.map((w) => {
    if (w.maximized) {
      return { ...w, x: b.x + EDGE_PAD, y: b.y + EDGE_PAD, w: b.w - EDGE_PAD * 2, h: b.h - EDGE_PAD * 2 }
    }
    const width = Math.min(w.w, b.w - EDGE_PAD * 2)
    const height = Math.min(w.h, b.h - EDGE_PAD * 2)
    return {
      ...w,
      w: width,
      h: height,
      x: clamp(w.x, b.x + EDGE_PAD, Math.max(b.x + EDGE_PAD, b.x + b.w - width - EDGE_PAD)),
      y: clamp(w.y, b.y + EDGE_PAD, Math.max(b.y + EDGE_PAD, b.y + b.h - height - EDGE_PAD)),
    }
  })
}

/** Cycles focus through the current workspace's visible windows (Alt+Tab). */
export function cycleFocus(): void {
  const ws = activeWorkspace.value
  const visible = windows.value.filter((w) => !w.minimized && w.workspace === ws)
  if (visible.length < 2) return
  const sorted = [...visible].sort((a, b) => effectiveZ(a) - effectiveZ(b))
  focusWindow(sorted[0].id)
}

/** Only parks the current workspace — other desktops keep their arrangement. */
export function minimizeAll(): void {
  const ws = activeWorkspace.value
  batch(() => {
    windows.value = windows.value.map((w) => (w.workspace === ws ? { ...w, minimized: true } : w))
    focusedId.value = null
  })
}

// --- workspaces -------------------------------------------------------------

export function switchWorkspace(index: number): void {
  const next = clamp(Math.trunc(index), 0, WORKSPACE_COUNT - 1)
  if (next === activeWorkspace.value) return
  batch(() => {
    activeWorkspace.value = next
    focusedId.value = topmostOn(windows.value, next)
  })
}

/** Sends a window to another desktop and follows focus on the one we left. */
export function moveWindowToWorkspace(id: string, workspace: number): void {
  const ws = clamp(Math.trunc(workspace), 0, WORKSPACE_COUNT - 1)
  batch(() => {
    windows.value = windows.value.map((w) => (w.id === id ? { ...w, workspace: ws } : w))
    if (focusedId.value === id && ws !== activeWorkspace.value) {
      focusedId.value = topmostOn(windows.value, activeWorkspace.value)
    }
  })
}

/** Pulls a window onto the active desktop, un-minimized and focused. */
export function surfaceHere(id: string): void {
  batch(() => {
    windows.value = windows.value.map((w) =>
      w.id === id ? { ...w, workspace: activeWorkspace.value, minimized: false, z: nextZ() } : w,
    )
    focusedId.value = id
  })
}

export function togglePin(id: string): void {
  windows.value = windows.value.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w))
}
