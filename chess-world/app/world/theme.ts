import { Color } from 'playcanvas'

/** One board square is one world unit. */
export const TILE = 1
export const BOARD_SIZE = 8 * TILE
export const BOARD_THICKNESS = 0.28

/** 0x88 square → world position on the board plane. */
export function squareToWorld(square: number): { x: number; z: number } {
  const file = square & 7
  const rank = 7 - (square >> 4)
  return { x: (file - 3.5) * TILE, z: (3.5 - rank) * TILE }
}

/** World position → 0x88 square, or -1 when the point is off the board. */
export function worldToSquare(x: number, z: number): number {
  const file = Math.floor(x / TILE + 4)
  const rank = Math.floor(4 - z / TILE)
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return -1
  return (7 - rank) * 16 + file
}

export const isLightSquare = (square: number): boolean => (((square & 7) + (7 - (square >> 4))) & 1) === 1

const rgb = (hex: number, alpha = 1): Color =>
  new Color(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255, alpha)

/** '#rrggbb' → Color. Anything unparseable falls back to mid grey. */
export function fromHex(hex: string): Color {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return new Color(0.5, 0.5, 0.5)
  const value = Number.parseInt(match[1]!, 16)
  return rgb(value)
}

export function toHex(color: Color): string {
  const channel = (value: number) =>
    Math.round(Math.max(0, Math.min(1, value)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`
}

const WHITE = new Color(1, 1, 1)
const BLACK = new Color(0, 0, 0)

/** Blends towards white/black without allocating a new Color per call. */
function mix(out: Color, from: Color, to: Color, amount: number): Color {
  return out.lerp(from, to, amount)
}

/**
 * The arena palette. Both armies are lit glass rather than paint: the "white"
 * side is a cold cyan and the "black" side a hot magenta, which stays readable
 * against the near-black board once bloom opens up.
 */
export const THEME = {
  background: rgb(0x04060d),
  fog: rgb(0x050912),
  ambient: rgb(0x0a1428),

  pieces: {
    white: {
      body: rgb(0xdcf6ff),
      glow: rgb(0x36d8ff),
      rim: rgb(0x9be8ff),
      particle: rgb(0x7fe9ff),
    },
    black: {
      body: rgb(0x2a1038),
      glow: rgb(0xff3ea5),
      rim: rgb(0xff8fd0),
      particle: rgb(0xff5cb8),
    },
  },

  board: {
    light: rgb(0x14233d),
    dark: rgb(0x080f1e),
    frame: rgb(0x0b1526),
    grid: rgb(0x1d4b7a),
    floor: rgb(0x060a14),
  },

  markers: {
    select: rgb(0x3ff0c8),
    move: rgb(0x3aa0ff),
    capture: rgb(0xff4d6d),
    last: rgb(0x8f6bff),
    check: rgb(0xff2d55),
    hover: rgb(0x9be8ff),
  },

  lights: {
    key: rgb(0xcfe8ff),
    whiteRim: rgb(0x1fb6ff),
    blackRim: rgb(0xff2e9a),
  },
}

export type SideKey = 'white' | 'black'

/* ---------------------------------------------------------- palettes ---- */

/**
 * The six colours a player can actually choose. Everything else in the scene —
 * piece bodies, rim light, spark colour, board frame, fog — is derived from
 * these, so a palette stays coherent however it is set.
 */
export interface PaletteValues {
  /** Glow colour of the side that moves first. */
  lightArmy: string
  darkArmy: string
  lightSquare: string
  darkSquare: string
  /** Grid lines, board rim, the glow under the board. */
  accent: string
  background: string
}

export interface Palette extends PaletteValues {
  id: string
  name: string
}

export const PALETTES: Palette[] = [
  {
    id: 'neon',
    name: 'Neon Arena',
    lightArmy: '#36d8ff',
    darkArmy: '#ff3ea5',
    lightSquare: '#14233d',
    darkSquare: '#080f1e',
    accent: '#1d4b7a',
    background: '#04060d',
  },
  {
    id: 'ember',
    name: 'Ember',
    lightArmy: '#ffc46b',
    darkArmy: '#ff4530',
    lightSquare: '#2c1a12',
    darkSquare: '#160b07',
    accent: '#8a3c1c',
    background: '#0c0503',
  },
  {
    id: 'jade',
    name: 'Jade',
    lightArmy: '#7dffc4',
    darkArmy: '#ffd166',
    lightSquare: '#122a24',
    darkSquare: '#081512',
    accent: '#1f6b52',
    background: '#040c09',
  },
  {
    id: 'arctic',
    name: 'Arctic',
    lightArmy: '#eaf6ff',
    darkArmy: '#4d7cff',
    lightSquare: '#1b2740',
    darkSquare: '#0c1220',
    accent: '#3b5a8f',
    background: '#05080f',
  },
  {
    id: 'royal',
    name: 'Royal',
    lightArmy: '#f3e2b8',
    darkArmy: '#a06bff',
    lightSquare: '#2e2440',
    darkSquare: '#160f21',
    accent: '#6b4ea8',
    background: '#0a0714',
  },
  {
    id: 'mono',
    name: 'Monochrome',
    lightArmy: '#ffffff',
    darkArmy: '#8892a6',
    lightSquare: '#1d2027',
    darkSquare: '#0c0e12',
    accent: '#4a5164',
    background: '#06070a',
  },
]

export const DEFAULT_PALETTE: PaletteValues = PALETTES[0]!

/**
 * Writes a palette into the live theme, in place, so anything that reads
 * `THEME` at the moment it runs — spark colours, new markers, materials made
 * for the next piece — picks the new colours up without being rebuilt.
 */
export function applyPaletteToTheme(values: PaletteValues): void {
  const lightArmy = fromHex(values.lightArmy)
  const darkArmy = fromHex(values.darkArmy)
  const accent = fromHex(values.accent)
  const background = fromHex(values.background)

  // The light army is lit glass: a near-white body carrying its own glow.
  THEME.pieces.white.glow.copy(lightArmy)
  mix(THEME.pieces.white.body, lightArmy, WHITE, 0.78)
  mix(THEME.pieces.white.rim, lightArmy, WHITE, 0.45)
  mix(THEME.pieces.white.particle, lightArmy, WHITE, 0.2)

  // The dark army is the same idea inverted: a deep body, a hot glow.
  THEME.pieces.black.glow.copy(darkArmy)
  mix(THEME.pieces.black.body, darkArmy, BLACK, 0.82)
  mix(THEME.pieces.black.rim, darkArmy, WHITE, 0.4)
  mix(THEME.pieces.black.particle, darkArmy, WHITE, 0.15)

  THEME.board.light.copy(fromHex(values.lightSquare))
  THEME.board.dark.copy(fromHex(values.darkSquare))
  mix(THEME.board.frame, fromHex(values.darkSquare), BLACK, 0.35)
  THEME.board.grid.copy(accent)
  THEME.board.floor.copy(background)

  THEME.background.copy(background)
  mix(THEME.fog, background, accent, 0.12)
  mix(THEME.ambient, background, accent, 0.4)

  THEME.lights.whiteRim.copy(lightArmy)
  THEME.lights.blackRim.copy(darkArmy)
  mix(THEME.lights.key, lightArmy, WHITE, 0.7)

  // Selection and last-move markers follow the board's accent so they read
  // against any palette; danger colours stay red because they mean something.
  mix(THEME.markers.last, accent, WHITE, 0.45)
  mix(THEME.markers.hover, lightArmy, WHITE, 0.5)
}
export const sideKey = (color: number): SideKey => (color === 0 ? 'white' : 'black')
