import { BED_W, SOIL_Y } from '@/lib/bed'
import { clamp, damp } from '@/lib/math'
import { makeRng } from '@/lib/rng'
import type { Bus } from './bus'
import type { OrganismState, Pollinator, PollinatorKind } from './state'

/** One open flower, in bed units. Published by the garden renderer. */
export interface FlowerSite {
  /** `${plantId}:${ornamentIndex}` — stable for the life of the plant. */
  key: string
  plantId: string
  x: number
  y: number
}

interface KindTraits {
  /** Cruising speed in bed units per second. */
  speed: number
  /** How hard it can turn, in radians per second. */
  turn: number
  /** Wingbeats per second. */
  flap: number
  feed: [number, number]
  /** Amplitude of the sideways drift while travelling. */
  wander: number
  /** How strongly it holds a heading — low values flutter. */
  focus: number
}

/**
 * The three pollinators differ in exactly the ways you'd notice from across a
 * room: a bee goes fast and straight and barely stops, a butterfly takes a
 * wandering line and lingers, a moth drifts.
 */
const TRAITS: Record<PollinatorKind, KindTraits> = {
  bee: { speed: 132, turn: 7, flap: 34, feed: [0.5, 1.3], wander: 9, focus: 0.92 },
  butterfly: { speed: 72, turn: 3.2, flap: 7, feed: [1.2, 2.6], wander: 27, focus: 0.55 },
  moth: { speed: 58, turn: 2.6, flap: 9, feed: [1, 2.2], wander: 32, focus: 0.42 },
}

const MAX_AGENTS = 7
/** Bed units. Inside this radius of a flower, it has arrived. */
const ARRIVAL = 7
const CEILING = 40

let counter = 0

export class Fauna {
  #rng = makeRng((Date.now() ^ 0x1f123bb5) >>> 0)
  #sites: FlowerSite[] = []
  #byKey = new Map<string, FlowerSite>()
  #spawnCooldown = 0

  constructor(private state: OrganismState, private bus: Bus) {}

  /**
   * The garden renderer owns the actual flower positions — they depend on each
   * plant's growth, scale and current wind sway — so it publishes them here
   * rather than this system trying to re-derive the geometry.
   */
  setFlowers(sites: FlowerSite[]) {
    this.#sites = sites
    this.#byKey.clear()
    for (const site of sites) this.#byKey.set(site.key, site)
    this.state.fauna.flowers = sites.length
  }

  /** Which pollinators the current hour supports. Empty means none fly. */
  #wantedKinds(daylight: number): PollinatorKind[] {
    if (daylight > 0.28) return ['bee', 'bee', 'butterfly']
    if (daylight < 0.12) return ['moth']
    // Dawn and dusk: the day shift has gone and the night shift isn't up.
    return []
  }

  #capacity(state: OrganismState): number {
    const { weather, circadian, fauna } = state

    // Nothing flies in rain or a real blow. Insects vanishing as a storm rolls
    // in and drifting back afterwards is most of what sells them as alive.
    if (weather.params.precip > 0.2 || Math.abs(weather.wind) > 0.95) return 0
    if (fauna.flowers === 0) return 0

    const kinds = this.#wantedKinds(circadian.daylight)
    if (!kinds.length) return 0

    const density = circadian.daylight > 0.28 ? 0.7 : 0.45
    const fog = 1 - weather.params.fog * 0.7
    return Math.min(MAX_AGENTS, Math.max(1, Math.round(fauna.flowers * density * fog)))
  }

  #spawn(kind: PollinatorKind) {
    const fromLeft = this.#rng.chance(0.5)
    const agent: Pollinator = {
      id: `f${(counter++).toString(36)}`,
      kind,
      x: fromLeft ? -20 : BED_W + 20,
      y: this.#rng.range(CEILING + 20, SOIL_Y - 40),
      vx: (fromLeft ? 1 : -1) * TRAITS[kind].speed * 0.6,
      vy: 0,
      angle: fromLeft ? 0 : Math.PI,
      flap: this.#rng.range(0, Math.PI * 2),
      state: 'seeking',
      targetKey: null,
      feedTimer: 0,
      pollenFrom: null,
      pollen: null,
      presence: 0,
      wander: this.#rng.range(0, Math.PI * 2),
    }
    this.state.fauna.pollinators.push(agent)
  }

  /**
   * Pick somewhere to go, preferring a flower on a plant this one is not
   * already carrying pollen from — otherwise it would shuttle between two
   * flowers of the same plant and never cross anything.
   */
  #chooseTarget(agent: Pollinator): void {
    if (!this.#sites.length) {
      agent.targetKey = null
      return
    }

    const foreign = agent.pollenFrom
      ? this.#sites.filter((s) => s.plantId !== agent.pollenFrom)
      : this.#sites
    const pool = foreign.length && this.#rng.chance(0.8) ? foreign : this.#sites

    let best = this.#rng.pick(pool)
    // Two candidates, nearest wins — enough to look purposeful without making
    // the whole bed converge on one flower.
    if (pool.length > 1) {
      const other = this.#rng.pick(pool)
      const d1 = Math.hypot(best.x - agent.x, best.y - agent.y)
      const d2 = Math.hypot(other.x - agent.x, other.y - agent.y)
      if (d2 < d1) best = other
    }
    agent.targetKey = best.key
  }

  #arrive(agent: Pollinator, site: FlowerSite) {
    const plant = this.state.garden.plants.find((p) => p.id === site.plantId)
    if (!plant) {
      // The plant died since the renderer last published. Without dropping the
      // site here the agent would sit on top of it re-arriving every frame,
      // because the registry is only refreshed while the bed is on screen.
      this.#byKey.delete(site.key)
      this.#sites = this.#sites.filter((s) => s.plantId !== site.plantId)
      agent.targetKey = null
      this.#chooseTarget(agent)
      return
    }

    // Delivery first, then pick up — a flower can receive pollen and donate
    // its own on the same visit, exactly as it would.
    if (agent.pollen && agent.pollenFrom && agent.pollenFrom !== plant.id) {
      plant.pollen = agent.pollen
      this.state.garden.pollinations++
      this.bus.emit('pollinated', { from: agent.pollenFrom, to: plant.id, kind: agent.kind })
    }

    agent.pollen = plant.genome
    agent.pollenFrom = plant.id
    agent.state = 'feeding'
    const [lo, hi] = TRAITS[agent.kind].feed
    agent.feedTimer = this.#rng.range(lo, hi)
  }

  tick(dt: number, state: OrganismState) {
    const agents = state.fauna.pollinators
    const capacity = this.#capacity(state)
    const wanted = this.#wantedKinds(state.circadian.daylight)
    state.fauna.capacity = capacity

    for (let i = agents.length - 1; i >= 0; i--) {
      const agent = agents[i]!
      const traits = TRAITS[agent.kind]

      // An agent is on its way out if it is surplus to capacity, or if its
      // shift has ended — a moth caught out at sunrise heads off.
      const keep = i < capacity && wanted.includes(agent.kind)
      agent.presence = damp(agent.presence, keep ? 1 : 0, 0.02, dt)
      if (!keep && agent.presence < 0.03) {
        agents.splice(i, 1)
        continue
      }

      agent.flap += dt * traits.flap * Math.PI * 2
      agent.wander += dt * (0.8 + traits.wander * 0.04)

      if (agent.state === 'feeding') {
        agent.feedTimer -= dt
        const site = agent.targetKey ? this.#byKey.get(agent.targetKey) : undefined
        if (site) {
          // Stay on the flower as it sways, with a small hovering bob.
          agent.x = damp(agent.x, site.x, 0.0005, dt)
          agent.y = damp(agent.y, site.y - 4 + Math.sin(agent.wander * 3) * 1.6, 0.0005, dt)
        }
        agent.vx *= Math.pow(0.02, dt)
        agent.vy *= Math.pow(0.02, dt)
        if (agent.feedTimer <= 0 || !site) {
          agent.state = 'seeking'
          this.#chooseTarget(agent)
        }
        continue
      }

      let site = agent.targetKey ? this.#byKey.get(agent.targetKey) : undefined
      if (!site) {
        this.#chooseTarget(agent)
        site = agent.targetKey ? this.#byKey.get(agent.targetKey) : undefined
      }

      let desiredX: number
      let desiredY: number

      if (site) {
        const dx = site.x - agent.x
        const dy = site.y - agent.y
        const dist = Math.hypot(dx, dy) || 1
        if (dist < ARRIVAL) {
          this.#arrive(agent, site)
          continue
        }
        // The wander term is perpendicular to the approach, so a butterfly
        // weaves across its own path instead of just going slowly.
        const wobble = Math.sin(agent.wander * 2.1) * traits.wander
        desiredX = (dx / dist) * traits.speed + (-dy / dist) * wobble
        desiredY = (dy / dist) * traits.speed + (dx / dist) * wobble
      } else {
        // Nothing in bloom: drift, and stay in the bed.
        desiredX = Math.cos(agent.wander * 0.7) * traits.speed * 0.5
        desiredY = Math.sin(agent.wander * 0.9) * traits.speed * 0.3
      }

      // Wind pushes the light ones around noticeably more than the bees.
      const drift = state.weather.wind * (agent.kind === 'bee' ? 14 : 38)
      desiredX += drift

      const blend = 1 - Math.pow(1 - traits.focus, dt * 8)
      agent.vx += (desiredX - agent.vx) * blend
      agent.vy += (desiredY - agent.vy) * blend

      agent.x += agent.vx * dt
      agent.y += agent.vy * dt

      // Soft walls. They turn back rather than clipping to the edge.
      if (agent.x < 10) agent.vx += 220 * dt
      else if (agent.x > BED_W - 10) agent.vx -= 220 * dt
      if (agent.y < CEILING) agent.vy += 220 * dt
      else if (agent.y > SOIL_Y - 12) agent.vy -= 220 * dt
      agent.x = clamp(agent.x, -40, BED_W + 40)
      agent.y = clamp(agent.y, CEILING - 30, SOIL_Y - 4)

      const heading = Math.atan2(agent.vy, agent.vx)
      let delta = ((heading - agent.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      delta = clamp(delta, -traits.turn * dt, traits.turn * dt)
      agent.angle += delta
    }

    this.#spawnCooldown -= dt
    if (agents.length < capacity && this.#spawnCooldown <= 0 && wanted.length) {
      this.#spawn(this.#rng.pick(wanted))
      this.#spawnCooldown = this.#rng.range(0.5, 2.6)
    }

    let carrying = 0
    for (const agent of agents) if (agent.pollen) carrying++
    state.fauna.carrying = carrying
  }
}
