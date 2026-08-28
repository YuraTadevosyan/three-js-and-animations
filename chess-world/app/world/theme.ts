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
} as const

export type SideKey = 'white' | 'black'
export const sideKey = (color: number): SideKey => (color === 0 ? 'white' : 'black')
