import { html } from 'lit'
import { organism } from '@/organism'
import { Organ } from './base'

/**
 * The control for the organism's voice.
 *
 * Audio is opt-in and starts silent — browsers require a user gesture before
 * anything can play, so this button is both the consent and the gesture. The
 * readout beneath it names what is actually audible right now, because half
 * the layers only exist under conditions you might not currently have.
 */
export class VoiceToggle extends Organ {
  static properties = {
    compact: { type: Boolean },
  }

  declare compact: boolean

  #slow = 0

  constructor() {
    super()
    this.compact = false
  }

  render() {
    return html`
      <div class=${this.compact ? 'inline-flex' : 'grid gap-2'}>
        <button
          data-toggle
          type="button"
          aria-pressed="false"
          class="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur transition-colors hover:border-accent hover:text-foreground aria-pressed:border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4z"></path>
            <path data-waves d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"></path>
            <path data-muted d="M17 9.5l5 5M22 9.5l-5 5" style="display: none"></path>
          </svg>
          <span data-label>Give it a voice</span>
        </button>
        ${this.compact
          ? null
          : html`<p class="text-sm text-muted-foreground" data-readout>
              Wind, rain and thunder are synthesized from the weather; crickets
              chirp at a rate set by the temperature; birds arrive at sunrise.
              Nothing is a recording.
            </p>`}
      </div>
    `
  }

  firstUpdated() {
    const button = this.$<HTMLButtonElement>('[data-toggle]')
    const label = this.$('[data-label]')
    const waves = this.$<SVGPathElement>('[data-waves]')
    const muted = this.$<SVGPathElement>('[data-muted]')
    if (!button) return

    const paint = (on: boolean) => {
      button.setAttribute('aria-pressed', String(on))
      if (label) label.textContent = on ? 'Listening' : 'Give it a voice'
      if (waves) waves.style.display = on ? '' : 'none'
      if (muted) muted.style.display = on ? 'none' : ''
    }

    button.addEventListener('click', () => {
      void organism.voice.toggle()
    })

    this.listen('voice', ({ enabled }) => paint(enabled))
    paint(organism.voice.enabled)

    if (this.compact) return

    this.tick((dt, state) => {
      this.#slow += dt
      if (this.#slow < 0.5) return
      this.#slow = 0

      const readout = this.$('[data-readout]')
      if (!readout || !organism.voice.enabled) return

      const parts = organism.voice.audible(state)
      const list =
        parts.length > 1
          ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
          : parts[0]
      const text = `Right now you can hear ${list}.`
      if (readout.textContent !== text) readout.textContent = text
    })
  }
}

customElements.define('voice-toggle', VoiceToggle)
