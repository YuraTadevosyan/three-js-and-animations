import { damp, clamp, remap } from '@/lib/math'
import { Organ } from './base'

/**
 * A panel that leans toward the cursor and breathes with the page.
 *
 * No `render()` on purpose: LitElement's default returns `noChange`, so this
 * element never touches its own children. That lets the card wrap arbitrary
 * Astro-authored markup — the content is in the static HTML and stays there
 * whether or not the bundle ever loads.
 */
export class OrganCard extends Organ {
  static properties = {
    tilt: { type: Number },
    lift: { type: Number },
  }

  declare tilt: number
  declare lift: number

  #rx = 0
  #ry = 0
  #near = 0
  #rect: DOMRect | null = null
  #rectAge = 0

  constructor() {
    super()
    this.tilt = 4
    this.lift = 8
  }

  firstUpdated() {
    this.style.willChange = 'transform'
    this.style.transformStyle = 'preserve-3d'

    this.tick((dt, state) => {
      const { attention, breath, prefs } = state

      this.#rectAge += dt
      if (!this.#rect || this.#rectAge > 0.125) {
        this.#rect = this.getBoundingClientRect()
        this.#rectAge = 0
      }

      const r = this.#rect
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = (attention.x - cx) / Math.max(r.width / 2, 1)
      const dy = (attention.y - cy) / Math.max(r.height / 2, 1)

      // Proximity, not hover: the card starts responding before the pointer
      // arrives, which is what makes it feel like it noticed you coming.
      const dist = Math.hypot(attention.x - cx, attention.y - cy)
      const proximity =
        attention.inside && !prefs.reducedMotion
          ? clamp(remap(dist, Math.max(r.width, r.height) * 1.1, 0, 0, 1))
          : 0

      this.#near = damp(this.#near, proximity, 0.02, dt)
      this.#rx = damp(this.#rx, clamp(-dy, -1, 1) * this.tilt * this.#near, 0.01, dt)
      this.#ry = damp(this.#ry, clamp(dx, -1, 1) * this.tilt * this.#near, 0.01, dt)

      const z = this.#near * this.lift + (prefs.reducedMotion ? 0 : breath.value * 1.6)

      this.style.transform =
        `perspective(1100px) rotateX(${this.#rx.toFixed(2)}deg) ` +
        `rotateY(${this.#ry.toFixed(2)}deg) translateZ(${z.toFixed(2)}px)`
    })
  }
}

customElements.define('organ-card', OrganCard)
