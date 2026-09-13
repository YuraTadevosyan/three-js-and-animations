import { html } from 'lit'
import { WEATHER } from '@/organism'
import { Organ } from './base'

const MOOD_SHORT: Record<string, string> = {
  alert: 'alert',
  awake: 'awake',
  drowsy: 'drowsy',
  asleep: 'asleep',
}

/**
 * The sign of life at the top of the page: a dot on the breath, and the three
 * pieces of state that change on their own — mood, sky, and the hour it thinks
 * it is.
 */
export class PulseBadge extends Organ {
  #slow = 0

  render() {
    return html`
      <span
        class="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur"
      >
        <span
          data-dot
          class="h-2 w-2 shrink-0 rounded-full"
          style="background: hsl(var(--primary)); will-change: transform"
        ></span>
        <span class="tnum" data-text>waking up…</span>
      </span>
    `
  }

  firstUpdated() {
    const dot = this.$('[data-dot]')
    const text = this.$('[data-text]')

    this.tick((dt, state) => {
      if (dot) {
        const scale = 1 + (state.prefs.reducedMotion ? 0 : (state.breath.value * 0.5 + 0.5) * 0.7)
        dot.style.transform = `scale(${scale.toFixed(3)})`
      }

      this.#slow += dt
      if (this.#slow < 0.25 || !text) return
      this.#slow = 0

      const hour = state.circadian.hour
      const hh = String(Math.floor(hour) % 24).padStart(2, '0')
      const mm = String(Math.floor((hour % 1) * 60)).padStart(2, '0')

      const next =
        `${MOOD_SHORT[state.attention.mood]} · ` +
        `${WEATHER[state.weather.current].label.toLowerCase()} · ` +
        `${hh}:${mm} ${state.circadian.phase}`
      if (text.textContent !== next) text.textContent = next
    })
  }
}

customElements.define('pulse-badge', PulseBadge)
