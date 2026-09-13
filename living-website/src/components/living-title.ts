import { lerp } from '@/lib/math'
import { Organ } from './base'

/**
 * Headline text whose letterforms breathe.
 *
 * Fraunces is a variable font with `SOFT` and `WONK` axes alongside weight and
 * optical size, so the type can physically soften on the exhale rather than
 * just scaling. Axis changes force a re-raster of the glyphs, so this updates
 * at 15Hz rather than every frame — well under the threshold where the eye
 * would read it as stepping.
 */
export class LivingTitle extends Organ {
  static properties = {
    amount: { type: Number },
  }

  declare amount: number

  #accum = 0

  constructor() {
    super()
    this.amount = 1
  }

  firstUpdated() {
    this.style.fontFamily = 'Fraunces, ui-serif, Georgia, serif'

    this.tick((dt, state) => {
      this.#accum += dt
      if (this.#accum < 1 / 12) return
      this.#accum = 0

      // Collapse to a fixed, comfortable set of axis values — no motion, but
      // the type still looks intentional rather than defaulting.
      const t = state.prefs.reducedMotion ? 0 : (state.breath.value * 0.5 + 0.5) * this.amount

      const wght = Math.round(lerp(420, 620, t))
      const soft = Math.round(lerp(18, 74, t))
      const opsz = Math.round(lerp(96, 132, t))

      // WONK is deliberately pinned. It swaps in swash alternates rather than
      // interpolating, so animating it would flip glyph shapes once a breath —
      // which reads as a rendering glitch, not as breathing.
      this.style.fontVariationSettings =
        `"opsz" ${opsz}, "wght" ${wght}, "SOFT" ${soft}, "WONK" 0`
      // Tracking loosens fractionally on the inhale; it is the part you feel
      // without being able to point at it.
      this.style.letterSpacing = `${lerp(-0.021, -0.007, t).toFixed(4)}em`
    })
  }
}

customElements.define('living-title', LivingTitle)
