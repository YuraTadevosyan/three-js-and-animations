import { toCss } from '@/lib/color'
import { clamp, TAU } from '@/lib/math'
import { paletteAt, solarDay, solarPosition } from './circadian'
import type { Palette } from './state'
import { hourNow, organism } from './index'
import { WEATHER } from './weather'

const SIZE = 64
const INTERVAL = 2000

/**
 * Keeps the browser tab alive: a favicon redrawn from the live sky, and a
 * title that reports what the page is doing while you are looking elsewhere.
 *
 * This deliberately does NOT run on the heartbeat. The heartbeat cancels its
 * rAF when the document is hidden — which is correct, there is nothing to
 * draw — but a frozen favicon is exactly the opposite of the point. So the sun
 * and palette are recomputed here from the clock on a plain interval, which
 * browsers still fire (throttled to about a second) in a background tab.
 */
export class Presence {
  #canvas: HTMLCanvasElement | null = null
  #ctx: CanvasRenderingContext2D | null = null
  #link: HTMLLinkElement | null = null
  #timer = 0
  #baseTitle = ''
  #hiddenSince = 0

  start() {
    this.#baseTitle = document.title || 'Living Website'

    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    this.#canvas = canvas
    this.#ctx = ctx

    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    document.head.appendChild(link)
    // Drop the static SVG icon only once the dynamic one exists, so a failure
    // above leaves the original in place rather than no icon at all.
    for (const old of document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')) {
      if (old !== link) old.remove()
    }
    this.#link = link

    document.addEventListener('visibilitychange', () => {
      this.#hiddenSince = document.hidden ? Date.now() : 0
      this.#update()
    })

    this.#update()
    this.#timer = window.setInterval(() => this.#update(), INTERVAL)
  }

  stop() {
    window.clearInterval(this.#timer)
  }

  /** The sky as it is right now, independent of whether the heartbeat is running. */
  #sky() {
    const date = new Date()
    const hour = organism.state.time.scrub ?? hourNow(date)
    const { sunrise, sunset } = solarDay(date)
    return { ...solarPosition(hour, sunrise, sunset), ...paletteAt(hour) }
  }

  #update() {
    const sky = this.#sky()
    this.#draw(sky)
    this.#title(sky.daylight)
  }

  #draw(sky: { palette: Palette; sunX: number; sunY: number; daylight: number }) {
    const ctx = this.#ctx
    const canvas = this.#canvas
    const link = this.#link
    if (!ctx || !canvas || !link) return

    const p = sky.palette
    const s = organism.state
    const asleep = this.#asleep()

    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.save()

    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') ctx.roundRect(0, 0, SIZE, SIZE, 15)
    else ctx.rect(0, 0, SIZE, SIZE)
    ctx.clip()

    const grad = ctx.createLinearGradient(0, 0, 0, SIZE)
    grad.addColorStop(0, toCss(p.skyTop))
    grad.addColorStop(0.55, toCss(p.skyMid))
    grad.addColorStop(1, toCss(p.skyBottom))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, SIZE, SIZE)

    // Sun or moon, at its real position in the arc.
    const sx = sky.sunX * SIZE
    const sy = sky.sunY * SIZE
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 20)
    halo.addColorStop(0, toCss(p.sun, 0.8))
    halo.addColorStop(1, toCss(p.sun, 0))
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = toCss(p.sun)
    ctx.beginPath()
    ctx.arc(sx, sy, 5, 0, TAU)
    ctx.fill()

    const wx = s.weather.params
    if (wx.precip > 0.14) {
      ctx.strokeStyle = toCss(p.sun, 0.42)
      ctx.lineWidth = 1.6
      ctx.lineCap = 'round'
      for (let i = 0; i < 6; i++) {
        const x = 6 + i * 10
        const y = 6 + ((i * 13) % 20)
        ctx.beginPath()
        ctx.moveTo(x, y)
        // Rain slants, snow falls straight.
        ctx.lineTo(x + (1 - wx.snowiness) * 3, y + 9)
        ctx.stroke()
      }
    }

    // The eye. At 16 pixels this is the only part anyone actually resolves,
    // so it gets most of the frame.
    const cx = SIZE / 2
    const cy = 39
    const rx = 21
    const ry = 12

    ctx.beginPath()
    ctx.moveTo(cx - rx, cy)
    ctx.quadraticCurveTo(cx, cy - ry * 1.9, cx + rx, cy)
    ctx.quadraticCurveTo(cx, cy + ry * 1.9, cx - rx, cy)
    ctx.closePath()
    ctx.fillStyle = toCss(p.card, 0.96)
    ctx.fill()

    ctx.save()
    ctx.clip()

    const gaze = clamp(s.attention.nx, -1, 1) * 5
    ctx.fillStyle = toCss(p.canopy)
    ctx.beginPath()
    ctx.arc(cx + gaze, cy, 8.5, 0, TAU)
    ctx.fill()

    const dilate = 0.85 + (1 - sky.daylight) * 0.5
    ctx.fillStyle = toCss(p.foreground)
    ctx.beginPath()
    ctx.arc(cx + gaze, cy, 4.2 * dilate, 0, TAU)
    ctx.fill()

    ctx.fillStyle = toCss(p.card, 0.9)
    ctx.beginPath()
    ctx.arc(cx + gaze - 2.6, cy - 3, 2, 0, TAU)
    ctx.fill()

    const close = asleep ? 1 : s.attention.mood === 'drowsy' ? 0.45 : 0
    if (close > 0) {
      ctx.fillStyle = toCss(p.muted)
      ctx.fillRect(0, cy - ry * 2, SIZE, ry * 4 * close)
    }
    ctx.restore()

    ctx.strokeStyle = toCss(p.border, 0.8)
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(cx - rx, cy)
    ctx.quadraticCurveTo(cx, cy - ry * 1.9, cx + rx, cy)
    ctx.quadraticCurveTo(cx, cy + ry * 1.9, cx - rx, cy)
    ctx.stroke()

    ctx.restore()

    try {
      link.href = canvas.toDataURL('image/png')
    } catch {
      // A tainted canvas can't happen here — nothing external is drawn — but
      // a failed encode must not take the interval down with it.
    }
  }

  /** Hidden for long enough that nobody is watching counts as asleep. */
  #asleep(): boolean {
    if (organism.state.attention.mood === 'asleep') return true
    return this.#hiddenSince > 0 && Date.now() - this.#hiddenSince > 30_000
  }

  #title(daylight: number) {
    // While you are looking at the page, the title stays put. Reporting state
    // into a tab you can already see is noise; reporting it into one you
    // can't is the whole feature.
    if (!document.hidden) {
      if (document.title !== this.#baseTitle) document.title = this.#baseTitle
      return
    }

    const s = organism.state
    const wx = s.weather.params
    const state = this.#asleep()
      ? 'asleep'
      : wx.precip > 0.2
        ? wx.snowiness > 0.5
          ? 'snowing'
          : 'raining'
        : daylight < 0.1
          ? 'after dark'
          : WEATHER[s.weather.current].label.toLowerCase()

    const next = `${this.#baseTitle} · ${state}`
    if (document.title !== next) document.title = next
  }
}

export const presence = new Presence()
