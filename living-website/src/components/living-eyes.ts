import { html } from 'lit'
import { clamp, damp, remap, Spring2 } from '@/lib/math'
import { makeRng } from '@/lib/rng'
import { Organ } from './base'

let uid = 0

const VIEW_W = 100
const VIEW_H = 56
/** How far the iris can travel from the centre of its eye, in viewBox units. */
const REACH = 7.2

/**
 * A pair of eyes that track the cursor.
 *
 * The tracking itself is the easy part. What makes them read as alive is
 * everything around it: pupils dilate in the dark and when you move fast,
 * the eyes blink on their own schedule, they saccade to a random point when
 * you stop moving, they search for you when the cursor leaves the window,
 * and the lids sag as the page gets drowsy.
 */
export class LivingEyes extends Organ {
  static properties = {
    size: { type: Number },
    label: { type: String },
  }

  declare size: number
  declare label: string

  #id = `eyes${uid++}`
  #rng = makeRng((Date.now() ^ (uid * 2654435761)) >>> 0)

  #gaze = new Spring2(0, 0, 90, 15)
  #blink = 0
  #nextBlink = 0
  #lidClose = 0
  #pupilScale = 1
  #idleTarget = { x: 0, y: 0 }
  #nextSaccade = 0
  #rect: DOMRect | null = null
  #rectAge = 0

  constructor() {
    super()
    this.size = 64
    this.label = ''
  }

  render() {
    const eye = (side: 'l' | 'r', cx: number) => html`
      <g clip-path="url(#${this.#id}-${side})">
        <ellipse cx=${cx} cy="28" rx="21" ry="17" style="fill: hsl(var(--card))"></ellipse>
        <g data-iris=${side}>
          <circle r="8.6" style="fill: hsl(var(--primary))"></circle>
          <circle r="8.6" style="fill: hsl(var(--foreground)); opacity: .12"></circle>
          <circle data-pupil=${side} r="4.1" style="fill: hsl(var(--foreground))"></circle>
          <circle cx="-2.7" cy="-3.1" r="1.9" style="fill: hsl(var(--card)); opacity: .9"></circle>
          <circle cx="2.4" cy="3.4" r="1" style="fill: hsl(var(--card)); opacity: .5"></circle>
        </g>
        <rect data-lid=${side} x="0" y="-46" width="100" height="46" style="fill: hsl(var(--muted))"></rect>
      </g>
      <ellipse
        cx=${cx}
        cy="28"
        rx="21"
        ry="17"
        fill="none"
        style="stroke: hsl(var(--border)); stroke-width: 1.6"
      ></ellipse>
    `

    return html`
      <svg
        viewBox="0 0 ${VIEW_W} ${VIEW_H}"
        width=${this.size}
        height=${(this.size * VIEW_H) / VIEW_W}
        role=${this.label ? 'img' : 'presentation'}
        aria-label=${this.label || 'decorative eyes'}
        aria-hidden=${this.label ? 'false' : 'true'}
        style="overflow: visible; display: block"
      >
        <defs>
          <clipPath id="${this.#id}-l"><ellipse cx="27" cy="28" rx="21" ry="17"></ellipse></clipPath>
          <clipPath id="${this.#id}-r"><ellipse cx="73" cy="28" rx="21" ry="17"></ellipse></clipPath>
        </defs>
        ${eye('l', 27)} ${eye('r', 73)}
      </svg>
    `
  }

  firstUpdated() {
    const irisL = this.$<SVGGElement>('[data-iris="l"]')
    const irisR = this.$<SVGGElement>('[data-iris="r"]')
    const lidL = this.$<SVGRectElement>('[data-lid="l"]')
    const lidR = this.$<SVGRectElement>('[data-lid="r"]')
    const pupilL = this.$<SVGCircleElement>('[data-pupil="l"]')
    const pupilR = this.$<SVGCircleElement>('[data-pupil="r"]')
    if (!irisL || !irisR || !lidL || !lidR) return

    this.#nextBlink = this.#rng.range(1.5, 5)

    // A click anywhere is startling enough to blink at.
    const onPointerDown = () => {
      if (this.#blink <= 0) this.#blink = 0.16
    }
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    this.cleanup(() => window.removeEventListener('pointerdown', onPointerDown))

    this.tick((dt, state) => {
      const { attention, circadian, prefs } = state

      // getBoundingClientRect forces layout, so it is sampled at 8Hz rather
      // than every frame — the eyes cannot perceptibly lag their own element.
      this.#rectAge += dt
      if (!this.#rect || this.#rectAge > 0.125) {
        this.#rect = this.getBoundingClientRect()
        this.#rectAge = 0
      }

      const cx = this.#rect.left + this.#rect.width / 2
      const cy = this.#rect.top + this.#rect.height / 2

      if (attention.inside && attention.mood !== 'asleep') {
        const dx = attention.x - cx
        const dy = attention.y - cy
        const dist = Math.hypot(dx, dy) || 1
        // Normalising by distance rather than clamping components keeps the
        // gaze pointing *at* the cursor instead of at the corner of a box.
        const strength = clamp(remap(dist, 40, 520, 0.35, 1))
        this.#gaze.target((dx / dist) * strength, (dy / dist) * strength)
        this.#nextSaccade = 0
      } else {
        // Nobody's there. Look around for them.
        this.#nextSaccade -= dt
        if (this.#nextSaccade <= 0) {
          this.#nextSaccade = this.#rng.range(1.8, 5)
          this.#idleTarget = {
            x: this.#rng.range(-0.8, 0.8),
            y: this.#rng.range(-0.5, 0.55),
          }
        }
        this.#gaze.target(this.#idleTarget.x, this.#idleTarget.y)
      }

      this.#gaze.step(dt)

      const gx = this.#gaze.x.value * REACH
      const gy = this.#gaze.y.value * REACH * 0.72
      irisL.setAttribute('transform', `translate(${(27 + gx).toFixed(2)} ${(28 + gy).toFixed(2)})`)
      irisR.setAttribute('transform', `translate(${(73 + gx).toFixed(2)} ${(28 + gy).toFixed(2)})`)

      // --- lids ---------------------------------------------------------
      this.#blink -= dt
      if (this.#blink <= 0) {
        this.#nextBlink -= dt
        if (this.#nextBlink <= 0) {
          this.#blink = 0.15
          // Blinks cluster: after one, another often follows soon.
          this.#nextBlink = this.#rng.chance(0.25)
            ? this.#rng.range(0.3, 0.9)
            : this.#rng.range(2.4, 7)
        }
      }

      const blinking = this.#blink > 0 ? Math.sin((this.#blink / 0.15) * Math.PI) : 0
      const resting =
        attention.mood === 'asleep' ? 0.88 : attention.mood === 'drowsy' ? 0.42 : 0.06
      const close = Math.max(prefs.reducedMotion ? resting : blinking, resting)
      this.#lidClose = damp(this.#lidClose, close, 0.0008, dt)

      const lidY = (-46 + this.#lidClose * 46).toFixed(2)
      lidL.setAttribute('y', lidY)
      lidR.setAttribute('y', lidY)

      // --- pupils -------------------------------------------------------
      // Dilated in the dark and when you're moving fast, contracted in
      // bright daylight. Same reflex a real eye has.
      const target =
        0.82 + (1 - circadian.daylight) * 0.55 + attention.excitement * 0.3
      this.#pupilScale = damp(this.#pupilScale, target, 0.3, dt)
      const r = (4.1 * this.#pupilScale).toFixed(2)
      pupilL?.setAttribute('r', r)
      pupilR?.setAttribute('r', r)
    })
  }
}

customElements.define('living-eyes', LivingEyes)
