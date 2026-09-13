import type { Hsl } from '@/lib/color'

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
  seed: number
  /** Horizontal position in the bed, 0..1. */
  x: number
  /** Accumulated growth seconds — not wall-clock age. Modifiers scale it. */
  age: number
  /** 0..1 health. Drought and darkness drain it; rain restores it. */
  vigor: number
  /** How many ancestors this plant has. Generation 0 was seeded on first visit. */
  gen: number
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
