import type { Hsl } from '@/lib/color'
import type { Genome } from '@/lib/genome'
import type { SeasonMix } from './circadian'

export type Mood = 'alert' | 'awake' | 'drowsy' | 'asleep'

export type WeatherId =
  | 'clear'
  | 'fair'
  | 'cloudy'
  | 'overcast'
  | 'mist'
  | 'drizzle'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'aurora'

/** Continuous, smoothable description of the sky. Renderers only read these. */
export interface WeatherParams {
  cloud: number
  precip: number
  snowiness: number
  fog: number
  wind: number
  gloom: number
  aurora: number
  thunder: number
}

export interface Palette {
  background: Hsl
  foreground: Hsl
  card: Hsl
  cardForeground: Hsl
  muted: Hsl
  mutedForeground: Hsl
  border: Hsl
  primary: Hsl
  primaryForeground: Hsl
  accent: Hsl
  accentForeground: Hsl
  canopy: Hsl
  soil: Hsl
  glow: Hsl
  skyTop: Hsl
  skyMid: Hsl
  skyBottom: Hsl
  sun: Hsl
}

export type Species = 'fern' | 'vine' | 'bloom' | 'reed' | 'succulent'

export type Stage = 'seed' | 'sprout' | 'juvenile' | 'mature' | 'flowering' | 'seeding' | 'fading'

export interface Plant {
  id: string
  /** Drives the per-branch jitter only. The genome decides what the plant *is*. */
  seed: number
  genome: Genome
  /** Horizontal position in the bed, 0..1. */
  x: number
  /** Accumulated growth seconds — not wall-clock age. Modifiers scale it. */
  age: number
  /** 0..1 health. Drought and darkness drain it; rain restores it. */
  vigor: number
  /** How many ancestors this plant has. Generation 0 was seeded on first visit. */
  gen: number
  /**
   * Genome delivered by a pollinator from another plant, held until this one
   * goes to seed. Null means any seed it drops will be a self-seed.
   */
  pollen: Genome | null
  /** The two species that produced this plant, when it came from a cross. */
  parents: [Species, Species] | null
  /**
   * 0..1 aphid colony size, relative to what this plant can support. Drains
   * vigour, slows growth, and past about half suppresses flowering entirely.
   */
  infestation: number
}

export type PredatorKind = 'ladybird' | 'lacewing'

export interface Predator {
  id: string
  kind: PredatorKind
  /** Position and velocity in bed units (see lib/bed.ts). */
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  flap: number
  state: 'hunting' | 'feeding'
  targetId: string | null
  feedTimer: number
  /** Total infestation this individual has eaten, for the readout. */
  eaten: number
  /** 0..1 fade, so they arrive and leave rather than popping. */
  presence: number
  wander: number
}

export type PollinatorKind = 'bee' | 'butterfly' | 'moth'

export interface Pollinator {
  id: string
  kind: PollinatorKind
  /** Position and velocity in bed units (see lib/bed.ts). */
  x: number
  y: number
  vx: number
  vy: number
  /** Heading in radians, smoothed so they bank into turns. */
  angle: number
  /** Wingbeat phase. */
  flap: number
  state: 'seeking' | 'feeding'
  targetKey: string | null
  feedTimer: number
  /** Plant the carried pollen came from, so it is never delivered back. */
  pollenFrom: string | null
  pollen: Genome | null
  /** 0..1 fade, so they arrive and leave rather than popping. */
  presence: number
  wander: number
}

export interface OrganismState {
  prefs: { reducedMotion: boolean }

  viewport: {
    w: number
    h: number
    scrollY: number
    /** 0..1 through the whole document. */
    scrollProgress: number
    /** Smoothed scroll speed in px/s, signed. */
    scrollVelocity: number
  }

  time: {
    /** Wall clock ms. */
    now: number
    /** Seconds since the heartbeat started. */
    elapsed: number
    /** Seconds since the previous tick, clamped. */
    dt: number
    /** Decimal local hour, 0..24 — or the scrubbed hour when overridden. */
    hour: number
    /** Non-null when the visitor has taken manual control of the sun. */
    scrub: number | null
  }

  breath: {
    /** 0..1 sawtooth through one full breath. */
    phase: number
    /** -1..1, the eased in/out curve everything rides on. */
    value: number
    /** Breaths per minute. Rises with excitement, falls with sleep. */
    rate: number
    /** 0..1 amplitude, collapsed under prefers-reduced-motion. */
    depth: number
    /** Completed breaths since load. */
    count: number
  }

  circadian: {
    hour: number
    sunrise: number
    sunset: number
    /** -1..1. Above 0 the sun is up. */
    elevation: number
    /** 0..1 usable light. */
    daylight: number
    /** Sun/moon screen position, both 0..1. */
    sunX: number
    sunY: number
    phase: string
    palette: Palette
  }

  weather: {
    current: WeatherId
    since: number
    /** Seconds this system will hold before rolling again. */
    dwell: number
    /** Smoothed, renderable values. */
    params: WeatherParams
    /** Where `params` is heading. */
    target: WeatherParams
    /** Signed wind including gusts, roughly -1.6..1.6. */
    wind: number
    /** 0..1 ground moisture. Climbs in rain, dries in sun. */
    wetness: number
    /** Rough °C, driven by season and daylight. */
    temperature: number
    season: 'winter' | 'spring' | 'summer' | 'autumn'
    /** Continuous season weights, so nothing steps on the first of a month. */
    seasonMix: SeasonMix
    /** 0..1 snow lying on the ground. Builds while it falls, melts above zero. */
    snowpack: number
    /** Rises to 1 on a lightning strike, then decays. */
    flash: number
  }

  attention: {
    /** Viewport pixels. */
    x: number
    y: number
    /** Normalised -1..1 from the viewport centre. */
    nx: number
    ny: number
    inside: boolean
    /** Smoothed pointer speed in px/s. */
    speed: number
    idleMs: number
    mood: Mood
    /**
     * 0..1. Climbs once the page has been asleep a while and drains the moment
     * you move. Drives how far the sky is allowed to wander off-palette.
     */
    dream: number
    /** 0..1 arousal, an EMA of how much you have been moving. */
    excitement: number
    /** Number of distinct interactions this visit. */
    interactions: number
  }

  garden: {
    plants: Plant[]
    /** 0..1 soil quality — rises while it rains, dips in drought. */
    fertility: number
    /** Plants that have completed a full life cycle this session. */
    generations: number
    /** Plants in the bed that came from a cross rather than a self-seed. */
    hybrids: number
    /** Successful pollen deliveries, across every visit. */
    pollinations: number
  }

  ecology: {
    predators: Predator[]
    /** Summed infestation across the bed. Drives how many predators arrive. */
    aphidLoad: number
    /**
     * A lagged follower of the aphid load. The lag is deliberate: predators
     * that tracked prey instantly would damp the system to a flat line
     * instead of letting it oscillate.
     */
    pressure: number
    /** Plants currently carrying a colony worth seeing. */
    infested: number
    /** Colonies that crossed the outbreak threshold this visit. */
    outbreaks: number
    /** Total infestation eaten by predators, across every visit. */
    eaten: number
  }

  fauna: {
    pollinators: Pollinator[]
    /** Flowers currently open and worth visiting. */
    flowers: number
    /** How many pollinators the current conditions support. */
    capacity: number
    /** Pollen currently being carried between plants. */
    carrying: number
  }

  vitals: {
    fps: number
    /** Seconds since this organism was first visited, across all visits. */
    age: number
    visits: number
    ticks: number
    /** Live count of mounted custom elements. */
    organs: number
  }
}
