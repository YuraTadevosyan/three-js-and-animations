import { BISHOP_DELTAS, KING_DELTAS, KNIGHT_DELTAS, Position, ROOK_DELTAS } from './position'
import {
  BISHOP, BLACK, C1, C8, CASTLE_BK, CASTLE_BQ, CASTLE_WK, CASTLE_WQ, D1, D8, E1, E8, EMPTY,
  FLAG_CASTLE_KING, FLAG_CASTLE_QUEEN, FLAG_DOUBLE_PAWN, FLAG_EN_PASSANT, F1, F8, G1, G8, KING,
  KNIGHT, PAWN, QUEEN, ROOK, WHITE, type Color, type Move, encodeMove, moveFrom, movePiece, moveTo,
  movePromotion, onBoard, other, piece, pieceColor, pieceType, square,
} from './types'

const B1 = square(1, 0)
const B8 = square(1, 7)

const SLIDERS: Record<number, number[]> = {
  [BISHOP]: BISHOP_DELTAS,
  [ROOK]: ROOK_DELTAS,
  [QUEEN]: KING_DELTAS,
}

const PROMOTION_TYPES = [QUEEN, ROOK, BISHOP, KNIGHT]

/**
 * Pseudo-legal moves for the side to move: everything that respects how the
 * pieces move, but which may still leave the king in check. `capturesOnly`
 * restricts the list to captures and promotions for quiescence search.
 */
export function generateMoves(pos: Position, capturesOnly = false): Move[] {
  const moves: Move[] = []
  const board = pos.board
  const us = pos.turn
  const them = other(us)
  const forward = us === WHITE ? -16 : 16
  const startRank = us === WHITE ? 6 : 1
  const promoRank = us === WHITE ? 0 : 7

  for (let from = 0; from < 128; from++) {
    if (from & 0x88) continue
    const moving = board[from]!
    if (moving === EMPTY || pieceColor(moving) !== us) continue
    const type = pieceType(moving)

    if (type === PAWN) {
      const one = from + forward
      if (onBoard(one) && board[one] === EMPTY) {
        if ((one >> 4) === promoRank) {
          for (const promo of PROMOTION_TYPES) moves.push(encodeMove(from, one, moving, EMPTY, promo))
        } else if (!capturesOnly) {
          moves.push(encodeMove(from, one, moving))
          const two = one + forward
          if ((from >> 4) === startRank && board[two] === EMPTY) {
            moves.push(encodeMove(from, two, moving, EMPTY, 0, FLAG_DOUBLE_PAWN))
          }
        }
      }
      for (const side of [-1, 1]) {
        const to = from + forward + side
        if (!onBoard(to)) continue
        const target = board[to]!
        if (target !== EMPTY && pieceColor(target) === them) {
          if ((to >> 4) === promoRank) {
            for (const promo of PROMOTION_TYPES) moves.push(encodeMove(from, to, moving, target, promo))
          } else {
            moves.push(encodeMove(from, to, moving, target))
          }
        } else if (to === pos.ep && target === EMPTY) {
          moves.push(encodeMove(from, to, moving, piece(them, PAWN), 0, FLAG_EN_PASSANT))
        }
      }
      continue
    }

    if (type === KNIGHT || type === KING) {
      const deltas = type === KNIGHT ? KNIGHT_DELTAS : KING_DELTAS
      for (const d of deltas) {
        const to = from + d
        if (!onBoard(to)) continue
        const target = board[to]!
        if (target === EMPTY) {
          if (!capturesOnly) moves.push(encodeMove(from, to, moving))
        } else if (pieceColor(target) === them) {
          moves.push(encodeMove(from, to, moving, target))
        }
      }
      continue
    }

    for (const d of SLIDERS[type]!) {
      for (let to = from + d; onBoard(to); to += d) {
        const target = board[to]!
        if (target === EMPTY) {
          if (!capturesOnly) moves.push(encodeMove(from, to, moving))
          continue
        }
        if (pieceColor(target) === them) moves.push(encodeMove(from, to, moving, target))
        break
      }
    }
  }

  if (!capturesOnly) addCastles(pos, moves, us, them)
  return moves
}

function addCastles(pos: Position, moves: Move[], us: Color, them: Color): void {
  const board = pos.board
  const king = piece(us, KING)
  const kingSq = us === WHITE ? E1 : E8
  if (board[kingSq] !== king) return
  // The king may not start in, or pass through, an attacked square. Landing on
  // one is caught by the legality filter that every move goes through anyway.
  if (pos.isAttacked(kingSq, them)) return

  const kingSide = us === WHITE ? CASTLE_WK : CASTLE_BK
  const queenSide = us === WHITE ? CASTLE_WQ : CASTLE_BQ
  const [f, g, d, c, b] = us === WHITE ? [F1, G1, D1, C1, B1] : [F8, G8, D8, C8, B8]

  if (pos.castling & kingSide && board[f!] === EMPTY && board[g!] === EMPTY && !pos.isAttacked(f!, them)) {
    moves.push(encodeMove(kingSq, g!, king, EMPTY, 0, FLAG_CASTLE_KING))
  }
  if (
    pos.castling & queenSide &&
    board[d!] === EMPTY &&
    board[c!] === EMPTY &&
    board[b!] === EMPTY &&
    !pos.isAttacked(d!, them)
  ) {
    moves.push(encodeMove(kingSq, c!, king, EMPTY, 0, FLAG_CASTLE_QUEEN))
  }
}

/** Does this pseudo-legal move leave our own king safe? */
export function isLegal(pos: Position, move: Move): boolean {
  const us = pieceColor(movePiece(move))
  pos.makeMove(move)
  const ok = !pos.isAttacked(pos.kingSq[us], other(us))
  pos.unmakeMove()
  return ok
}

export function generateLegalMoves(pos: Position): Move[] {
  const legal: Move[] = []
  for (const move of generateMoves(pos)) if (isLegal(pos, move)) legal.push(move)
  return legal
}

/** Legal moves for one origin square — what the board highlights on select. */
export function movesFrom(pos: Position, from: number): Move[] {
  return generateLegalMoves(pos).filter((m) => moveFrom(m) === from)
}

export function findMove(pos: Position, from: number, to: number, promotion = 0): Move | null {
  for (const m of generateLegalMoves(pos)) {
    if (moveFrom(m) !== from || moveTo(m) !== to) continue
    if (promotion && movePromotion(m) !== promotion) continue
    return m
  }
  return null
}
