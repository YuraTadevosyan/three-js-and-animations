/**
 * Light/dark mode.
 *
 * Dark is the default — the charts were stepped for the dark surface first — but
 * the light palette is a selected set, not an automatic flip, so both modes get
 * a validated set of series colors. See `app.css`.
 */

const STORAGE_KEY = 'ai-data-viz:theme'

export type Mode = 'dark' | 'light'

function initial(): Mode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // Private-mode Safari throws on localStorage; the default is fine.
  }
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

class Theme {
  mode = $state<Mode>('dark')

  constructor() {
    this.mode = initial()
    this.apply()
  }

  toggle() {
    this.mode = this.mode === 'dark' ? 'light' : 'dark'
    this.apply()
    try {
      localStorage.setItem(STORAGE_KEY, this.mode)
    } catch {
      // Not being able to remember the choice is not worth breaking over.
    }
  }

  private apply() {
    const root = document.documentElement
    root.classList.toggle('dark', this.mode === 'dark')
    root.dataset.theme = this.mode
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', this.mode === 'dark' ? '#0b0d12' : '#f9f9f7')
  }
}

export const theme = new Theme()

/** Reads a CSS custom property off the root — how canvas charts get palette tokens. */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
