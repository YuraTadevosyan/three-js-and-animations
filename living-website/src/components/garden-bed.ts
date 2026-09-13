import { html, svg, type TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { animate } from 'motion'
import { toCss } from '@/lib/color'
import type { Skeleton } from '@/lib/lsystem'
import { clamp, lerp } from '@/lib/math'
import { makeRng } from '@/lib/rng'
import { LIFESPAN, MAX_PLANTS, organism, revealOf, stageOf, witherOf } from '@/organism'
import type { Plant, Species } from '@/organism/state'
import { Organ } from './base'
import './living-button'

const VIEW_W = 1000
const VIEW_H = 340
const SOIL_Y = 288

/** Target on-screen height per species, before per-plant variation. */
const TARGET_HEIGHT: Record<Species, number> = {
  fern: 150,
  vine: 168,
  bloom: 186,
  reed: 204,
  succulent: 96,
}

const STAGE_COPY: Record<string, string> = {
  seed: 'just planted',
  sprout: 'sprouting',
  juvenile: 'putting out leaves',
  mature: 'fully grown',
  flowering: 'in flower',
  seeding: 'going to seed',
  fading: 'fading back into the soil',
}

interface PathRef {
  el: SVGPathElement
  length: number
  t0: number
  t1: number
  kind: string
  /** Set once the branch is fully drawn, so its dashoffset stops being written. */
  done: boolean
  shown: boolean
}

interface PlantRefs {
  /** The live plant object from state — not a copy, and not looked up by id. */
  plant: Plant
  group: SVGGElement
  sway: SVGGElement
  paths: PathRef[]
  ornaments: { el: SVGGElement; t0: number; open: number }[]
  skeleton: Skeleton
  phase: number
  /** Pre-computed scale that maps this skeleton's local units into the viewBox. */
  unit: number
  /** Last colours written, so unchanged strokes are skipped entirely. */
  lastStem: string
  lastLeaf: string
}

/**
 * A bed of plants grown from stored seeds.
 *
 * The geometry is built once when a plant appears and never rebuilt. Growth is
 * a stroke-dashoffset sweep across branches whose [t0, t1] window the plant's
 * age has reached, so a fully grown bed costs the same per frame as an empty
 * one. Only the sway transform runs at frame rate; growth, colour and staging
 * update at 10Hz, which is far finer than anything you can perceive in a plant.
 */
export class GardenBed extends Organ {
  #refs: PlantRefs[] = []
  #abort: AbortController | null = null
  #fireflies: SVGCircleElement[] = []
  #slow = 0
  #hovered: string | null = null

  connectedCallback(): void {
    super.connectedCallback()
    // The bed's markup is keyed on plant identity, so a re-render is only
    // needed when the population changes — not when anything grows.
    this.listen('planted', () => this.requestUpdate())
    this.listen('died', () => this.requestUpdate())
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#abort?.abort()
  }

  render() {
    const plants = organism.state.garden.plants

    return html`
      <figure class="m-0">
        <div class="relative overflow-hidden rounded-[var(--radius)] border border-border/70">
          <svg
            viewBox="0 0 ${VIEW_W} ${VIEW_H}"
            class="block w-full"
            role="img"
            aria-label="A garden bed of ${plants.length} procedurally grown plants"
            style="background: linear-gradient(to bottom, hsl(var(--card) / .25), hsl(var(--soil) / .35))"
          >
            <g data-flies></g>
            ${repeat(plants, (p) => p.id, (p) => this.#plantTemplate(p))}
            <path
              d="M0 ${SOIL_Y} Q 250 ${SOIL_Y - 8} 500 ${SOIL_Y} T 1000 ${SOIL_Y} L1000 ${VIEW_H} L0 ${VIEW_H} Z"
              style="fill: hsl(var(--soil))"
            ></path>
            <path
              d="M0 ${SOIL_Y} Q 250 ${SOIL_Y - 8} 500 ${SOIL_Y} T 1000 ${SOIL_Y}"
              fill="none"
              style="stroke: hsl(var(--canopy) / .55); stroke-width: 3"
            ></path>
          </svg>

          <figcaption
            data-caption
            class="tnum absolute bottom-2 left-3 text-[11px] text-muted-foreground"
          ></figcaption>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <living-button action="plant">
            <button class="btn btn-primary" type="button"><span>Plant a seed</span></button>
          </living-button>
          <living-button action="water">
            <button class="btn btn-ghost" type="button"><span>Water the bed</span></button>
          </living-button>
          <button
            data-reset
            type="button"
            class="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Start the garden over
          </button>
        </div>

        <dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          ${this.#stat('Living', 'count')} ${this.#stat('Generations', 'gens')}
          ${this.#stat('Soil moisture', 'wet')} ${this.#stat('Fertility', 'fert')}
        </dl>
      </figure>
    `
  }

  #stat(label: string, key: string) {
    return html`
      <div>
        <dt class="eyebrow">${label}</dt>
        <dd class="tnum mt-1 text-base text-foreground" data-stat=${key}>—</dd>
      </div>
    `
  }

  #plantTemplate(plant: Plant): TemplateResult {
    const sk = organism.garden.skeleton(plant.seed)

    const paths = sk.branches.map(
      (b) => svg`<path
        data-t0=${b.t0}
        data-t1=${b.t1}
        data-kind=${b.kind}
        d=${toPath(b.pts)}
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width=${b.width}
      ></path>`,
    )

    const ornaments = sk.ornaments.map((o) => {
      const body =
        o.kind === 'flower'
          ? svg`<g>
              <circle r=${o.r} style="fill: hsl(var(--primary))"></circle>
              <circle r=${o.r * 0.42} style="fill: hsl(var(--glow))"></circle>
            </g>`
          : svg`<circle r=${o.r} style="fill: hsl(var(--soil))" opacity="0.85"></circle>`

      return svg`<g
        data-ornament
        data-t0=${o.t0}
        transform=${`translate(${o.x.toFixed(2)} ${(-o.y).toFixed(2)})`}
      >${body}</g>`
    })

    return svg`<g data-plant=${plant.id} class="cursor-pointer">
      <g data-sway>${paths}${ornaments}</g>
    </g>`
  }

  firstUpdated() {
    this.#buildFireflies()
    // No #collect() here — updated() runs immediately after firstUpdated() on
    // the same cycle and does it, and doing both would bind everything twice.

    this.$<HTMLButtonElement>('[data-reset]')?.addEventListener('click', () => {
      organism.reset()
      this.requestUpdate()
      this.#flashCaption('Cleared. Three seedlings, and a clock starting from now.')
    })

    const onAction = (event: Event) => {
      const detail = (event as CustomEvent<{ action: string }>).detail
      if (detail?.action === 'plant') {
        const ok = organism.plantSeed()
        if (!ok) this.#flashCaption('The bed is full — something has to go to seed first.')
      } else if (detail?.action === 'water') {
        organism.water()
        this.#flashCaption('Watered. Everything perks up for a while.')
      }
    }
    this.addEventListener('living-action', onAction)
    this.cleanup(() => this.removeEventListener('living-action', onAction))

    this.listen('planted', ({ bySeed }) => {
      this.#flashCaption(
        bySeed ? 'A seed took. The garden is on its own now.' : 'Planted. Give it a few minutes.',
      )
    })
    this.listen('died', () => this.#flashCaption('One went back to the soil. It fed the rest.'))

    this.tick((dt, state) => {
      this.#tickSway(state.time.elapsed, state.weather.wind, state.breath.value)

      this.#slow += dt
      if (this.#slow < 0.1) return
      this.#slow = 0
      this.#tickGrowth()
      this.#tickFireflies(state.time.elapsed, state.circadian.daylight)
      this.#tickStats()
    })
  }

  updated() {
    // A new plant means new DOM; re-cache the refs and measure path lengths.
    this.#collect()
  }

  #collect() {
    const plants = organism.state.garden.plants
    this.#refs = []

    // Lit re-renders the bed whenever the population changes. Listeners are
    // scoped to one controller per pass so a re-render replaces them instead
    // of stacking another set on top of the old ones.
    this.#abort?.abort()
    this.#abort = new AbortController()
    const signal = this.#abort.signal

    for (const plant of plants) {
      const group = this.querySelector<SVGGElement>(`[data-plant="${plant.id}"]`)
      const sway = group?.querySelector<SVGGElement>('[data-sway]')
      if (!group || !sway) continue

      const skeleton = organism.garden.skeleton(plant.seed)
      const rng = makeRng(plant.seed ^ 0x51ed)

      const paths: PathRef[] = [...sway.querySelectorAll<SVGPathElement>('path')].map((el) => {
        // Measured once, here — never in the frame loop.
        const length = el.getTotalLength() || 1
        el.style.strokeDasharray = `${length}`
        return {
          el,
          length,
          t0: Number(el.dataset.t0 ?? 0),
          t1: Number(el.dataset.t1 ?? 1),
          kind: el.dataset.kind ?? 'stem',
          done: false,
          shown: true,
        }
      })

      const ornaments = [...sway.querySelectorAll<SVGGElement>('[data-ornament]')].map((el) => {
        el.style.transformBox = 'fill-box'
        el.style.transformOrigin = 'center'
        return { el, t0: Number(el.dataset.t0 ?? 0.8), open: -1 }
      })

      const unit = Math.min(
        (TARGET_HEIGHT[skeleton.species] * lerp(0.85, 1.18, skeleton.vigorBias - 0.7)) /
          skeleton.height,
        6,
      )

      this.#refs.push({
        plant,
        group,
        sway,
        paths,
        ornaments,
        skeleton,
        phase: rng.range(0, Math.PI * 2),
        unit,
        lastStem: '',
        lastLeaf: '',
      })

      group.addEventListener('pointerenter', () => (this.#hovered = plant.id), { signal })
      group.addEventListener(
        'pointerleave',
        () => {
          if (this.#hovered === plant.id) this.#hovered = null
        },
        { signal },
      )
    }
  }

  #buildFireflies() {
    const host = this.$<SVGGElement>('[data-flies]')
    if (!host) return
    const ns = 'http://www.w3.org/2000/svg'
    this.#fireflies = []
    for (let i = 0; i < 7; i++) {
      const c = document.createElementNS(ns, 'circle')
      c.setAttribute('r', '3.2')
      c.setAttribute('style', 'fill: hsl(var(--glow)); filter: blur(1px)')
      c.setAttribute('opacity', '0')
      host.appendChild(c)
      this.#fireflies.push(c)
    }
  }

  /** Frame-rate work: two transforms per plant, nothing else. */
  #tickSway(t: number, wind: number, breath: number) {
    for (let i = 0; i < this.#refs.length; i++) {
      const ref = this.#refs[i]!
      const plant = ref.plant
      const age = plant.age
      const growth = lerp(0.45, 1, clamp(age))
      const wither = witherOf(age)
      const scale = ref.unit * growth * (1 - wither * 0.22)

      const x = lerp(60, VIEW_W - 60, plant.x)
      ref.group.setAttribute('transform', `translate(${x.toFixed(1)} ${SOIL_Y}) scale(${scale.toFixed(4)})`)

      // Taller, older plants catch more wind; a seedling barely moves.
      const catchWind = 0.4 + growth * 1.1
      const bend =
        wind * 5.6 * catchWind * (0.7 + 0.3 * Math.sin(t * 1.7 + ref.phase)) +
        breath * 0.5 +
        wither * 9
      ref.sway.setAttribute('transform', `rotate(${bend.toFixed(2)})`)
    }
  }

  /** 10Hz work: reveal, colour and staging — all of it change-guarded. */
  #tickGrowth() {
    const palette = organism.state.circadian.palette

    for (const ref of this.#refs) {
      const plant = ref.plant
      const reveal = revealOf(plant.age)
      const wither = witherOf(plant.age)

      // Vigour pulls the canopy toward the soil colour and drains saturation;
      // a thirsty plant goes yellow-brown before it starts to droop.
      const hue = palette.canopy.h + ref.skeleton.hueShift + (1 - plant.vigor) * 34
      const sat = palette.canopy.s * (0.45 + plant.vigor * 0.55) * (1 - wither * 0.5)
      const light = palette.canopy.l * (0.75 + plant.vigor * 0.3) * (1 - wither * 0.3)
      const stemColor = toCss({ h: hue, s: sat, l: light }, 1 - wither * 0.55)
      const leafColor = toCss({ h: hue + 8, s: sat * 1.05, l: light * 1.18 }, 1 - wither * 0.55)

      // Colour moves with the sun and with vigour, so it changes far more
      // slowly than 10Hz. Writing it only on change takes a mature bed from
      // roughly 500 style writes per tick down to none at all.
      const stemChanged = stemColor !== ref.lastStem
      const leafChanged = leafColor !== ref.lastLeaf
      ref.lastStem = stemColor
      ref.lastLeaf = leafColor

      for (const path of ref.paths) {
        if (stemChanged && path.kind !== 'leaf') path.el.style.stroke = stemColor
        if (leafChanged && path.kind === 'leaf') path.el.style.stroke = leafColor

        if (path.done) continue

        const local = clamp((reveal - path.t0) / Math.max(path.t1 - path.t0, 1e-3))
        const shown = local > 0
        if (shown !== path.shown) {
          path.shown = shown
          path.el.style.visibility = shown ? 'visible' : 'hidden'
        }
        path.el.style.strokeDashoffset = `${(path.length * (1 - local)).toFixed(2)}`
        // Fully grown: stop touching this branch until the plant is rebuilt.
        if (local >= 1) path.done = true
      }

      for (const orn of ref.ornaments) {
        const open = clamp((reveal - orn.t0) / 0.09) * (1 - wither)
        if (Math.abs(open - orn.open) < 0.004) continue
        orn.open = open
        orn.el.style.opacity = open.toFixed(3)
        orn.el.style.transform = `scale(${open.toFixed(3)})`
      }
    }

    this.#tickCaption()
  }

  #tickFireflies(t: number, daylight: number) {
    const night = clamp(1 - daylight * 2.2)
    for (let i = 0; i < this.#fireflies.length; i++) {
      const fly = this.#fireflies[i]!
      const a = t * (0.22 + i * 0.03) + i * 2.4
      const x = VIEW_W * (0.5 + 0.42 * Math.sin(a))
      const y = SOIL_Y - 40 - 110 * (0.5 + 0.5 * Math.sin(a * 1.7 + i))
      fly.setAttribute('cx', x.toFixed(1))
      fly.setAttribute('cy', y.toFixed(1))
      fly.setAttribute('opacity', (night * (0.35 + 0.65 * Math.abs(Math.sin(t * 2 + i)))).toFixed(3))
    }
  }

  #caption(): HTMLElement | null {
    return this.$('[data-caption]')
  }

  #tickCaption() {
    const el = this.#caption()
    if (!el || el.dataset.flash === '1') return

    const plant = organism.state.garden.plants.find((p) => p.id === this.#hovered)
    if (!plant) {
      el.textContent = organism.state.garden.plants.length
        ? 'Hover a plant to read it.'
        : 'Empty bed. Plant something.'
      return
    }

    const sk = organism.garden.skeleton(plant.seed)
    const stage = stageOf(plant.age)
    const pct = Math.round(clamp(plant.age / LIFESPAN) * 100)
    el.textContent =
      `${sk.species} · gen ${plant.gen} · ${STAGE_COPY[stage] ?? stage} · ` +
      `${pct}% through its life · vigour ${Math.round(plant.vigor * 100)}%`
  }

  #flashCaption(message: string) {
    const el = this.#caption()
    if (!el) return
    el.dataset.flash = '1'
    el.textContent = message
    // Motion's job here is the one-shot transition, not the continuous motion.
    void animate(el, { opacity: [0, 1], y: [6, 0] }, { duration: 0.35, ease: 'easeOut' })
    window.setTimeout(() => {
      delete el.dataset.flash
    }, 3200)
  }

  #tickStats() {
    const { garden, weather } = organism.state
    const set = (key: string, value: string) => {
      const el = this.$(`[data-stat="${key}"]`)
      if (el && el.textContent !== value) el.textContent = value
    }
    set('count', `${garden.plants.length} / ${MAX_PLANTS}`)
    set('gens', `${garden.generations}`)
    set('wet', `${Math.round(weather.wetness * 100)}%`)
    set('fert', `${Math.round(garden.fertility * 100)}%`)
  }
}

/** Polyline → a smoothed path. Quadratic midpoints keep it cheap and stable. */
function toPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  // SVG y grows downward; the generator works in +y-is-up local space.
  const p = pts.map((pt) => ({ x: pt.x, y: -pt.y }))
  let d = `M${p[0]!.x.toFixed(2)} ${p[0]!.y.toFixed(2)}`
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i]!
    const b = p[i + 1]!
    d += ` Q${a.x.toFixed(2)} ${a.y.toFixed(2)} ${((a.x + b.x) / 2).toFixed(2)} ${((a.y + b.y) / 2).toFixed(2)}`
  }
  const last = p[p.length - 1]!
  d += ` L${last.x.toFixed(2)} ${last.y.toFixed(2)}`
  return d
}

customElements.define('garden-bed', GardenBed)
