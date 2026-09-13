import { html } from 'lit'
import { clamp, damp, Spring2 } from '@/lib/math'
import { Organ } from './base'

/**
 * A warm patch of light the page holds around your cursor, plus a ring that
 * marks exactly where you are. The blob lags behind on a soft spring and the
 * ring does not — the gap between them is what reads as attention rather than
 * as a decoration stuck to the pointer.
 */
export class CursorAura extends Organ {
  protected override alwaysTick = true

  #blob = new Spring2(0, 0, 42, 12)
  #ring = new Spring2(0, 0, 420, 30)
  #alpha = 0
  #pressed = 0

  render() {
    return html`
      <div class="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
        <div
          data-blob
          class="absolute h-[34rem] w-[34rem] rounded-full"
          style="background: radial-gradient(circle, hsl(var(--glow) / .2), transparent 65%); filter: blur(28px); opacity: 0; will-change: transform"
        ></div>
        <div
          data-ring
          class="absolute h-9 w-9 rounded-full border"
          style="border-color: hsl(var(--foreground) / .32); opacity: 0; will-change: transform"
        ></div>
      </div>
    `
  }

  firstUpdated() {
    const blob = this.$('[data-blob]')
    const ring = this.$('[data-ring]')
    if (!blob || !ring) return

    // On a touch screen there is no hovering cursor to follow, and a blob
    // that teleports on each tap is worse than no blob.
    if (!window.matchMedia('(pointer: fine)').matches) {
      this.style.display = 'none'
      return
    }

    const onDown = () => {
      this.#pressed = 1
    }
    const onUp = () => {
      this.#pressed = 0
    }
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    this.cleanup(() => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    })

    this.#blob.set(window.innerWidth / 2, window.innerHeight / 2)
    this.#ring.set(window.innerWidth / 2, window.innerHeight / 2)

    this.tick((dt, state) => {
      const { attention, breath, prefs } = state

      this.#blob.target(attention.x, attention.y)
      this.#ring.target(attention.x, attention.y)
      this.#blob.step(dt)
      this.#ring.step(dt)

      const wanted =
        attention.inside && attention.mood !== 'asleep' ? (prefs.reducedMotion ? 0.5 : 1) : 0
      this.#alpha = damp(this.#alpha, wanted, 0.08, dt)

      const pulse = 1 + breath.value * 0.06
      blob.style.transform = `translate3d(${(this.#blob.x.value - 272).toFixed(1)}px, ${(
        this.#blob.y.value - 272
      ).toFixed(1)}px, 0) scale(${pulse.toFixed(3)})`
      blob.style.opacity = (this.#alpha * clamp(0.35 + attention.excitement * 0.9)).toFixed(3)

      const ringScale = 1 - this.#pressed * 0.34 + attention.excitement * 0.18
      ring.style.transform = `translate3d(${(this.#ring.x.value - 18).toFixed(1)}px, ${(
        this.#ring.y.value - 18
      ).toFixed(1)}px, 0) scale(${ringScale.toFixed(3)})`
      ring.style.opacity = (this.#alpha * 0.55).toFixed(3)
    })
  }
}

customElements.define('cursor-aura', CursorAura)
