import { hover, press } from 'motion'
import { clamp, damp, remap, Spring2 } from '@/lib/math'
import { Organ } from './base'
import './living-eyes'

/**
 * Enhances a real `<a>` or `<button>` that is already in the markup.
 *
 * No `render()`, so the control it wraps — with its text, its href and its
 * semantics — survives whether or not this bundle ever loads. What gets added
 * is the behaviour: a pull toward the cursor, a hover swell, a press squash,
 * a breath, and optionally a pair of eyes.
 *
 * Motion appears here only as a *gesture detector*. `hover` and `press` set
 * target values; the heartbeat springs toward them. Letting Motion animate the
 * transform directly would put two independent loops on the same property and
 * the magnetism would fight the hover scale.
 */
export class LivingButton extends Organ {
  static properties = {
    eyes: { type: Boolean },
    reach: { type: Number },
  }

  declare eyes: boolean
  declare reach: number

  #pull = new Spring2(0, 0, 160, 20)
  #hover = 0
  #press = 0
  #hoverTarget = 0
  #pressTarget = 0
  #rect: DOMRect | null = null
  #rectAge = 0

  constructor() {
    super()
    this.eyes = false
    this.reach = 170
  }

  firstUpdated() {
    const control = this.querySelector<HTMLElement>('a, button')
    if (!control) return

    control.style.willChange = 'transform'

    if (this.eyes && !control.querySelector('living-eyes')) {
      const eyes = document.createElement('living-eyes')
      eyes.setAttribute('size', '26')
      eyes.style.marginBlock = '-6px'
      control.prepend(eyes)
    }

    const glow = document.createElement('span')
    glow.className = 'pointer-events-none absolute inset-0 rounded-full'
    glow.style.background =
      'radial-gradient(circle at 50% 120%, hsl(var(--glow) / .55), transparent 70%)'
    glow.style.opacity = '0'
    control.prepend(glow)

    const abort = new AbortController()
    this.cleanup(() => abort.abort())
    this.cleanup(hover(control, () => {
      this.#hoverTarget = 1
      return () => {
        this.#hoverTarget = 0
      }
    }))
    this.cleanup(press(control, () => {
      this.#pressTarget = 1
      return () => {
        this.#pressTarget = 0
      }
    }))

    const action = this.getAttribute('action')
    if (action) {
      control.addEventListener(
        'click',
        () => {
          this.dispatchEvent(
            new CustomEvent('living-action', { detail: { action }, bubbles: true, composed: true }),
          )
        },
        { signal: abort.signal },
      )
    }

    this.tick((dt, state) => {
      this.#rectAge += dt
      if (!this.#rect || this.#rectAge > 0.125) {
        this.#rect = control.getBoundingClientRect()
        this.#rectAge = 0
      }

      const cx = this.#rect.left + this.#rect.width / 2
      const cy = this.#rect.top + this.#rect.height / 2
      const dx = state.attention.x - cx
      const dy = state.attention.y - cy
      const dist = Math.hypot(dx, dy)

      // Proximity, not hover — the button starts moving before you arrive.
      const grab =
        state.attention.inside && !state.prefs.reducedMotion
          ? clamp(remap(dist, this.reach, 40, 0, 1))
          : 0
      this.#pull.target((dx / this.reach) * grab * 10, (dy / this.reach) * grab * 10)
      this.#pull.step(dt)

      this.#hover = damp(this.#hover, this.#hoverTarget, 0.002, dt)
      this.#press = damp(this.#press, this.#pressTarget, 0.0001, dt)

      const breath = state.prefs.reducedMotion ? 0 : state.breath.value
      const scale = 1 + this.#hover * 0.045 + breath * 0.006 - this.#press * 0.055
      const x = this.#pull.x.value * (1 - this.#press * 0.5)
      const y = this.#pull.y.value * (1 - this.#press * 0.5)

      // One writer for the whole transform, composed from every input.
      control.style.transform =
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`

      glow.style.opacity = (this.#hover * 0.55 + (breath * 0.5 + 0.5) * 0.12).toFixed(3)
    })
  }
}

customElements.define('living-button', LivingButton)
