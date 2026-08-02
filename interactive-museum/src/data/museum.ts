/**
 * The museum, as data.
 *
 * Geometry, lighting, audio and the HUD all read from this file — rooms are laid
 * out as a single chain along -Z, and every builder derives its wall segments,
 * doorways and light positions from these numbers. Moving a room here moves it
 * everywhere.
 */

export type RoomId = 'entrance' | 'experience' | 'projects' | 'career' | 'skills' | 'contact'

export interface RoomPalette {
  /** Floor base colour. */
  floor: string
  /** Wall base colour. */
  wall: string
  /** Ceiling base colour. */
  ceiling: string
  /** The room's signature light colour — also used by the HUD for this room. */
  accent: string
  /** Secondary light colour, used for rim/fill lights. */
  secondary: string
  /** Scene fog + clear colour while inside this room. */
  atmosphere: string
}

export interface RoomDef {
  id: RoomId
  /** Short name shown in the HUD room indicator. */
  name: string
  /** The room's museum-catalogue title. */
  title: string
  /** One line shown under the title when you enter. */
  subtitle: string
  /** Longer copy shown in the room's wall plaque. */
  plaque: string
  /** Centre of the room on the floor plane. */
  center: { x: number; z: number }
  /** Interior size — width along X, depth along Z. */
  size: { w: number; d: number }
  /** Interior height, floor to ceiling. */
  height: number
  palette: RoomPalette
  /** Ambience recipe for this room's procedural audio bed. */
  ambience: AmbienceDef
}

export interface AmbienceDef {
  /** Base drone frequency in Hz. */
  droneHz: number
  /** Harmonic offsets (in semitones) layered over the drone. */
  harmonics: number[]
  /** Lowpass cutoff for the filtered-noise bed, in Hz. */
  noiseCutoffHz: number
  /** Noise bed level, 0..1. */
  noiseLevel: number
  /** Drone level, 0..1. */
  droneLevel: number
  /** Slow LFO rate for filter movement, in Hz. */
  driftHz: number
  /** Optional sparkle: randomly triggered bell tones. */
  bells?: { scale: number[]; everyMs: [number, number]; level: number }
  /** Optional metronomic tick. */
  tick?: { bpm: number; level: number }
}

/** Interior wall/floor extents are derived from these; corridors bridge the gaps. */
export const CORRIDOR_WIDTH = 6
export const CORRIDOR_HEIGHT = 5
export const DOOR_WIDTH = 6
export const DOOR_HEIGHT = 5
export const WALL_THICKNESS = 0.6
/** Eye height of the visitor, in metres. */
export const EYE_HEIGHT = 1.7

export const ROOMS: RoomDef[] = [
  {
    id: 'entrance',
    name: 'Entrance',
    title: 'The Atrium',
    subtitle: 'Room I — where the light comes in',
    plaque:
      'You are standing in the oldest part of the building. The skylights were cut in 1908 to let the ' +
      'morning in; everything since has been arranged around where it falls. Walk on — the museum ' +
      'reads in one direction, but nothing stops you wandering back.',
    center: { x: 0, z: 0 },
    size: { w: 24, d: 24 },
    height: 11,
    palette: {
      floor: '#cdc4b4',
      wall: '#e6ddcd',
      ceiling: '#efe7d9',
      accent: '#f4cf95',
      secondary: '#fff1d8',
      atmosphere: '#1a150f',
    },
    ambience: {
      droneHz: 55,
      harmonics: [0, 7, 12],
      noiseCutoffHz: 420,
      noiseLevel: 0.1,
      droneLevel: 0.075,
      driftHz: 0.045,
    },
  },
  {
    id: 'experience',
    name: 'Experience',
    title: 'The Kinetic Hall',
    subtitle: 'Room II — motion, held still enough to look at',
    plaque:
      'Two hundred and forty brass rods, each on its own escapement, running a wave that never quite ' +
      'repeats. The hall was built around the machine rather than the other way round. Stand under it ' +
      'long enough and the period becomes audible.',
    center: { x: 0, z: -33 },
    size: { w: 26, d: 26 },
    height: 13,
    palette: {
      floor: '#1a1a2b',
      wall: '#232340',
      ceiling: '#15152a',
      accent: '#6ee7f0',
      secondary: '#a78bfa',
      atmosphere: '#0a0a18',
    },
    ambience: {
      droneHz: 73.42,
      harmonics: [0, 5, 12, 19],
      noiseCutoffHz: 700,
      noiseLevel: 0.07,
      droneLevel: 0.09,
      driftHz: 0.07,
    },
  },
  {
    id: 'projects',
    name: 'Projects',
    title: 'The Gallery',
    subtitle: 'Room III — the permanent collection',
    plaque:
      'Six works, hung at the height they were made to be seen from. The lighting is deliberately poor ' +
      'everywhere except on them. Approach a frame and it will give you its catalogue entry; the ' +
      'attendants have long since stopped doing so.',
    center: { x: 0, z: -69 },
    size: { w: 30, d: 30 },
    height: 9.5,
    palette: {
      floor: '#2a2724',
      wall: '#3a352f',
      ceiling: '#1d1a17',
      accent: '#ffd7a8',
      secondary: '#c9a978',
      atmosphere: '#0d0b09',
    },
    ambience: {
      droneHz: 49,
      harmonics: [0, 12],
      noiseCutoffHz: 1600,
      noiseLevel: 0.05,
      droneLevel: 0.045,
      driftHz: 0.03,
    },
  },
  {
    id: 'career',
    name: 'Career',
    title: 'The Long Hall',
    subtitle: 'Room IV — one thing after another',
    plaque:
      'A corridor is an honest shape for a timeline: you cannot see the end of it from the start. The ' +
      'floor line carries a pulse from the oldest stone to the newest, once every eight seconds, and ' +
      'has done since the hall was wired.',
    center: { x: 0, z: -110 },
    size: { w: 22, d: 36 },
    height: 8.5,
    palette: {
      floor: '#241d16',
      wall: '#332920',
      ceiling: '#181310',
      accent: '#e8a33d',
      secondary: '#8c5a25',
      atmosphere: '#0b0806',
    },
    ambience: {
      droneHz: 43.65,
      harmonics: [0, 7, 10],
      noiseCutoffHz: 900,
      noiseLevel: 0.06,
      droneLevel: 0.07,
      driftHz: 0.05,
      tick: { bpm: 46, level: 0.055 },
    },
  },
  {
    id: 'skills',
    name: 'Skills',
    title: 'The Constellation',
    subtitle: 'Room V — an index, floating',
    plaque:
      'Every discipline the museum has ever needed, suspended at the height it was first used. The ' +
      'curators insist the arrangement is not decorative. Nobody has been able to confirm the claim, ' +
      'and one of the lamps has been dark since the refit.',
    center: { x: 0, z: -150 },
    size: { w: 28, d: 28 },
    height: 15,
    palette: {
      floor: '#0d1117',
      wall: '#121820',
      ceiling: '#080b10',
      accent: '#7dd3fc',
      secondary: '#e0f2fe',
      atmosphere: '#04060a',
    },
    ambience: {
      droneHz: 65.41,
      harmonics: [0, 7, 14],
      noiseCutoffHz: 2400,
      noiseLevel: 0.035,
      droneLevel: 0.05,
      driftHz: 0.09,
      bells: { scale: [0, 2, 4, 7, 9, 12, 14, 16], everyMs: [1400, 5200], level: 0.09 },
    },
  },
  {
    id: 'contact',
    name: 'Contact',
    title: 'The Guest Hall',
    subtitle: 'Room VI — leave word',
    plaque:
      'The last room is the only one with a door to the outside. There is a bell on the pedestal. ' +
      'Ringing it is permitted, and on quiet days encouraged — the building answers, after a fashion.',
    center: { x: 0, z: -184 },
    size: { w: 24, d: 24 },
    height: 10.5,
    palette: {
      floor: '#2b211c',
      wall: '#3d2e26',
      ceiling: '#241a16',
      accent: '#f7c873',
      secondary: '#f6a08a',
      atmosphere: '#100a07',
    },
    ambience: {
      droneHz: 58.27,
      harmonics: [0, 4, 7, 11],
      noiseCutoffHz: 800,
      noiseLevel: 0.08,
      droneLevel: 0.085,
      driftHz: 0.035,
    },
  },
]

export const ROOM_BY_ID = new Map<RoomId, RoomDef>(ROOMS.map((r) => [r.id, r]))

/* ------------------------------------------------------------------ *
 * Room III — the permanent collection
 * ------------------------------------------------------------------ */

export interface ExhibitDef {
  id: string
  title: string
  year: string
  medium: string
  description: string
  /** Which generative pattern the canvas texture is painted with. */
  pattern: 'refraction' | 'cascade' | 'machine' | 'signal' | 'paper' | 'clock' | 'lost'
  /** Palette for the generated canvas, darkest first. */
  colors: [string, string, string]
}

export const EXHIBITS: ExhibitDef[] = [
  {
    id: 'refraction',
    title: 'Refraction Study No. 7',
    year: '2019',
    medium: 'Leaded glass, single tungsten source',
    description:
      'The seventh of nine studies, and the only one the artist kept. A single bulb, forty-one ' +
      'panes, and a rig that took four months to align. The other eight were broken up for parts.',
    pattern: 'refraction',
    colors: ['#1b2733', '#4a90b8', '#e8f4ff'],
  },
  {
    id: 'cascade',
    title: 'Cascade',
    year: '2021',
    medium: 'Suspended brass, gravity',
    description:
      'Forty thousand brass pins on nylon, released in sequence from the gallery ceiling. The work ' +
      'exists only during the ninety seconds of its fall; what hangs here is the apparatus.',
    pattern: 'cascade',
    colors: ['#241a10', '#b8863f', '#ffe6b0'],
  },
  {
    id: 'machine',
    title: 'Quiet Machine',
    year: '2016',
    medium: 'Brass, felt, escapement movement',
    description:
      'Runs continuously and does nothing. Wound weekly by the attendants. Its felt dampers were ' +
      'replaced once, in 1998, and the machine has been measurably quieter ever since.',
    pattern: 'machine',
    colors: ['#1f1c18', '#8a7a5c', '#f0e4c8'],
  },
  {
    id: 'signal',
    title: 'Signal / Noise',
    year: '2023',
    medium: 'Projection, room tone, feedback loop',
    description:
      'The projection is driven by the sound of the room it is projected into, including the sound ' +
      'of people looking at it. On an empty afternoon it settles into a flat grey.',
    pattern: 'signal',
    colors: ['#101418', '#3fb8a0', '#d9fff6'],
  },
  {
    id: 'paper',
    title: 'Paper Architecture',
    year: '2014',
    medium: 'Folded card, 1:200',
    description:
      'Eleven buildings that were designed but never built, folded from single uncut sheets. The ' +
      'architect of the third is unknown; the model was found in a drawer with no note.',
    pattern: 'paper',
    colors: ['#20201d', '#a8a08e', '#f6f1e4'],
  },
  {
    id: 'clock',
    title: 'The Long Now',
    year: '2024',
    medium: 'Generative timepiece, indefinite duration',
    description:
      'Displays a time that will be correct exactly once, ten thousand years from installation. ' +
      'The museum has committed, in writing, to keeping it wound.',
    pattern: 'clock',
    colors: ['#1a1620', '#7c6bb0', '#e6dcff'],
  },
]

export const LOST_EXHIBIT: ExhibitDef = {
  id: 'lost',
  title: 'Untitled (Recovered)',
  year: 'n.d.',
  medium: 'Unknown',
  description:
    'Found behind the west partition during the 2025 refit, unlisted in every catalogue the museum ' +
    'holds. No signature, no accession number, no record of acquisition. It has been left where it ' +
    'was found, and lit.',
  pattern: 'lost',
  colors: ['#14100c', '#6b5330', '#ffd9a0'],
}

/* ------------------------------------------------------------------ *
 * Room IV — the timeline
 * ------------------------------------------------------------------ */

export interface MilestoneDef {
  year: string
  title: string
  detail: string
}

/** Ordered oldest → newest; the hall is built back-to-front from this. */
export const MILESTONES: MilestoneDef[] = [
  {
    year: '1908',
    title: 'The skylights',
    detail: 'Six openings cut into the atrium roof. Everything after this was arranged around them.',
  },
  {
    year: '1931',
    title: 'First acquisition',
    detail: 'A single case of instruments, donated anonymously and catalogued twenty years late.',
  },
  {
    year: '1967',
    title: 'The east wing',
    detail: 'Doubled the floor area and introduced the corridor as an exhibition space in its own right.',
  },
  {
    year: '1998',
    title: 'Rewiring',
    detail: 'The floor line was laid, the felt dampers replaced, and the building got quieter.',
  },
  {
    year: '2025',
    title: 'The refit',
    detail: 'Partitions removed, one lamp left dark, and something unlisted found behind the west wall.',
  },
]

/* ------------------------------------------------------------------ *
 * Room V — the index
 * ------------------------------------------------------------------ */

export interface SkillDef {
  label: string
  /** Group drives the orb's colour and its position in the shell. */
  group: 'render' | 'craft' | 'motion' | 'sound'
}

export const SKILLS: SkillDef[] = [
  { label: 'WebGL', group: 'render' },
  { label: 'GLSL', group: 'render' },
  { label: 'Babylon.js', group: 'render' },
  { label: 'Three.js', group: 'render' },
  { label: 'Shading', group: 'render' },
  { label: 'TypeScript', group: 'craft' },
  { label: 'Solid', group: 'craft' },
  { label: 'Svelte', group: 'craft' },
  { label: 'Vue', group: 'craft' },
  { label: 'React', group: 'craft' },
  { label: 'GSAP', group: 'motion' },
  { label: 'Easing', group: 'motion' },
  { label: 'Choreography', group: 'motion' },
  { label: 'Web Audio', group: 'sound' },
  { label: 'Synthesis', group: 'sound' },
]

/** The lamp that has been dark since the refit. */
export const DARK_SKILL: SkillDef = { label: 'Curiosity', group: 'sound' }

/* ------------------------------------------------------------------ *
 * Room VI — the desk
 * ------------------------------------------------------------------ */

export interface ChannelDef {
  label: string
  handle: string
  href: string
}

/** Placeholder desk cards — swap `handle`/`href` for real ones when you want. */
export const CHANNELS: ChannelDef[] = [
  { label: 'Correspondence', handle: 'curator@museum.example', href: 'mailto:curator@museum.example' },
  { label: 'Archive', handle: 'github.com/example', href: 'https://github.com/' },
  { label: 'Visiting hours', handle: 'Tue–Sun, 10:00–18:00', href: '' },
]

/* ------------------------------------------------------------------ *
 * The things you are not told about
 * ------------------------------------------------------------------ */

export interface SecretDef {
  id: string
  room: RoomId
  /** Shown in the discovery log before you find it. */
  cipher: string
  /** Shown once found. */
  name: string
  /** The toast line when it fires. */
  reveal: string
}

export const SECRETS: SecretDef[] = [
  {
    id: 'unfold',
    room: 'entrance',
    cipher: 'The thing in the middle',
    name: 'The Atrium Unfolds',
    reveal: 'The monolith opens. It has been hinged the whole time.',
  },
  {
    id: 'inversion',
    room: 'experience',
    cipher: 'Stand where you are told not to',
    name: 'Standing Wave',
    reveal: 'You stepped into the node. The wave inverts around you.',
  },
  {
    id: 'lost',
    room: 'projects',
    cipher: 'Six hung, seven made',
    name: 'The Lost Exhibit',
    reveal: 'A seventh frame, lit for the first time since 2025.',
  },
  {
    id: 'timelapse',
    room: 'career',
    cipher: 'Start at the beginning',
    name: 'A Century in Eight Seconds',
    reveal: 'The hall runs its whole history past you at once.',
  },
  {
    id: 'supernova',
    room: 'skills',
    cipher: 'One lamp is dark',
    name: 'The Constellation Closes',
    reveal: 'The dark lamp catches. Every orb finds its neighbours.',
  },
  {
    id: 'bell',
    room: 'contact',
    cipher: 'There is a bell on the pedestal',
    name: 'The Building Answers',
    reveal: 'You rang it. Somewhere behind you, six rooms answer back.',
  },
]

export const SECRET_COUNT = SECRETS.length
