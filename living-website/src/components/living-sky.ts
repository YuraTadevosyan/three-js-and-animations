import { html } from 'lit'
import { SkyStage } from '@/gl/stage'
import { damp } from '@/lib/math'
import { Organ, organism } from './base'

/**
 * The fixed backdrop: a WebGL sky behind everything, plus the veil that
 * dims the whole page as the site gets drowsy.
 */
export class LivingSky extends Organ {
  protected override alwaysTick = true

  #stage: SkyStage | null = null
  #veilAlpha = 0

  render() {
    return html`
      <div
        class="pointer-events-none fixed inset-0 -z-10 overflow-hidden grain"
        data-host
        aria-hidden="true"
      >
        <!--
          The CSS gradient is not a placeholder that gets replaced — it stays
          underneath the canvas for the whole session. If WebGL is blocked,
          out of contexts, or the GPU process dies mid-visit, the sky simply
          stops moving instead of turning into a white rectangle.
        -->
        <div
          class="absolute inset-0"
          style="background: linear-gradient(to bottom, hsl(var(--sky-top)) 0%, hsl(var(--sky-mid)) 52%, hsl(var(--sky-bottom)) 100%)"
        ></div>
        <div data-veil class="absolute inset-0" style="background: hsl(var(--soil)); opacity: 0"></div>
      </div>
    `
  }

  firstUpdated() {
    const host = this.$('[data-host]')
    const veil = this.$('[data-veil]')
    if (!host) return

    void SkyStage.create(host, organism.state.prefs.reducedMotion).then((stage) => {
      // The element can be torn down while init is still in flight.
      if (!this.isConnected) {
        stage?.destroy()
        return
      }
      this.#stage = stage
      // The canvas must sit above the CSS gradient but below the veil.
      if (stage && veil) host.insertBefore(stage.app.canvas, veil)
    })

    this.cleanup(() => {
      this.#stage?.destroy()
      this.#stage = null
    })

    this.tick((dt, state) => {
      if (this.#stage) {
        try {
          this.#stage.update(dt, state)
        } catch (err) {
          // A shader that fails to link, or a lost GPU context, throws on
          // render. Log it once and drop back to the CSS gradient rather than
          // logging sixty times a second for the rest of the session.
          console.warn('[sky] render failed, falling back to CSS', err)
          this.#stage.destroy()
          this.#stage = null
        }
      }

      if (!veil) return
      const mood = state.attention.mood
      const target = mood === 'asleep' ? 0.22 : mood === 'drowsy' ? 0.09 : 0
      this.#veilAlpha = damp(this.#veilAlpha, target, 0.25, dt)
      veil.style.opacity = this.#veilAlpha.toFixed(3)
    })
  }
}

customElements.define('living-sky', LivingSky)
