import { Position } from './position'
import {
  BISHOP, BLACK, EMPTY, KING, KNIGHT, PAWN, QUEEN, ROOK, WHITE, type Color, fileOf, pieceColor,
  pieceType, rankOf,
} from './types'

export const PIECE_VALUE = [0, 100, 320, 330, 500, 900, 0]

/**
 * Piece-square tables, written from White's point of view with rank 8 first —
 * which is exactly the 0x88 row order, so the index for White is
 * `(sq >> 4) * 8 + file` and Black reads the same table mirrored vertically.
 */
const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
]

const PST_KNIGHT = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50,
]

const PST_BISHOP = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5, 10, 10,  5,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20,
]

const PST_ROOK = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
]

const PST_QUEEN = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20,
]

const PST_KING_MID = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20,
]

const PST_KING_END = [
 -50,-40,-30,-20,-20,-30,-40,-50,
 -30,-20,-10,  0,  0,-10,-20,-30,
 -30,-10, 20, 30, 30, 20,-10,-30,
 -30,-10, 30, 40, 40, 30,-10,-30,
 -30,-10, 30, 40, 40, 30,-10,-30,
 -30,-10, 20, 30, 30, 20,-10,-30,
 -30,-30,  0,  0,  0,  0,-30,-30,
 -50,-30,-30,-30,-30,-30,-30,-50,
]

const PST = [null, PST_PAWN, PST_KNIGHT, PST_BISHOP, PST_ROOK, PST_QUEEN, PST_KING_MID]

/** Phase weights: the game is "endgame" once the heavy pieces are gone. */
const PHASE_WEIGHT = [0, 0, 1, 1, 2, 4, 0]
const MAX_PHASE = 24

const DOUBLED_PAWN = -12
const ISOLATED_PAWN = -16
const PASSED_PAWN_BY_RANK = [0, 5, 10, 20, 35, 60, 100, 0]
const BISHOP_PAIR = 32
const ROOK_OPEN_FILE = 18
const ROOK_HALF_OPEN_FILE = 8

/**
 * Static evaluation in centipawns, from the point of view of the side to move
 * (negamax convention). Material and piece-square tables carry most of it;
 * pawn structure, the bishop pair and rook files stop it playing nonsense.
 */
export function evaluate(pos: Position): number {
  const board = pos.board
  let mid = 0
  let end = 0
  let phase = 0

  const pawnFiles = [new Int8Array(8), new Int8Array(8)]
  const pawnSquares: number[][] = [[], []]
  const bishops = [0, 0]
  const rooks: number[][] = [[], []]

  for (let sq = 0; sq < 128; sq++) {
    if (sq & 0x88) continue
    const p = board[sq]!
    if (p === EMPTY) continue
    const color = pieceColor(p)
    const type = pieceType(p)
    const sign = color === WHITE ? 1 : -1
    const index = color === WHITE ? (sq >> 4) * 8 + fileOf(sq) : (7 - (sq >> 4)) * 8 + fileOf(sq)

    phase += PHASE_WEIGHT[type]!
    const material = PIECE_VALUE[type]!

    if (type === KING) {
      mid += sign * (material + PST_KING_MID[index]!)
      end += sign * (material + PST_KING_END[index]!)
    } else {
      const positional = PST[type]![index]!
      mid += sign * (material + positional)
      end += sign * (material + positional)
    }

    if (type === PAWN) {
      pawnFiles[color]![fileOf(sq)]!++
      pawnSquares[color]!.push(sq)
    } else if (type === BISHOP) {
      bishops[color]!++
    } else if (type === ROOK) {
      rooks[color]!.push(sq)
    }
  }

  for (const color of [WHITE, BLACK] as Color[]) {
    const sign = color === WHITE ? 1 : -1
    const ours = pawnFiles[color]!
    const theirs = pawnFiles[color ^ 1]!

    for (let file = 0; file < 8; file++) {
      const count = ours[file]!
      if (count > 1) {
        const penalty = sign * DOUBLED_PAWN * (count - 1)
        mid += penalty
        end += penalty
      }
      if (count > 0 && (file === 0 || ours[file - 1] === 0) && (file === 7 || ours[file + 1] === 0)) {
        mid += sign * ISOLATED_PAWN
        end += sign * ISOLATED_PAWN
      }
    }

    for (const sq of pawnSquares[color]!) {
      const file = fileOf(sq)
      const rank = rankOf(sq)
      const relativeRank = color === WHITE ? rank : 7 - rank
      let passed = true
      for (const enemy of pawnSquares[color ^ 1]!) {
        const enemyFile = fileOf(enemy)
        if (Math.abs(enemyFile - file) > 1) continue
        const enemyRank = rankOf(enemy)
        const ahead = color === WHITE ? enemyRank > rank : enemyRank < rank
        if (ahead) {
          passed = false
          break
        }
      }
      if (passed) {
        const bonus = PASSED_PAWN_BY_RANK[relativeRank]!
        mid += sign * bonus
        end += sign * bonus * 2
      }
    }

    if (bishops[color]! >= 2) {
      mid += sign * BISHOP_PAIR
      end += sign * BISHOP_PAIR
    }

    for (const sq of rooks[color]!) {
      const file = fileOf(sq)
      if (ours[file] === 0) {
        const bonus = theirs[file] === 0 ? ROOK_OPEN_FILE : ROOK_HALF_OPEN_FILE
        mid += sign * bonus
        end += sign * bonus
      }
    }
  }

  const clamped = Math.min(phase, MAX_PHASE)
  const score = (mid * clamped + end * (MAX_PHASE - clamped)) / MAX_PHASE
  return pos.turn === WHITE ? score : -score
}

/** 0 = deep endgame, 1 = full board. Drives camera and lighting mood too. */
export function gamePhase(pos: Position): number {
  let phase = 0
  for (let sq = 0; sq < 128; sq++) {
    if (sq & 0x88) continue
    const p = pos.board[sq]!
    if (p !== EMPTY) phase += PHASE_WEIGHT[pieceType(p)]!
  }
  return Math.min(phase, MAX_PHASE) / MAX_PHASE
}

export { KNIGHT, QUEEN }
