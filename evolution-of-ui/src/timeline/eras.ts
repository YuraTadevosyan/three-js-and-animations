/**
 * The whole page is one number.
 *
 * Scrolling the track moves `t` from 0 to T_MAX. In browsers with CSS
 * scroll-driven animations, `t` is a registered custom property (`--t`)
 * animated by a view timeline, so every transition on the page is a pure
 * function of scroll position and needs no JavaScript at all. Elsewhere the
 * boot script (./boot.ts) writes the same number from a scroll listener.
 *
 * Integer-ish values of `t` are the eras; the fractions between them are the
 * transitions. All the CSS in `src/eras/**` is written against these numbers,
 * so if you move a dwell window, grep the era's stylesheet for its bounds.
 */

export type EraId = 'dos' | 'win95' | 'web2' | 'material' | 'glass' | 'scifi'
export type LayerId = EraId | 'intro' | 'outro'

export const T_MAX = 7

/**
 * Visibility windows. Outside its window a layer is `visibility: hidden`: not
 * painted, not hit-testable, not in the accessibility tree. Each window is a
 * little wider than the layer's visible transition so nothing pops.
 */
export const LIVE: Record<LayerId, readonly [number, number]> = {
  intro: [0, 0.5],
  dos: [0.25, 1.95],
  win95: [1.55, 3.05],
  web2: [2.55, 4.05],
  material: [3.6, 5.05],
  glass: [4.55, 6.05],
  scifi: [5.58, 7],
  outro: [6.6, 7],
}

export interface Era {
  id: EraId
  year: number
  name: string
  /** The stretch of `t` where the era sits still and can be used. */
  dwell: readonly [number, number]
  /** Scroll-snap target and rail anchor. */
  snap: number
  blurb: string
  tryIt: string
}

export const ERAS: readonly Era[] = [
  {
    id: 'dos',
    year: 1980,
    name: 'DOS',
    dwell: [0.62, 1.4],
    snap: 1,
    blurb:
      'The command line. Eighty columns, twenty-five rows, and a cursor that waits for you to already know the right words.',
    tryIt: 'Click the screen and type HELP, EDIT, VIEW LAKE.PCX, PLAY SONG.MUS or SNAKE.',
  },
  {
    id: 'win95',
    year: 1995,
    name: 'Windows 95',
    dwell: [2, 2.6],
    snap: 2.3,
    blurb:
      'The desktop metaphor goes mainstream. Windows, icons, a Start button, and the idea that you could find things by looking instead of remembering.',
    tryIt: 'Paint on the lake: it stays painted in every decade after this. Play song.mid, then scroll on and keep listening.',
  },
  {
    id: 'web2',
    year: 2005,
    name: 'Web 2.0',
    dwell: [3, 3.6],
    snap: 3.3,
    blurb:
      'The browser becomes the app. Glossy gradients, rounded corners, reflections, beta badges and AJAX spinners. Everything wants to be clicked.',
    tryIt: 'Update your status (it rewrites the note), press play on notr radio, rate the photo.',
  },
  {
    id: 'material',
    year: 2015,
    name: 'Material Design',
    dwell: [4, 4.6],
    snap: 4.3,
    blurb:
      'Gloss is flattened into paper and ink. Bold colour, a strict grid, and shadows that mean elevation rather than decoration. Motion explains what just happened.',
    tryIt: 'Tap anything for an ink ripple. Archive a message, then UNDO.',
  },
  {
    id: 'glass',
    year: 2025,
    name: 'Glassmorphism',
    dwell: [5, 5.6],
    snap: 5.3,
    blurb:
      'Depth returns as light instead of texture: translucent panels, background blur and specular edges floating over vivid colour.',
    tryIt: 'Move the pointer across the panels. Turn Wi-Fi off, then see what 2040 says.',
  },
  {
    id: 'scifi',
    year: 2040,
    name: 'Sci-Fi UI',
    dwell: [6.05, 6.6],
    snap: 6.3,
    blurb:
      'Speculative. The screen dissolves into space: data as light, an interface you talk to, and a photo you can walk around.',
    tryIt: 'Drag the hologram. Ask NEXUS to “play the song”. Answer Mom.',
  },
]

/** Where the page begins and ends, for the rail and the snap points. */
export const INTRO_SNAP = 0
export const OUTRO_SNAP = T_MAX

/**
 * The year shown in the rail, as (t, year) keyframes. It holds still through
 * each dwell and counts through each transition.
 */
export const YEAR_KEYS: readonly (readonly [number, number])[] = [
  [1.4, 1980],
  [2, 1995],
  [2.6, 1995],
  [3, 2005],
  [3.6, 2005],
  [4, 2015],
  [4.6, 2015],
  [5, 2025],
  [5.6, 2025],
  [6.05, 2040],
]

/**
 * The same curve as a CSS expression, so the counter can run with no JS:
 * a registered `<integer>` property rounds whatever calc() hands it.
 */
export function yearCalc(): string {
  const terms: string[] = []
  for (let i = 1; i < YEAR_KEYS.length; i++) {
    const [t0, y0] = YEAR_KEYS[i - 1]
    const [t1, y1] = YEAR_KEYS[i]
    if (y1 === y0) continue
    terms.push(`${y1 - y0} * clamp(0, (var(--t) - ${t0}) / ${+(t1 - t0).toFixed(3)}, 1)`)
  }
  return `calc(${YEAR_KEYS[0][1]} + ${terms.join(' + ')})`
}

/** JS twin of yearCalc(), for anything that needs the number itself. */
export function yearAt(t: number): number {
  let y = YEAR_KEYS[0][1]
  for (let i = 1; i < YEAR_KEYS.length; i++) {
    const [t0, y0] = YEAR_KEYS[i - 1]
    const [t1, y1] = YEAR_KEYS[i]
    y += (y1 - y0) * Math.min(1, Math.max(0, (t - t0) / (t1 - t0)))
  }
  return Math.round(y)
}

export const eraById = (id: EraId): Era => ERAS.find((e) => e.id === id)!
