import { createSignal } from 'solid-js'
import type { ExhibitDef, RoomId, SecretDef } from '@/data/museum'
import { ROOMS, SECRETS } from '@/data/museum'
import type { MuseumHandle } from '@/engine/types'

export type Phase = 'loading' | 'entry' | 'exploring' | 'paused'

/**
 * The single bridge between the Babylon render loop and the Solid HUD.
 *
 * The engine only ever calls setters here, and the HUD only ever reads getters
 * plus the imperative `handle`. Keeping the boundary this thin means the render
 * loop never touches the reactive graph more than once per changed value.
 */

export const [phase, setPhase] = createSignal<Phase>('loading')
export const [loadProgress, setLoadProgress] = createSignal(0)

export const [currentRoom, setCurrentRoom] = createSignal<RoomId>('entrance')
/** Set briefly when a new room is entered, then cleared to fade the title card. */
export const [roomBanner, setRoomBanner] = createSignal<RoomId | null>(null)

export const [prompt, setPrompt] = createSignal<string | null>(null)
export const [focusedExhibit, setFocusedExhibit] = createSignal<ExhibitDef | null>(null)

export const [discovered, setDiscovered] = createSignal<string[]>([])
export const [toast, setToast] = createSignal<{ key: number; secret: SecretDef } | null>(null)

export const [pointerLocked, setPointerLocked] = createSignal(false)
export const [tourActive, setTourActive] = createSignal(false)
export const [muted, setMuted] = createSignal(false)
export const [afterHours, setAfterHours] = createSignal(false)
export const [isTouch, setIsTouch] = createSignal(false)
export const [handle, setHandle] = createSignal<MuseumHandle | null>(null)

let toastKey = 0
let bannerTimer: ReturnType<typeof setTimeout> | undefined
let toastTimer: ReturnType<typeof setTimeout> | undefined

/** Announce a room; the card fades itself out. */
export function announceRoom(id: RoomId) {
  setCurrentRoom(id)
  setRoomBanner(id)
  clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => setRoomBanner(null), 4200)
}

/** Log a discovery. Returns false if it was already found. */
export function discover(secretId: string): boolean {
  if (discovered().includes(secretId)) return false
  const secret = SECRETS.find((s) => s.id === secretId)
  if (!secret) return false

  setDiscovered([...discovered(), secretId])
  setToast({ key: ++toastKey, secret })
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => setToast(null), 6000)
  return true
}

export function isDiscovered(secretId: string) {
  return discovered().includes(secretId)
}

export function allFound() {
  return discovered().length >= SECRETS.length
}

export const roomIndex = (id: RoomId) => ROOMS.findIndex((r) => r.id === id)
