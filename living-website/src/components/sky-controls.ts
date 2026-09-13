import { html } from 'lit'
import { animate } from 'motion'
import { organism, WEATHER } from '@/organism'
import type { WeatherId } from '@/organism/state'
import { Organ } from './base'

const ORDER: WeatherId[] = [
  'clear', 'fair', 'cloudy', 'overcast', 'mist', 'drizzle', 'rain', 'storm', 'snow', 'aurora',
]

const fmtHour = (h: number) => {
  const hh = Math.floor(h) % 24
  const mm = Math.floor((h - Math.floor(h)) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/**
 * Direct control over the two systems that otherwise run on their own clock.
 *
 * The weather drifts on its own every couple of minutes and the sun tracks
 * real local time, which is the honest behaviour — but nobody is going to sit
 * through a night to find out what the page looks like at 3am. These controls
 * exist so the slow systems are inspectable without waiting for them.
 */
export class SkyControls extends Organ {
  #dragging = false
  #slow = 0

  render() {
    return html`
      <div class="grid gap-7">
        <div>
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span class="eyebrow">Weather</span>
            <span class="tnum text-[11px] text-muted-foreground" data-next></span>
          </div>

          <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a weather system">
            ${ORDER.map(
              (id) => html`
                <button
                  type="button"
                  data-weather=${id}
                  aria-pressed="false"
                  class="rounded-full border border-border/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground aria-pressed:border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  ${WEATHER[id].label}
                </button>
              `,
            )}
          </div>

          <p class="mt-3 text-sm text-muted-foreground" data-blurb></p>

          <label class="mt-4 flex w-fit cursor-pointer items-center gap-2.5 text-xs text-muted-foreground">
            <input type="checkbox" data-lock class="h-4 w-4 accent-[hsl(var(--primary))]" />
            Hold this system instead of letting it drift
          </label>
        </div>

        <div class="rule"></div>

        <div>
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span class="eyebrow">Sun</span>
            <span class="tnum text-[11px] text-muted-foreground" data-suntimes></span>
          </div>

          <label class="mt-3 block">
            <span class="sr-only">Hour of day</span>
            <input
              type="range"
              data-scrub
              min="0"
              max="23.99"
              step="0.05"
              value="12"
              class="w-full accent-[hsl(var(--primary))]"
            />
          </label>

          <div class="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p class="tnum text-sm text-foreground" data-clock>—</p>
            <button
              type="button"
              data-follow
              class="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Follow my clock
            </button>
          </div>
        </div>
      </div>
    `
  }

  firstUpdated() {
    const scrub = this.$<HTMLInputElement>('[data-scrub]')
    const lock = this.$<HTMLInputElement>('[data-lock]')

    // One controller for every listener this panel owns, including the one on
    // window — without it the pointerup handler outlives the element.
    const abort = new AbortController()
    const signal = abort.signal
    this.cleanup(() => abort.abort())

    for (const button of this.querySelectorAll<HTMLButtonElement>('[data-weather]')) {
      button.addEventListener('click', () => organism.set(button.dataset.weather as WeatherId), {
        signal,
      })
    }

    scrub?.addEventListener('pointerdown', () => (this.#dragging = true), { signal })
    window.addEventListener('pointerup', () => (this.#dragging = false), { signal, passive: true })
    scrub?.addEventListener('input', () => organism.scrub(Number(scrub.value)), { signal })

    this.$('[data-follow]')?.addEventListener('click', () => organism.scrub(null), { signal })
    lock?.addEventListener('change', () => organism.lockWeather(lock.checked), { signal })

    // A weather change is a discrete event, so Motion drives the transition.
    this.listen('weather', () => {
      const blurb = this.$('[data-blurb]')
      if (blurb) void animate(blurb, { opacity: [0, 1], y: [5, 0] }, { duration: 0.4 })
    })

    this.tick((dt, state) => {
      this.#slow += dt
      if (this.#slow < 0.1) return
      this.#slow = 0

      const { weather, circadian, time } = state

      for (const button of this.querySelectorAll<HTMLButtonElement>('[data-weather]')) {
        button.setAttribute('aria-pressed', String(button.dataset.weather === weather.current))
      }

      const blurb = this.$('[data-blurb]')
      if (blurb) {
        const text = `${WEATHER[weather.current].blurb} ${Math.round(weather.temperature)}°C, ${weather.season}.`
        if (blurb.textContent !== text) blurb.textContent = text
      }

      const next = this.$('[data-next]')
      if (next) {
        next.textContent = organism.weatherLocked
          ? 'held'
          : `drifts in ${Math.max(0, Math.round(weather.dwell - weather.since))}s`
      }

      const clock = this.$('[data-clock]')
      if (clock) {
        clock.textContent =
          `${fmtHour(circadian.hour)} · ${circadian.phase}` +
          (time.scrub === null ? ' · following your clock' : ' · held')
      }

      const suntimes = this.$('[data-suntimes]')
      if (suntimes) {
        suntimes.textContent = `rise ${fmtHour(circadian.sunrise)} · set ${fmtHour(circadian.sunset)}`
      }

      if (scrub && !this.#dragging) scrub.value = String(circadian.hour)
    })
  }
}

customElements.define('sky-controls', SkyControls)
