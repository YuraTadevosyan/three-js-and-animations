import { toVar } from '@/lib/color'
import type { Palette } from './state'

const VAR_NAMES: Record<keyof Palette, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  border: '--border',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  canopy: '--canopy',
  soil: '--soil',
  glow: '--glow',
  skyTop: '--sky-top',
  skyMid: '--sky-mid',
  skyBottom: '--sky-bottom',
  sun: '--sun',
}

const KEYS = Object.keys(VAR_NAMES) as (keyof Palette)[]

/**
 * Pushes the circadian palette onto :root as Tailwind's HSL tokens.
 *
 * Writing custom properties on the root element invalidates style for the
 * whole document, so this runs at a fixed 8Hz rather than every frame and
 * skips writes when the value is unchanged to the tenth of a degree. At that
 * rate the transition is still invisible to the eye — the sun moves slowly.
 */
export class ThemeWriter {
  #last: Record<string, string> = {}
  #accum = 0
  #interval = 1 / 8

  write(palette: Palette, force = false) {
    const root = document.documentElement
    for (const key of KEYS) {
      const name = VAR_NAMES[key]
      const value = toVar(palette[key])
      if (!force && this.#last[name] === value) continue
      this.#last[name] = value
      root.style.setProperty(name, value)
    }
  }

  /** Also mirrors light/dark onto the root class so `dark:` variants work. */
  setScheme(daylight: number) {
    const dark = daylight < 0.42
    const root = document.documentElement
    if (root.classList.contains('dark') !== dark) {
      root.classList.toggle('dark', dark)
      root.style.colorScheme = dark ? 'dark' : 'light'
    }
  }

  tick(dt: number, palette: Palette, daylight: number) {
    this.#accum += dt
    if (this.#accum < this.#interval) return
    this.#accum = 0
    this.write(palette)
    this.setScheme(daylight)
  }
}
