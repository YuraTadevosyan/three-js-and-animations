import { plantX, SOIL_Y } from '@/lib/bed'
import { targetHeight } from '@/lib/genome'
import { clamp, damp, lerp } from '@/lib/math'
import { makeRng } from '@/lib/rng'
import type { Bus } from './bus'
import type { OrganismState, Plant, Predator, PredatorKind } from './state'

/**
 * Logistic growth rate of a colony under ideal conditions, per second.
 * Tuned so a new colony goes from barely-there to saturating in about two
 * minutes — slow enough to notice happening, fast enough to see the whole
 * cycle inside one visit.
 */
const APHID_RATE = 0.045

/** Chance per second that a clean plant picks up a colony from nowhere. */
const AMBIENT_ARRIVAL = 0.0016

/**
 * Infestation eaten per second, per feeding predator.
 *
 * This is the number that decides whether the system cycles or just saturates.
 * Total aphid growth across a full bed peaks near 0.09/s; a predator has to
 * beat that, allowing for the share of its time spent travelling rather than
 * feeding. Too low and the bed stays permanently infested — which is what the
 * first version did.
 */
const CONSUMPTION = 0.03

/**
 * Aphids make a plant miserable but never kill it. Without a floor the drain
 * outruns every recovery term and the whole bed ends up at zero vigour, brown
 * and permanently stalled.
 */
const VIGOR_FLOOR = 0.15

const MAX_PREDATORS = 5

/**
 * Aphid load below which no predator bothers turning up.
 *
 * Without a threshold the first predator arrives at the first colony and eats
 * it before it is even visible, and the bed simply never has an outbreak.
 * Prey needs a head start for a predator-prey system to have any amplitude.
 */
const FORAGING_THRESHOLD = 1.5
const OUTBREAK = 0.6
/** Below this a colony is considered gone rather than merely small. */
const EXTINCT = 0.004

const ARRIVAL = 9

interface KindTraits {
  speed: number
  turn: number
  flap: number
  /** Multiplier on CONSUMPTION. */
  appetite: number
  wander: number
  focus: number
}

/**
 * Ladybirds are the day shift: fast, direct, and they eat a great deal.
 * Lacewings take over at dusk — slower and daintier, but they keep the
 * pressure on overnight when nothing else is flying.
 */
const TRAITS: Record<PredatorKind, KindTraits> = {
  ladybird: { speed: 104, turn: 5.5, flap: 26, appetite: 1.3, wander: 12, focus: 0.85 },
  lacewing: { speed: 64, turn: 3, flap: 11, appetite: 0.75, wander: 24, focus: 0.5 },
}

let counter = 0

export class Ecology {
  #rng = makeRng((Date.now() ^ 0x7f4a7c15) >>> 0)
  #spawnCooldown = 0

  constructor(private state: OrganismState, private bus: Bus) {}

  /** Where on a plant a predator should aim: mid-canopy. */
  #plantPoint(plant: Plant): { x: number; y: number } {
    const canopy = targetHeight(plant.genome) * lerp(0.45, 1, clamp(plant.age))
    return { x: plantX(plant.x), y: SOIL_Y - canopy * 0.55 }
  }

  #wantedKind(daylight: number): PredatorKind | null {
    if (daylight > 0.3) return 'ladybird'
    if (daylight < 0.45) return 'lacewing'
    return null
  }

  #spawn(kind: PredatorKind) {
    const fromLeft = this.#rng.chance(0.5)
    this.state.ecology.predators.push({
      id: `x${(counter++).toString(36)}`,
      kind,
      x: fromLeft ? -25 : 1025,
      y: this.#rng.range(70, SOIL_Y - 50),
      vx: (fromLeft ? 1 : -1) * TRAITS[kind].speed * 0.7,
      vy: 0,
      angle: fromLeft ? 0 : Math.PI,
      flap: this.#rng.range(0, Math.PI * 2),
      state: 'hunting',
      targetId: null,
      feedTimer: 0,
      eaten: 0,
      presence: 0,
      wander: this.#rng.range(0, Math.PI * 2),
    })
    this.bus.emit('predators', { kind })
  }

  /** Aim for the worst colony, with a little noise so they don't all stack. */
  #chooseTarget(predator: Predator) {
    const plants = this.state.garden.plants.filter((p) => p.infestation > EXTINCT * 4)
    if (!plants.length) {
      predator.targetId = null
      return
    }

    let best = plants[0]!
    let bestScore = -Infinity
    for (const plant of plants) {
      const point = this.#plantPoint(plant)
      const distance = Math.hypot(point.x - predator.x, point.y - predator.y)
      // Worth going for = how much food, discounted by how far it is.
      const score = plant.infestation * 1000 - distance + this.#rng.range(0, 180)
      if (score > bestScore) {
        bestScore = score
        best = plant
      }
    }
    predator.targetId = best.id
  }

  /** Colonies grow, spread, get rained off and freeze. */
  #tickAphids(dt: number, state: OrganismState) {
    const { garden, weather } = state
    const plants = garden.plants

    // Aphids like it warm and dry, and they explode in late spring.
    const warmth = clamp((weather.temperature - 6) / 16)
    const dryness = clamp(1 - weather.wetness * 1.1)
    const season = 0.25 + weather.seasonMix.spring * 0.9 + weather.seasonMix.summer * 0.7
    const favour = warmth * (0.4 + dryness * 0.6) * season

    // Rain physically knocks them off; a hard frost ends them.
    const washOff = weather.params.precip * 0.035
    const frost = Math.max(0, 4 - weather.temperature) * 0.004

    let load = 0
    let infested = 0

    for (const plant of plants) {
      const before = plant.infestation

      if (before > EXTINCT) {
        // Logistic: fastest in the middle, stalls as the plant saturates.
        // A stressed plant supports a bigger colony than a vigorous one, but
        // the ceiling is capped — letting it approach 1 as vigour falls makes
        // the feedback positive with no brake on it.
        const ceiling = clamp(0.6 + (1 - plant.vigor) * 0.35)
        const growth = APHID_RATE * favour * before * (1 - before / ceiling)
        plant.infestation = clamp(before + (growth - washOff * before - frost) * dt)
      } else if (plant.age > 0.2 && plant.age < 1.1) {
        // Arrival: ambient, plus pressure from every infested neighbour,
        // falling off with distance across the bed.
        let pressure = AMBIENT_ARRIVAL
        for (const other of plants) {
          if (other === plant || other.infestation < 0.12) continue
          const gap = Math.abs(other.x - plant.x)
          pressure += (other.infestation * 0.02) / (0.08 + gap * 4)
        }
        // Probability per second, integrated over the frame. The `* 60` this
        // originally carried made the arrival rate depend on frame rate — a
        // 120Hz monitor got twice the aphids of a 60Hz one.
        if (this.#rng.next() < pressure * favour * dt) {
          plant.infestation = 0.05
          this.bus.emit('infested', { plant })
        }
      } else {
        plant.infestation = 0
      }

      if (before < OUTBREAK && plant.infestation >= OUTBREAK) {
        state.ecology.outbreaks++
        this.bus.emit('outbreak', { plant, load: state.ecology.aphidLoad })
      }
      if (before > EXTINCT && plant.infestation <= EXTINCT) {
        plant.infestation = 0
        this.bus.emit('cleared', { plant })
      }

      load += plant.infestation
      if (plant.infestation > 0.08) infested++
    }

    state.ecology.aphidLoad = load
    state.ecology.infested = infested

    // Aphids cost the plant. This is the loop that matters: a colony drains
    // vigour, low vigour raises the colony's ceiling, and the plant gets
    // worse until something eats them.
    for (const plant of plants) {
      if (plant.infestation <= EXTINCT) continue
      plant.vigor = Math.max(VIGOR_FLOOR, plant.vigor - plant.infestation * 0.009 * dt)
    }

  }

  #tickPredators(dt: number, state: OrganismState) {
    const { ecology, weather, circadian } = state
    const predators = ecology.predators

    const grounded = weather.params.precip > 0.25 || Math.abs(weather.wind) > 1
    const kind = this.#wantedKind(circadian.daylight)

    // The lag. Predators follow the food supply on a ~14 second time
    // constant, which is what lets the population overshoot and oscillate
    // rather than settling into a flat equilibrium.
    // Steep response, heavily lagged. Both matter: a gentle response finds an
    // equilibrium and the load just sits there, and a fast response damps the
    // system flat. High gain plus a lag longer than the prey's own growth
    // timescale is what makes the population overshoot, crash the colonies
    // below the threshold, and then have to leave.
    const target =
      grounded || !kind
        ? 0
        : clamp((ecology.aphidLoad - FORAGING_THRESHOLD) * 2.2, 0, MAX_PREDATORS)
    // ~70 second time constant, against a prey doubling time of a couple of
    // minutes. Slow to arrive, and slow to give up once the food is gone.
    ecology.pressure = damp(ecology.pressure, target, 0.986, dt)
    const capacity = Math.round(ecology.pressure)

    for (let i = predators.length - 1; i >= 0; i--) {
      const predator = predators[i]!
      const traits = TRAITS[predator.kind]

      const keep = i < capacity && !grounded && predator.kind === kind
      predator.presence = damp(predator.presence, keep ? 1 : 0, 0.02, dt)
      if (!keep && predator.presence < 0.03) {
        predators.splice(i, 1)
        continue
      }

      predator.flap += dt * traits.flap * Math.PI * 2
      predator.wander += dt * 1.1

      const plant = predator.targetId
        ? state.garden.plants.find((p) => p.id === predator.targetId)
        : undefined

      if (!plant || plant.infestation <= EXTINCT * 4) {
        // Target gone, or picked clean. Find the next worst.
        predator.state = 'hunting'
        this.#chooseTarget(predator)
      }

      const current = predator.targetId
        ? state.garden.plants.find((p) => p.id === predator.targetId)
        : undefined

      if (predator.state === 'feeding' && current) {
        const bite = CONSUMPTION * traits.appetite * dt
        const eaten = Math.min(current.infestation, bite)
        current.infestation = clamp(current.infestation - eaten)
        predator.eaten += eaten
        ecology.eaten += eaten

        const point = this.#plantPoint(current)
        // Crawl over the colony rather than hovering in one spot.
        predator.x = damp(predator.x, point.x + Math.sin(predator.wander * 1.6) * 14, 0.002, dt)
        predator.y = damp(predator.y, point.y + Math.cos(predator.wander * 1.3) * 10, 0.002, dt)
        predator.vx *= Math.pow(0.05, dt)
        predator.vy *= Math.pow(0.05, dt)

        predator.feedTimer -= dt
        if (predator.feedTimer <= 0 || current.infestation <= EXTINCT * 4) {
          predator.state = 'hunting'
          this.#chooseTarget(predator)
        }
        continue
      }

      let desiredX: number
      let desiredY: number

      if (current) {
        const point = this.#plantPoint(current)
        const dx = point.x - predator.x
        const dy = point.y - predator.y
        const distance = Math.hypot(dx, dy) || 1
        if (distance < ARRIVAL) {
          predator.state = 'feeding'
          predator.feedTimer = this.#rng.range(4, 11)
          continue
        }
        const wobble = Math.sin(predator.wander * 1.8) * traits.wander
        desiredX = (dx / distance) * traits.speed + (-dy / distance) * wobble
        desiredY = (dy / distance) * traits.speed + (dx / distance) * wobble
      } else {
        desiredX = Math.cos(predator.wander * 0.6) * traits.speed * 0.45
        desiredY = Math.sin(predator.wander * 0.8) * traits.speed * 0.3
      }

      desiredX += weather.wind * (predator.kind === 'ladybird' ? 16 : 34)

      const blend = 1 - Math.pow(1 - traits.focus, dt * 8)
      predator.vx += (desiredX - predator.vx) * blend
      predator.vy += (desiredY - predator.vy) * blend
      predator.x += predator.vx * dt
      predator.y += predator.vy * dt

      if (predator.x < 12) predator.vx += 200 * dt
      else if (predator.x > 988) predator.vx -= 200 * dt
      if (predator.y < 50) predator.vy += 200 * dt
      else if (predator.y > SOIL_Y - 14) predator.vy -= 200 * dt
      predator.x = clamp(predator.x, -45, 1045)
      predator.y = clamp(predator.y, 20, SOIL_Y - 6)

      const heading = Math.atan2(predator.vy, predator.vx)
      let delta = ((heading - predator.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      delta = clamp(delta, -traits.turn * dt, traits.turn * dt)
      predator.angle += delta
    }

    this.#spawnCooldown -= dt
    if (predators.length < capacity && this.#spawnCooldown <= 0 && kind && !grounded) {
      this.#spawn(kind)
      this.#spawnCooldown = this.#rng.range(1.5, 5)
    }
  }

  tick(dt: number, state: OrganismState) {
    this.#tickAphids(dt, state)
    this.#tickPredators(dt, state)
  }

  /** Catch colonies up after an absence, in bounded steps. */
  catchUp(seconds: number) {
    const CHUNK = 30
    let remaining = Math.min(seconds, 3600)
    let guard = 0
    while (remaining > 0.5 && guard++ < 160) {
      const step = Math.min(CHUNK, remaining)
      this.#tickAphids(step, this.state)
      remaining -= step
    }
  }
}
