import { html } from 'lit'
import { toCss } from '@/lib/color'
import { clamp } from '@/lib/math'
import { organism } from '@/organism'
import { Organ } from './base'

const MOOD_COPY: Record<string, string> = {
  alert: 'alert — watching you move',
  awake: 'awake',
  drowsy: 'drowsy — you have been still a while',
  asleep: 'asleep — move to wake it',
}

function duration(seconds: number): string {
  if (seconds < 90) return `${Math.round(seconds)}s`
  const m = seconds / 60
  if (m < 90) return `${Math.round(m)}m`
  const h = m / 60
  if (h < 48) return `${h.toFixed(1)}h`
  return `${Math.round(h / 24)}d`
}

/**
 * The organism's own readout. Everything here is live state, not decoration —
 * if the numbers stop moving, something upstream has actually stopped.
 */
export class VitalsPanel extends Organ {
  #trace: number[] = []
  #canvas: HTMLCanvasElement | null = null
  #ctx: CanvasRenderingContext2D | null = null
  #dpr = 1
  #slow = 0
  #traceAccum = 0

  render() {
    return html`
      <div class="grid gap-6">
        <div>
          <div class="flex items-baseline justify-between gap-4">
            <span class="eyebrow">Respiration</span>
            <span class="tnum text-sm text-foreground" data-rate>—</span>
          </div>
          <canvas
            data-trace
            class="mt-3 block h-20 w-full rounded-md"
            style="background: hsl(var(--muted) / .35)"
            role="img"
            aria-label="A live trace of the page's breathing rhythm"
          ></canvas>
        </div>

        <div class="rule"></div>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          ${this.#row('State', 'mood')} ${this.#row('Arousal', 'excite')}
          ${this.#row('Local time', 'clock')} ${this.#row('Sky', 'weather')}
          ${this.#row('Age', 'age')} ${this.#row('Visits', 'visits')}
          ${this.#row('Organs ticking', 'organs')} ${this.#row('Frame rate', 'fps')}
        </dl>
      </div>
    `
  }

  #row(label: string, key: string) {
    return html`
      <div>
        <dt class="eyebrow">${label}</dt>
        <dd class="tnum mt-1 text-foreground" data-v=${key}>—</dd>
      </div>
    `
  }

  firstUpdated() {
    this.#canvas = this.$<HTMLCanvasElement>('[data-trace]')
    this.#ctx = this.#canvas?.getContext('2d') ?? null

    const resize = () => {
      if (!this.#canvas) return
      const rect = this.#canvas.getBoundingClientRect()
      this.#dpr = Math.min(window.devicePixelRatio || 1, 2)
      this.#canvas.width = Math.max(1, Math.round(rect.width * this.#dpr))
      this.#canvas.height = Math.max(1, Math.round(rect.height * this.#dpr))
    }
    resize()

    const observer = new ResizeObserver(resize)
    if (this.#canvas) observer.observe(this.#canvas)
    this.cleanup(() => observer.disconnect())

    this.tick((dt, state) => {
      // Sample the breath at a fixed 40Hz so the trace's horizontal axis is
      // real time rather than "however many frames this machine managed".
      this.#traceAccum += dt
      while (this.#traceAccum >= 1 / 40) {
        this.#traceAccum -= 1 / 40
        this.#trace.push(state.breath.value)
        if (this.#trace.length > 620) this.#trace.shift()
      }
      this.#draw()

      this.#slow += dt
      if (this.#slow < 0.2) return
      this.#slow = 0
      this.#update()
    })
  }

  #draw() {
    const ctx = this.#ctx
    const canvas = this.#canvas
    if (!ctx || !canvas || this.#trace.length < 2) return

    const w = canvas.width
    const h = canvas.height
    const palette = organism.state.circadian.palette

    ctx.clearRect(0, 0, w, h)

    // Midline
    ctx.strokeStyle = toCss(palette.border, 0.7)
    ctx.lineWidth = this.#dpr
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()

    const step = w / (this.#trace.length - 1)
    ctx.beginPath()
    for (let i = 0; i < this.#trace.length; i++) {
      const y = h / 2 - this.#trace[i]! * (h / 2 - 6 * this.#dpr)
      if (i === 0) ctx.moveTo(0, y)
      else ctx.lineTo(i * step, y)
    }
    ctx.strokeStyle = toCss(palette.primary)
    ctx.lineWidth = 2 * this.#dpr
    ctx.lineJoin = 'round'
    ctx.stroke()

    // The leading edge, so it is obvious which end is now.
    const lastY = h / 2 - this.#trace[this.#trace.length - 1]! * (h / 2 - 6 * this.#dpr)
    ctx.beginPath()
    ctx.arc(w - 2 * this.#dpr, lastY, 3.2 * this.#dpr, 0, Math.PI * 2)
    ctx.fillStyle = toCss(palette.glow)
    ctx.fill()
  }

  #update() {
    const s = organism.state
    const set = (key: string, value: string) => {
      const el = this.$(`[data-v="${key}"]`)
      if (el && el.textContent !== value) el.textContent = value
    }

    const rate = this.$('[data-rate]')
    if (rate) rate.textContent = `${s.breath.rate.toFixed(1)} / min · ${s.breath.count} breaths`

    set('mood', MOOD_COPY[s.attention.mood] ?? s.attention.mood)
    set('excite', `${Math.round(clamp(s.attention.excitement) * 100)}%`)
    set(
      'clock',
      new Date(s.time.now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    )
    set('weather', `${s.weather.current} · ${Math.round(s.weather.temperature)}°C`)
    set('age', duration(s.vitals.age))
    set('visits', `${s.vitals.visits}`)
    set('organs', `${s.vitals.organs}`)
    set('fps', `${Math.round(s.vitals.fps)}`)
  }
}

customElements.define('vitals-panel', VitalsPanel)
