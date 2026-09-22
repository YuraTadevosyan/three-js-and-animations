import { html, svg, type TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { animate } from 'motion'
import { BED_H, BED_W, plantX, SOIL_Y } from '@/lib/bed'
import { toCss } from '@/lib/color'
import { targetHeight } from '@/lib/genome'
import type { Skeleton } from '@/lib/lsystem'
import { clamp, lerp, lerpAngle } from '@/lib/math'
import { makeRng } from '@/lib/rng'
import {
  isInFlower,
  LIFESPAN,
  MAX_PLANTS,
  organism,
  revealOf,
  stageOf,
  witherOf,
  growthSeasonFactor,
  type FlowerSite,
} from '@/organism'
import type { Plant, Pollinator, PollinatorKind, Predator, PredatorKind } from '@/organism/state'
import { Organ } from './base'
import './living-button'

const STAGE_COPY: Record<string, string> = {
  seed: 'just planted',
  sprout: 'sprouting',
  juvenile: 'putting out leaves',
  mature: 'fully grown',
  flowering: 'in flower',
  seeding: 'going to seed',
  fading: 'fading back into the soil',
}

const FAUNA_SLOTS = 8
const LEAF_SLOTS = 18
const PREDATOR_SLOTS = 5
/** Dots drawn on a fully infested plant. */
const APHID_DOTS = 14
/** Past this, a plant stops offering its flowers to pollinators. */
const FLOWER_SUPPRESSION = 0.45

/** Bed units of snow at full depth. */
const SNOW_MAX_DEPTH = 17

interface Leaf {
  el: SVGGElement
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  rotV: number
  size: number
  /** Seconds left once it has landed. */
  fade: number
  landed: boolean
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

interface OrnamentRef {
  el: SVGGElement
  t0: number
  open: number
  kind: string
  /** Local skeleton coordinates, already flipped into SVG's y-down space. */
  lx: number
  ly: number
  /**
   * The flower site handed to the pollinator system, when this ornament is an
   * open flower. Shared by reference so its position can be updated in place
   * every frame without rebuilding the registry.
   */
  site?: FlowerSite | undefined
}

interface PlantRefs {
  /** The live plant object from state — not a copy, and not looked up by id. */
  plant: Plant
  group: SVGGElement
  sway: SVGGElement
  paths: PathRef[]
  ornaments: OrnamentRef[]
  skeleton: Skeleton
  phase: number
  /** Pre-computed scale that maps this skeleton's local units into the bed. */
  unit: number
  /** Last colours written, so unchanged strokes are skipped entirely. */
  lastStem: string
  lastLeaf: string
  /** How far into autumn this individual waits before turning. */
  turnBias: number
  /** Canopy height in bed units, for spawning leaves at the right altitude. */
  canopy: number
  /** Live transform, kept so flower positions can be derived each frame. */
  scale: number
  bend: number
  /** The aphid colony drawn on this plant. */
  aphids: { group: SVGGElement; dots: SVGCircleElement[]; shown: number; fill: string }
}

/**
 * A bed of plants grown from genomes, and the insects that move pollen
 * between them.
 *
 * The geometry is built once when a plant appears and never rebuilt. Growth is
 * a stroke-dashoffset sweep across branches whose [t0, t1] window the plant's
 * age has reached, so a fully grown bed costs the same per frame as an empty
 * one. Only transforms run at frame rate; growth, colour and staging update at
 * 10Hz, which is far finer than anything you can perceive in a plant.
 *
 * Flower *positions* are the exception — they move with the wind, and a
 * pollinator steering toward a 10Hz target visibly stutters, so those are
 * refreshed every frame in place. The set of open flowers still only changes
 * on the slow tick.
 */
export class GardenBed extends Organ {
  #refs: PlantRefs[] = []
  #abort: AbortController | null = null
  #fireflies: SVGCircleElement[] = []
  #faunaSlots: { group: SVGGElement; variants: Record<string, SVGGElement>; wings: Record<string, SVGGElement> }[] = []
  /** Reused across frames: the pollinator system holds these same objects. */
  #sites: FlowerSite[] = []
  #leaves: Leaf[] = []
  #predatorSlots: { group: SVGGElement; variants: Record<string, SVGGElement>; wings: Record<string, SVGGElement> }[] = []
  #lastEcologyFlash = 0
  #leafDebt = 0
  #lastSnow = -1
  #slow = 0
  #lastPollenFlash = 0
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
            viewBox="0 0 ${BED_W} ${BED_H}"
            class="block w-full"
            role="img"
            aria-label="A garden bed of ${plants.length} plants, visited by pollinating insects"
            style="background: linear-gradient(to bottom, hsl(var(--card) / .25), hsl(var(--soil) / .35))"
          >
            <g data-flies></g>
            ${repeat(plants, (p) => p.id, (p) => this.#plantTemplate(p))}
            <path
              d="M0 ${SOIL_Y} Q 250 ${SOIL_Y - 8} 500 ${SOIL_Y} T ${BED_W} ${SOIL_Y} L${BED_W} ${BED_H} L0 ${BED_H} Z"
              style="fill: hsl(var(--soil))"
            ></path>
            <path
              d="M0 ${SOIL_Y} Q 250 ${SOIL_Y - 8} 500 ${SOIL_Y} T ${BED_W} ${SOIL_Y}"
              fill="none"
              style="stroke: hsl(var(--canopy) / .55); stroke-width: 3"
            ></path>
            <path data-snow d="" style="fill: hsl(var(--card))" opacity="0"></path>
            <g data-leaves></g>
            <g data-fauna></g>
            <g data-predators></g>
          </svg>

          <figcaption
            data-caption
            class="tnum absolute bottom-2 left-3 right-3 truncate text-[11px] text-muted-foreground"
          ></figcaption>
        </div>

        <p class="mt-3 text-sm text-muted-foreground" data-fauna-line>&nbsp;</p>
        <p class="mt-1 text-sm text-muted-foreground" data-season-line>&nbsp;</p>
        <p class="mt-1 text-sm text-muted-foreground" data-ecology-line>&nbsp;</p>

        <div class="mt-4 flex flex-wrap items-center gap-3">
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
          ${this.#stat('Hybrids in bed', 'hybrids')} ${this.#stat('Pollinations', 'pollen')}
          ${this.#stat('Soil moisture', 'wet')} ${this.#stat('Fertility', 'fert')}
          ${this.#stat('Aphid load', 'aphids')} ${this.#stat('Aphids eaten', 'eaten')}
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
    const sk = organism.garden.skeleton(plant)

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
        data-kind=${o.kind}
        data-t0=${o.t0}
        data-lx=${o.x}
        data-ly=${-o.y}
        transform=${`translate(${o.x.toFixed(2)} ${(-o.y).toFixed(2)})`}
      >${body}</g>`
    })

    // Aphid positions are sampled from the plant's own stems and frozen, so a
    // colony sits where it would sit rather than crawling about at random.
    const spotRng = makeRng(plant.seed ^ 0xa9f1)
    const stems = sk.branches.filter((b) => b.kind === 'stem')
    const dots = Array.from({ length: APHID_DOTS }, () => {
      const branch = spotRng.pick(stems)
      const point = branch.pts[spotRng.int(1, branch.pts.length - 1)]!
      return svg`<circle
        cx=${(point.x + spotRng.range(-1.4, 1.4)).toFixed(2)}
        cy=${(-point.y + spotRng.range(-1.4, 1.4)).toFixed(2)}
        r=${spotRng.range(0.9, 1.7).toFixed(2)}
      ></circle>`
    })

    return svg`<g data-plant=${plant.id} class="cursor-pointer">
      <g data-sway>${paths}${ornaments}<g data-aphids opacity="0">${dots}</g></g>
    </g>`
  }

  firstUpdated() {
    this.#buildFireflies()
    this.#buildFauna()
    this.#buildPredators()
    this.#buildLeaves()
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
    this.listen('pollinated', ({ kind }) => {
      // A busy bed can deliver pollen every few seconds; without a floor the
      // caption would never return to the hover readout.
      const now = performance.now()
      if (now - this.#lastPollenFlash < 9000) return
      this.#lastPollenFlash = now
      this.#flashCaption(`A ${kind} carried pollen across. That seed will be a cross.`)
    })
    // The ecology fires often enough that it needs its own floor, separate
    // from the pollination one — otherwise the two together would never let
    // the caption fall back to the hover readout.
    const ecologyFlash = (message: string) => {
      const now = performance.now()
      if (now - this.#lastEcologyFlash < 11000) return
      this.#lastEcologyFlash = now
      this.#flashCaption(message)
    }

    this.listen('outbreak', () =>
      ecologyFlash('Aphids have taken hold. Watch the vigour drop — or water them off.'),
    )
    this.listen('predators', ({ kind }) =>
      ecologyFlash(
        kind === 'ladybird'
          ? 'A ladybird found the colony. It will work through it.'
          : 'A lacewing came in on the dusk shift.',
      ),
    )
    this.listen('cleared', () => ecologyFlash('That colony is gone. The plant can recover now.'))

    this.listen('crossed', ({ parents }) => {
      this.#flashCaption(
        parents[0] === parents[1]
          ? `A cross between two ${parents[0]}s. Same species, different lines.`
          : `A ${parents[0]} × ${parents[1]} cross just took root.`,
      )
    })

    this.tick((dt, state) => {
      this.#tickFast(state.time.elapsed, state.weather.wind, state.breath.value)
      this.#tickFauna(state.fauna.pollinators)
      this.#tickPredators(state.ecology.predators)

      const autumn = state.weather.seasonMix.autumn
      const leafHue = lerpAngle(state.circadian.palette.canopy.h, 32, clamp(autumn * 1.1))
      this.#tickLeaves(dt, autumn, state.weather.wind, leafHue)

      this.#slow += dt
      if (this.#slow < 0.1) return
      this.#slow = 0
      this.#tickGrowth()
      this.#tickAphids(state.circadian.daylight)
      this.#publishFlowers()
      this.#tickFireflies(state.time.elapsed, state.circadian.daylight)
      this.#tickSnow(state.weather.snowpack)
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

      const skeleton = organism.garden.skeleton(plant)
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

      const ornaments: OrnamentRef[] = [
        ...sway.querySelectorAll<SVGGElement>('[data-ornament]'),
      ].map((el) => {
        el.style.transformBox = 'fill-box'
        el.style.transformOrigin = 'center'
        return {
          el,
          t0: Number(el.dataset.t0 ?? 0.8),
          open: -1,
          kind: el.dataset.kind ?? 'seed',
          lx: Number(el.dataset.lx ?? 0),
          ly: Number(el.dataset.ly ?? 0),
        }
      })

      const aphidGroup = sway.querySelector<SVGGElement>('[data-aphids]')
      if (!aphidGroup) continue

      this.#refs.push({
        plant,
        group,
        sway,
        paths,
        ornaments,
        skeleton,
        phase: rng.range(0, Math.PI * 2),
        unit: Math.min(targetHeight(plant.genome) / skeleton.height, 6),
        lastStem: '',
        lastLeaf: '',
        // Some individuals turn a fortnight before their neighbours, which is
        // the difference between a season and a global colour filter.
        turnBias: rng.range(0, 0.34),
        canopy: Math.min(targetHeight(plant.genome), skeleton.height * 6),
        scale: 1,
        bend: 0,
        aphids: {
          group: aphidGroup,
          dots: [...aphidGroup.querySelectorAll<SVGCircleElement>('circle')],
          shown: -1,
          fill: '',
        },
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

    // A plant may have died mid-flight; drop any flower sites pointing at it.
    this.#publishFlowers()
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

  /**
   * Pollinators are pooled. Each slot carries all three body plans and shows
   * one, because a slot's occupant changes species at dawn and dusk and
   * rebuilding the DOM at those moments would be visible.
   */
  #buildFauna() {
    const host = this.$<SVGGElement>('[data-fauna]')
    if (!host) return
    const ns = 'http://www.w3.org/2000/svg'
    this.#faunaSlots = []

    for (let i = 0; i < FAUNA_SLOTS; i++) {
      const group = document.createElementNS(ns, 'g')
      group.setAttribute('opacity', '0')
      group.style.display = 'none'

      const variants: Record<string, SVGGElement> = {}
      const wings: Record<string, SVGGElement> = {}

      for (const kind of ['bee', 'butterfly', 'moth'] as PollinatorKind[]) {
        const variant = document.createElementNS(ns, 'g')
        variant.style.display = 'none'
        const wing = document.createElementNS(ns, 'g')
        wing.innerHTML = WING_MARKUP[kind]
        variant.appendChild(wing)

        const body = document.createElementNS(ns, 'g')
        body.innerHTML = BODY_MARKUP[kind]
        variant.appendChild(body)

        variants[kind] = variant
        wings[kind] = wing
        group.appendChild(variant)
      }

      host.appendChild(group)
      this.#faunaSlots.push({ group, variants, wings })
    }
  }

  /**
   * Fallen leaves. Pooled like the pollinators — an autumn gale can put a
   * dozen in the air at once and allocating them per gust would stutter.
   */
  #buildLeaves() {
    const host = this.$<SVGGElement>('[data-leaves]')
    if (!host) return
    const ns = 'http://www.w3.org/2000/svg'
    this.#leaves = []

    for (let i = 0; i < LEAF_SLOTS; i++) {
      const el = document.createElementNS(ns, 'g')
      el.innerHTML =
        '<path d="M0 0 C4 -3.4 9.5 -2.2 11.5 2 C8.4 6.4 3 6.2 0 0 Z"></path>' +
        '<path d="M0.4 0.4 L10.8 2" fill="none" stroke-width="0.5" opacity=".45"></path>'
      el.style.display = 'none'
      host.appendChild(el)
      this.#leaves.push({
        el, active: false, x: 0, y: 0, vx: 0, vy: 0,
        rot: 0, rotV: 0, size: 1, fade: 0, landed: false,
      })
    }
  }

  #spawnLeaf(autumn: number, wind: number, hue: number) {
    if (!this.#refs.length) return
    const slot = this.#leaves.find((l) => !l.active)
    if (!slot) return

    const ref = this.#refs[Math.floor(Math.random() * this.#refs.length)]!
    // Only a plant with a canopy worth shedding.
    if (ref.plant.age < 0.35) return

    const height = ref.canopy * lerp(0.45, 1, clamp(ref.plant.age))
    slot.active = true
    slot.landed = false
    slot.x = plantX(ref.plant.x) + (Math.random() - 0.5) * height * 0.5
    slot.y = SOIL_Y - height * (0.45 + Math.random() * 0.5)
    slot.vx = wind * 26 + (Math.random() - 0.5) * 12
    slot.vy = 6 + Math.random() * 10
    slot.rot = Math.random() * 360
    slot.rotV = (Math.random() - 0.5) * 160
    slot.size = 0.55 + Math.random() * 0.55 + autumn * 0.2
    slot.fade = 0
    slot.el.style.display = ''
    // Written here rather than per frame: an 18-leaf pool reparsing its style
    // sixty times a second is a lot of work for a colour that barely moves.
    slot.el.setAttribute(
      'style',
      `fill: hsl(${hue.toFixed(0)} 62% 46%); stroke: hsl(${hue.toFixed(0)} 55% 30%)`,
    )
  }

  #tickLeaves(dt: number, autumn: number, wind: number, hue: number) {
    // Shedding scales with how far into autumn it is and how hard it's blowing.
    if (autumn > 0.06) {
      this.#leafDebt += dt * autumn * (0.5 + Math.abs(wind) * 2.2)
      while (this.#leafDebt >= 1) {
        this.#leafDebt -= 1
        this.#spawnLeaf(autumn, wind, hue)
      }
    } else {
      this.#leafDebt = 0
    }

    for (const leaf of this.#leaves) {
      if (!leaf.active) continue

      if (!leaf.landed) {
        // Terminal velocity plus a flutter, so they tumble rather than drop.
        leaf.vy = Math.min(leaf.vy + 22 * dt, 46)
        leaf.vx += (wind * 34 - leaf.vx) * dt * 1.4
        leaf.x += (leaf.vx + Math.sin(leaf.rot * 0.05) * 14) * dt
        leaf.y += leaf.vy * dt
        leaf.rot += leaf.rotV * dt

        if (leaf.y >= SOIL_Y - 3) {
          leaf.y = SOIL_Y - 3
          leaf.landed = true
          leaf.fade = 5 + Math.random() * 5
          // Lie flat once down.
          leaf.rotV = 0
          leaf.rot = leaf.rot > 180 ? 178 : 4
        }
      } else {
        leaf.fade -= dt
        if (leaf.fade <= 0) {
          leaf.active = false
          leaf.el.style.display = 'none'
          continue
        }
      }

      const alpha = leaf.landed ? clamp(leaf.fade / 3) * 0.75 : 0.9
      leaf.el.setAttribute(
        'transform',
        `translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.rot.toFixed(1)}) scale(${leaf.size.toFixed(2)})`,
      )
      leaf.el.setAttribute('opacity', alpha.toFixed(3))
    }
  }

  /** The snow band along the soil line. Redrawn only when the depth moves. */
  #tickSnow(depth: number) {
    const el = this.$<SVGPathElement>('[data-snow]')
    if (!el || Math.abs(depth - this.#lastSnow) < 0.004) return
    this.#lastSnow = depth

    if (depth < 0.004) {
      el.setAttribute('opacity', '0')
      return
    }

    const h = depth * SNOW_MAX_DEPTH
    const y = (f: number) => (SOIL_Y - h * f).toFixed(1)
    el.setAttribute(
      'd',
      `M0 ${SOIL_Y} Q250 ${SOIL_Y - 8} 500 ${SOIL_Y} T${BED_W} ${SOIL_Y}` +
        ` L${BED_W} ${y(0.65)} Q750 ${y(1.35)} 500 ${y(0.8)} Q250 ${y(1.5)} 0 ${y(1)} Z`,
    )
    el.setAttribute('opacity', clamp(depth * 4, 0, 0.94).toFixed(3))
  }

  #buildPredators() {
    const host = this.$<SVGGElement>('[data-predators]')
    if (!host) return
    const ns = 'http://www.w3.org/2000/svg'
    this.#predatorSlots = []

    for (let i = 0; i < PREDATOR_SLOTS; i++) {
      const group = document.createElementNS(ns, 'g')
      group.setAttribute('opacity', '0')
      group.style.display = 'none'

      const variants: Record<string, SVGGElement> = {}
      const wings: Record<string, SVGGElement> = {}

      for (const kind of ['ladybird', 'lacewing'] as PredatorKind[]) {
        const variant = document.createElementNS(ns, 'g')
        variant.style.display = 'none'
        const wing = document.createElementNS(ns, 'g')
        wing.innerHTML = PREDATOR_WINGS[kind]
        variant.appendChild(wing)
        const body = document.createElementNS(ns, 'g')
        body.innerHTML = PREDATOR_BODY[kind]
        variant.appendChild(body)
        variants[kind] = variant
        wings[kind] = wing
        group.appendChild(variant)
      }

      host.appendChild(group)
      this.#predatorSlots.push({ group, variants, wings })
    }
  }

  #tickPredators(agents: Predator[]) {
    for (let i = 0; i < this.#predatorSlots.length; i++) {
      const slot = this.#predatorSlots[i]!
      const agent = agents[i]

      if (!agent) {
        if (slot.group.style.display !== 'none') slot.group.style.display = 'none'
        continue
      }
      if (slot.group.style.display !== '') slot.group.style.display = ''

      for (const kind of Object.keys(slot.variants)) {
        const wanted = kind === agent.kind ? '' : 'none'
        if (slot.variants[kind]!.style.display !== wanted) {
          slot.variants[kind]!.style.display = wanted
        }
      }

      const deg = (agent.angle * 180) / Math.PI
      const flip = Math.abs(deg) > 90 ? -1 : 1
      const k = 0.75 + agent.presence * 0.25
      slot.group.setAttribute(
        'transform',
        `translate(${agent.x.toFixed(1)} ${agent.y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${k.toFixed(3)} ${(k * flip).toFixed(3)})`,
      )
      slot.group.setAttribute('opacity', agent.presence.toFixed(3))

      // A feeding ladybird folds its wings away and sits on the colony.
      const fold = agent.state === 'feeding' ? 0.12 : 0.3 + 0.7 * Math.abs(Math.cos(agent.flap))
      slot.wings[agent.kind]!.setAttribute('transform', `scale(1 ${fold.toFixed(3)})`)
    }
  }

  /** 10Hz: how many aphids each plant is carrying, and what colour they are. */
  #tickAphids(daylight: number) {
    // Aphids are a green so dull it reads as damage rather than decoration,
    // lifted slightly in daylight so they don't vanish at noon.
    const fill = toCss({ h: 92, s: 26, l: 20 + daylight * 16 })

    for (const ref of this.#refs) {
      const aphids = ref.aphids
      const count = Math.round(clamp(ref.plant.infestation) * aphids.dots.length)

      if (fill !== aphids.fill) {
        aphids.fill = fill
        aphids.group.style.fill = fill
      }

      if (count === aphids.shown) continue
      const previous = aphids.shown
      aphids.shown = count

      if (previous < 0) {
        for (const dot of aphids.dots) dot.style.display = 'none'
      }
      // Only touch the dots that actually changed state.
      const from = Math.max(previous, 0)
      for (let i = Math.min(from, count); i < Math.max(from, count); i++) {
        aphids.dots[i]!.style.display = i < count ? '' : 'none'
      }
      aphids.group.setAttribute('opacity', count ? '0.85' : '0')
    }
  }

  /** Frame-rate work: transforms only. */
  #tickFast(t: number, wind: number, breath: number) {
    for (let i = 0; i < this.#refs.length; i++) {
      const ref = this.#refs[i]!
      const plant = ref.plant
      const age = plant.age

      const growth = lerp(0.45, 1, clamp(age))
      const wither = witherOf(age)
      const scale = ref.unit * growth * (1 - wither * 0.22)

      const x = plantX(plant.x)
      ref.group.setAttribute('transform', `translate(${x.toFixed(1)} ${SOIL_Y}) scale(${scale.toFixed(4)})`)

      // Taller, older plants catch more wind; a seedling barely moves.
      const catchWind = 0.4 + growth * 1.1
      const bend =
        wind * 5.6 * catchWind * (0.7 + 0.3 * Math.sin(t * 1.7 + ref.phase)) +
        breath * 0.5 +
        wither * 9
      ref.sway.setAttribute('transform', `rotate(${bend.toFixed(2)})`)

      ref.scale = scale
      ref.bend = bend
    }

    this.#trackFlowers()
  }

  /**
   * Flower positions follow the sway every frame. The objects are shared by
   * reference with the pollinator system, so mutating them in place updates
   * what the insects are steering toward without any allocation.
   */
  #trackFlowers() {
    if (!this.#sites.length) return

    for (const ref of this.#refs) {
      const rad = (ref.bend * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      const baseX = plantX(ref.plant.x)

      for (const orn of ref.ornaments) {
        const site = orn.site
        if (!site) continue
        // local → rotate(bend) → scale → translate, matching the SVG nesting.
        site.x = baseX + (orn.lx * cos - orn.ly * sin) * ref.scale
        site.y = SOIL_Y + (orn.lx * sin + orn.ly * cos) * ref.scale
      }
    }
  }

  /** 10Hz: decide which flowers are open and hand the set to the pollinators. */
  #publishFlowers() {
    const sites: FlowerSite[] = []

    for (const ref of this.#refs) {
      // A plant under real aphid pressure stops putting energy into flowers,
      // which quietly cuts it out of pollination until something eats them.
      const open =
        isInFlower(ref.plant.age) && ref.plant.infestation < FLOWER_SUPPRESSION
      for (let i = 0; i < ref.ornaments.length; i++) {
        const orn = ref.ornaments[i]!
        if (orn.kind !== 'flower') continue
        if (!open || orn.open < 0.55) {
          orn.site = undefined
          continue
        }
        const site: FlowerSite = {
          key: `${ref.plant.id}:${i}`,
          plantId: ref.plant.id,
          x: plantX(ref.plant.x),
          y: SOIL_Y,
        }
        orn.site = site
        sites.push(site)
      }
    }

    this.#sites = sites
    this.#trackFlowers()
    organism.fauna.setFlowers(sites)
  }

  #tickFauna(agents: Pollinator[]) {
    for (let i = 0; i < this.#faunaSlots.length; i++) {
      const slot = this.#faunaSlots[i]!
      const agent = agents[i]

      if (!agent) {
        if (slot.group.style.display !== 'none') slot.group.style.display = 'none'
        continue
      }

      if (slot.group.style.display !== '') slot.group.style.display = ''

      for (const kind of Object.keys(slot.variants)) {
        const wanted = kind === agent.kind ? '' : 'none'
        if (slot.variants[kind]!.style.display !== wanted) {
          slot.variants[kind]!.style.display = wanted
        }
      }

      const deg = (agent.angle * 180) / Math.PI
      // Flip rather than rotate past vertical, so nothing flies upside down.
      const flip = Math.abs(deg) > 90 ? -1 : 1
      const k = 0.7 + agent.presence * 0.3
      slot.group.setAttribute(
        'transform',
        `translate(${agent.x.toFixed(1)} ${agent.y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${k.toFixed(3)} ${(k * flip).toFixed(3)})`,
      )
      slot.group.setAttribute('opacity', agent.presence.toFixed(3))

      // Wings fold rather than spin: a vertical squash reads as a wingbeat at
      // any frame rate, where a rotation aliases badly at 34 beats a second.
      const fold = agent.state === 'feeding' ? 0.55 : 0.3 + 0.7 * Math.abs(Math.cos(agent.flap))
      slot.wings[agent.kind]!.setAttribute('transform', `scale(1 ${fold.toFixed(3)})`)
    }
  }

  /** 10Hz work: reveal, colour and staging — all of it change-guarded. */
  #tickGrowth() {
    const palette = organism.state.circadian.palette
    const mix = organism.state.weather.seasonMix

    for (const ref of this.#refs) {
      const plant = ref.plant
      const reveal = revealOf(plant.age)
      const wither = witherOf(plant.age)

      // How far this individual has turned. The bias staggers the bed so the
      // change spreads through it over weeks rather than happening at once.
      const turn = clamp((mix.autumn - ref.turnBias) / Math.max(1 - ref.turnBias, 0.1))

      // Vigour pulls the canopy toward the soil colour and drains saturation;
      // a thirsty plant goes yellow-brown before it starts to droop.
      const green = palette.canopy.h + plant.genome.hueShift + (1 - plant.vigor) * 34
      const gold = 32 + plant.genome.hueShift * 0.25
      const hue = lerpAngle(green, gold, turn * 0.88)
      const sat =
        palette.canopy.s *
        (0.45 + plant.vigor * 0.55) *
        (1 - wither * 0.5) *
        clamp(1 + turn * 0.3 - mix.winter * 0.3, 0.2, 1.6)
      const light =
        palette.canopy.l * (0.75 + plant.vigor * 0.3) * (1 - wither * 0.3) * (1 + turn * 0.12)
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
      const x = BED_W * (0.5 + 0.42 * Math.sin(a))
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

    const stage = stageOf(plant.age)
    const pct = Math.round(clamp(plant.age / LIFESPAN) * 100)
    const lineage = plant.parents
      ? `${plant.parents[0]} × ${plant.parents[1]} cross`
      : plant.gen > 0
        ? 'self-seeded'
        : 'original stock'
    const carrying = plant.pollen ? ` · carrying ${plant.pollen.species} pollen` : ''
    const aphids =
      plant.infestation > 0.02
        ? ` · ${Math.round(plant.infestation * 100)}% aphids` +
          (plant.infestation >= FLOWER_SUPPRESSION ? ' (not flowering)' : '')
        : ''

    el.textContent =
      `${plant.genome.species} · gen ${plant.gen} · ${lineage} · ` +
      `${STAGE_COPY[stage] ?? stage} · ${pct}% through its life · ` +
      `vigour ${Math.round(plant.vigor * 100)}%${carrying}${aphids}`
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
    const { garden, fauna } = organism.state
    const set = (key: string, value: string) => {
      const el = this.$(`[data-stat="${key}"]`)
      if (el && el.textContent !== value) el.textContent = value
    }
    set('count', `${garden.plants.length} / ${MAX_PLANTS}`)
    set('gens', `${garden.generations}`)
    set('hybrids', `${garden.hybrids}`)
    set('pollen', `${garden.pollinations}`)
    set('wet', `${Math.round(organism.state.weather.wetness * 100)}%`)
    set('fert', `${Math.round(garden.fertility * 100)}%`)

    const eco = organism.state.ecology
    set('aphids', eco.aphidLoad.toFixed(2))
    set('eaten', eco.eaten.toFixed(2))

    const line = this.$('[data-fauna-line]')
    if (line) {
      const counts = new Map<string, number>()
      for (const agent of fauna.pollinators) {
        counts.set(agent.kind, (counts.get(agent.kind) ?? 0) + 1)
      }
      const parts = [...counts].map(([kind, n]) => `${n} ${kind}${n > 1 ? 's' : ''}`)

      let text: string
      if (parts.length) {
        text = `${parts.join(', ')} working ${fauna.flowers} open flower${fauna.flowers === 1 ? '' : 's'}`
        if (fauna.carrying) text += ` · ${fauna.carrying} carrying pollen`
      } else if (fauna.flowers === 0) {
        text = 'Nothing in flower, so nothing is visiting.'
      } else {
        text = 'No pollinators out — too wet, too windy, or the wrong hour.'
      }
      if (line.textContent !== text) line.textContent = text
    }

    const season = this.$('[data-season-line]')
    if (season) {
      const mix = organism.state.weather.seasonMix
      const name = organism.state.weather.season
      const parts = [
        `${name[0]!.toUpperCase()}${name.slice(1)}`,
        `growth at ${Math.round(growthSeasonFactor(mix) * 100)}%`,
      ]
      if (mix.autumn > 0.12) parts.push(`canopy ${Math.round(mix.autumn * 100)}% turned`)
      if (organism.state.weather.snowpack > 0.01) {
        parts.push(`${Math.round(organism.state.weather.snowpack * 100)}% snow cover`)
      }
      const text = parts.join(' · ')
      if (season.textContent !== text) season.textContent = text
    }

    const ecoLine = this.$('[data-ecology-line]')
    if (ecoLine) {
      const counts = new Map<string, number>()
      for (const predator of eco.predators) {
        counts.set(predator.kind, (counts.get(predator.kind) ?? 0) + 1)
      }
      const hunters = [...counts].map(([kind, n]) => `${n} ${kind}${n > 1 ? 's' : ''}`)

      let text: string
      if (eco.infested === 0 && !hunters.length) {
        text = 'No aphids anywhere. The bed is clean.'
      } else {
        const bits: string[] = []
        if (eco.infested) {
          bits.push(`${eco.infested} plant${eco.infested === 1 ? '' : 's'} infested`)
        }
        bits.push(hunters.length ? `${hunters.join(', ')} hunting` : 'nothing hunting yet')
        if (eco.outbreaks) bits.push(`${eco.outbreaks} outbreak${eco.outbreaks === 1 ? '' : 's'}`)
        text = bits.join(' · ')
      }
      if (ecoLine.textContent !== text) ecoLine.textContent = text
    }
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

/* Bodies point along +x; the slot transform handles heading. */
const WING_MARKUP: Record<PollinatorKind, string> = {
  bee: `
    <ellipse cx="-0.5" cy="-3.4" rx="4.6" ry="2.4" style="fill: hsl(var(--card)); opacity: .8"></ellipse>
    <ellipse cx="-0.5" cy="3.4" rx="4.2" ry="2.2" style="fill: hsl(var(--card)); opacity: .6"></ellipse>`,
  butterfly: `
    <ellipse cx="-1.5" cy="-5" rx="6" ry="4.6" style="fill: hsl(var(--primary)); opacity: .92"></ellipse>
    <ellipse cx="-1.5" cy="5" rx="6" ry="4.6" style="fill: hsl(var(--primary)); opacity: .92"></ellipse>
    <ellipse cx="3.2" cy="-3.2" rx="4" ry="3.2" style="fill: hsl(var(--accent)); opacity: .88"></ellipse>
    <ellipse cx="3.2" cy="3.2" rx="4" ry="3.2" style="fill: hsl(var(--accent)); opacity: .88"></ellipse>`,
  moth: `
    <ellipse cx="-1.2" cy="-4.4" rx="5.4" ry="4" style="fill: hsl(var(--muted-foreground)); opacity: .75"></ellipse>
    <ellipse cx="-1.2" cy="4.4" rx="5.4" ry="4" style="fill: hsl(var(--muted-foreground)); opacity: .75"></ellipse>
    <ellipse cx="2.8" cy="-2.8" rx="3.6" ry="2.8" style="fill: hsl(var(--glow)); opacity: .45"></ellipse>
    <ellipse cx="2.8" cy="2.8" rx="3.6" ry="2.8" style="fill: hsl(var(--glow)); opacity: .45"></ellipse>`,
}

const PREDATOR_WINGS: Record<PredatorKind, string> = {
  ladybird: `
    <ellipse cx="-1" cy="-4" rx="5.4" ry="2.6" style="fill: hsl(var(--card)); opacity: .55"></ellipse>
    <ellipse cx="-1" cy="4" rx="5.4" ry="2.6" style="fill: hsl(var(--card)); opacity: .55"></ellipse>`,
  lacewing: `
    <ellipse cx="-1.5" cy="-2.6" rx="9" ry="3.2" style="fill: hsl(var(--card)); opacity: .5"></ellipse>
    <ellipse cx="-1.5" cy="2.6" rx="9" ry="3.2" style="fill: hsl(var(--card)); opacity: .5"></ellipse>`,
}

const PREDATOR_BODY: Record<PredatorKind, string> = {
  ladybird: `
    <ellipse rx="6" ry="5" style="fill: hsl(2 74% 48%)"></ellipse>
    <path d="M-6 0 L4 0" stroke-width="0.9" fill="none" style="stroke: hsl(20 40% 14%)"></path>
    <circle cx="-2.6" cy="-2.4" r="1.25" style="fill: hsl(20 40% 14%)"></circle>
    <circle cx="-2.6" cy="2.4" r="1.25" style="fill: hsl(20 40% 14%)"></circle>
    <circle cx="1.4" cy="-2.7" r="1.05" style="fill: hsl(20 40% 14%)"></circle>
    <circle cx="1.4" cy="2.7" r="1.05" style="fill: hsl(20 40% 14%)"></circle>
    <circle cx="5.4" cy="0" r="2.5" style="fill: hsl(20 40% 14%)"></circle>`,
  lacewing: `
    <ellipse rx="5.2" ry="1.5" style="fill: hsl(88 48% 52%)"></ellipse>
    <circle cx="5" cy="0" r="1.7" style="fill: hsl(88 40% 40%)"></circle>
    <circle cx="5.6" cy="-1" r="0.7" style="fill: hsl(42 90% 60%)"></circle>
    <circle cx="5.6" cy="1" r="0.7" style="fill: hsl(42 90% 60%)"></circle>`,
}

const BODY_MARKUP: Record<PollinatorKind, string> = {
  bee: `
    <ellipse rx="5" ry="2.9" style="fill: hsl(var(--glow))"></ellipse>
    <rect x="-2.2" y="-2.9" width="1.7" height="5.8" style="fill: hsl(var(--soil))"></rect>
    <rect x="0.6" y="-2.6" width="1.5" height="5.2" style="fill: hsl(var(--soil))"></rect>
    <circle cx="5" cy="0" r="2.1" style="fill: hsl(var(--soil))"></circle>`,
  butterfly: `<ellipse rx="4.6" ry="1.1" style="fill: hsl(var(--soil))"></ellipse>`,
  moth: `<ellipse rx="4.4" ry="1.7" style="fill: hsl(var(--soil))"></ellipse>`,
}

customElements.define('garden-bed', GardenBed)
