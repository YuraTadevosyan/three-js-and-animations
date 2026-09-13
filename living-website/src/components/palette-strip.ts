import { html } from 'lit'
import { toCss } from '@/lib/color'
import { organism } from '@/organism'
import type { Palette } from '@/organism/state'
import { Organ } from './base'

const SHOWN: [keyof Palette, string][] = [
  ['background', 'background'],
  ['card', 'card'],
  ['foreground', 'foreground'],
  ['primary', 'primary'],
  ['accent', 'accent'],
  ['canopy', 'canopy'],
  ['glow', 'glow'],
  ['skyMid', 'sky'],
]

/**
 * The live design-token palette. Every swatch is the value the circadian
 * system currently has on :root — the same variables Tailwind compiles
 * `bg-primary` and `text-muted-foreground` against, which is why the whole
 * page changes mode over the day without a single dark: variant in the markup.
 */
export class PaletteStrip extends Organ {
  #slow = 0

  render() {
    return html`
      <ul class="grid grid-cols-4 gap-2 sm:grid-cols-8" role="list">
        ${SHOWN.map(
          ([key, label]) => html`
            <li class="min-w-0">
              <div
                data-swatch=${key}
                class="h-12 w-full rounded-md border border-border/60"
                style="background: hsl(var(--background))"
              ></div>
              <p class="mt-1.5 truncate text-[10px] text-muted-foreground">${label}</p>
              <p class="tnum truncate text-[10px] text-muted-foreground/70" data-hsl=${key}>—</p>
            </li>
          `,
        )}
      </ul>
    `
  }

  firstUpdated() {
    this.tick((dt) => {
      this.#slow += dt
      if (this.#slow < 0.25) return
      this.#slow = 0

      const palette = organism.state.circadian.palette
      for (const [key] of SHOWN) {
        const color = palette[key]
        const swatch = this.$(`[data-swatch="${key}"]`)
        if (swatch) swatch.style.background = toCss(color)
        const readout = this.$(`[data-hsl="${key}"]`)
        if (readout) readout.textContent = `${Math.round(color.h)} ${Math.round(color.l)}%`
      }
    })
  }
}

customElements.define('palette-strip', PaletteStrip)
