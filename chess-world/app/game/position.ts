import {
  A1, A8, BISHOP, BLACK, CASTLE_BK, CASTLE_BQ, CASTLE_WK, CASTLE_WQ, C1, C8, D1, D8, E1, E8, EMPTY,
  F1, F8, FLAG_EN_PASSANT, G1, G8, H1, H8, KING, KNIGHT, PAWN, PIECE_LETTERS, QUEEN, ROOK, STARTING_FEN,
  WHITE, type Color, type Move, type Piece, fileOf, isCastle, isEnPassant, moveCaptured, moveFlags,
  moveFrom, movePiece, movePromotion, moveTo, onBoard, other, parseSquare, piece, pieceColor,
  pieceType, rankOf, square, squareName,
} from './types'

/* --------------------------------------------------------------- zobrist -- */

/**
 * Zobrist keys are kept as two 32-bit halves because JavaScript bitwise ops are
 * 32-bit: `lo` indexes the transposition table, `hi` verifies the entry.
 * Seeded so hashes are identical between the worker and the main thread.
 */
function makeRandoms(count: number, seed: number): Int32Array {
  const out = new Int32Array(count)
  let x = seed
  for (let i = 0; i < count; i++) {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    out[i] = x | 0
  }
  return out
}

const PIECE_KEYS_LO = makeRandoms(15 * 128, 0x9e3779b9)
const PIECE_KEYS_HI = makeRandoms(15 * 128, 0x85ebca6b)
const CASTLE_KEYS_LO = makeRandoms(16, 0xc2b2ae35)
const CASTLE_KEYS_HI = makeRandoms(16, 0x27d4eb2f)
const EP_KEYS_LO = makeRandoms(8, 0x165667b1)
const EP_KEYS_HI = makeRandoms(8, 0xd3a2646c)
const TURN_KEY_LO = 0x1b873593
const TURN_KEY_HI = 0xcc9e2d51 | 0

/* ------------------------------------------------------------ directions -- */

export const KNIGHT_DELTAS = [-33, -31, -18, -14, 14, 18, 31, 33]
export const KING_DELTAS = [-17, -16, -15, -1, 1, 15, 16, 17]
export const BISHOP_DELTAS = [-17, -15, 15, 17]
export const ROOK_DELTAS = [-16, -1, 1, 16]
/** Where a pawn of each colour must stand to attack a given square. */
const PAWN_ATTACKERS: Record<Color, number[]> = { 0: [15, 17], 1: [-15, -17] }

/** Squares whose occupant changing invalidates a castling right. */
const CASTLE_MASK = new Int8Array(128).fill(15)
CASTLE_MASK[E1] = 15 & ~(CASTLE_WK | CASTLE_WQ)
CASTLE_MASK[H1] = 15 & ~CASTLE_WK
CASTLE_MASK[A1] = 15 & ~CASTLE_WQ
CASTLE_MASK[E8] = 15 & ~(CASTLE_BK | CASTLE_BQ)
CASTLE_MASK[H8] = 15 & ~CASTLE_BK
CASTLE_MASK[A8] = 15 & ~CASTLE_BQ

interface Undo {
  move: Move
  castling: number
  ep: number
  halfmove: number
  hashLo: number
  hashHi: number
  repetitionStart: number
}

/* -------------------------------------------------------------- position -- */

export class Position {
  readonly board = new Int8Array(128)
  turn: Color = WHITE
  castling = 0
  /** En-passant target square (the square *behind* the pawn), or -1. */
  ep = -1
  halfmove = 0
  fullmove = 1
  kingSq: [number, number] = [E1, E8]
  hashLo = 0
  hashHi = 0

  private readonly undoStack: Undo[] = []
  private readonly nullStack: { ep: number; hashLo: number; hashHi: number; halfmove: number }[] = []
  /**
   * Hash of every position reached so far. `repetitionStart` marks where the
   * current irreversible segment begins — everything before it can never
   * repeat, because a pawn move or a capture cannot be undone by play.
   */
  repetition: number[] = []
  repetitionStart = 0

  static fromFen(fen = STARTING_FEN): Position {
    const p = new Position()
    p.setFen(fen)
    return p
  }

  clone(): Position {
    const p = new Position()
    p.board.set(this.board)
    p.turn = this.turn
    p.castling = this.castling
    p.ep = this.ep
    p.halfmove = this.halfmove
    p.fullmove = this.fullmove
    p.kingSq = [this.kingSq[0], this.kingSq[1]]
    p.hashLo = this.hashLo
    p.hashHi = this.hashHi
    p.repetition = this.repetition.slice()
    p.repetitionStart = this.repetitionStart
    return p
  }

  setFen(fen: string): void {
    const [placement, turn, castling, ep, halfmove, fullmove] = fen.trim().split(/\s+/)
    this.board.fill(EMPTY)
    let sq = 0
    for (const ch of placement ?? '') {
      if (ch === '/') {
        sq += 8
        continue
      }
      if (ch >= '1' && ch <= '8') {
        sq += Number(ch)
        continue
      }
      const type = PIECE_LETTERS.indexOf(ch.toUpperCase())
      if (type <= 0) continue
      const color: Color = ch === ch.toUpperCase() ? WHITE : BLACK
      this.board[sq] = piece(color, type)
      if (type === KING) this.kingSq[color] = sq
      sq++
    }
    this.turn = turn === 'b' ? BLACK : WHITE
    this.castling =
      (castling?.includes('K') ? CASTLE_WK : 0) |
      (castling?.includes('Q') ? CASTLE_WQ : 0) |
      (castling?.includes('k') ? CASTLE_BK : 0) |
      (castling?.includes('q') ? CASTLE_BQ : 0)
    this.ep = ep && ep !== '-' ? parseSquare(ep) : -1
    this.halfmove = Number(halfmove ?? 0) || 0
    this.fullmove = Number(fullmove ?? 1) || 1
    this.undoStack.length = 0
    this.rehash()
    this.repetition = [this.hashLo]
    this.repetitionStart = 0
  }

  toFen(): string {
    let placement = ''
    for (let rank = 0; rank < 8; rank++) {
      let run = 0
      for (let file = 0; file < 8; file++) {
        const p = this.board[rank * 16 + file]!
        if (p === EMPTY) {
          run++
          continue
        }
        if (run) placement += run
        run = 0
        const letter = PIECE_LETTERS[pieceType(p)]!
        placement += pieceColor(p) === WHITE ? letter : letter.toLowerCase()
      }
      if (run) placement += run
      if (rank < 7) placement += '/'
    }
    const rights =
      (this.castling & CASTLE_WK ? 'K' : '') +
      (this.castling & CASTLE_WQ ? 'Q' : '') +
      (this.castling & CASTLE_BK ? 'k' : '') +
      (this.castling & CASTLE_BQ ? 'q' : '')
    return [
      placement,
      this.turn === WHITE ? 'w' : 'b',
      rights || '-',
      this.ep >= 0 ? squareName(this.ep) : '-',
      this.halfmove,
      this.fullmove,
    ].join(' ')
  }

  /** Recomputes the Zobrist hash from scratch. */
  rehash(): void {
    let lo = 0
    let hi = 0
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) continue
      const p = this.board[sq]!
      if (p === EMPTY) continue
      lo ^= PIECE_KEYS_LO[p * 128 + sq]!
      hi ^= PIECE_KEYS_HI[p * 128 + sq]!
    }
    lo ^= CASTLE_KEYS_LO[this.castling]!
    hi ^= CASTLE_KEYS_HI[this.castling]!
    if (this.ep >= 0) {
      lo ^= EP_KEYS_LO[fileOf(this.ep)]!
      hi ^= EP_KEYS_HI[fileOf(this.ep)]!
    }
    if (this.turn === BLACK) {
      lo ^= TURN_KEY_LO
      hi ^= TURN_KEY_HI
    }
    this.hashLo = lo
    this.hashHi = hi
  }

  private togglePiece(p: Piece, sq: number): void {
    this.hashLo ^= PIECE_KEYS_LO[p * 128 + sq]!
    this.hashHi ^= PIECE_KEYS_HI[p * 128 + sq]!
  }

  /** Is `sq` attacked by any piece of `by`? Used for legality and for check. */
  isAttacked(sq: number, by: Color): boolean {
    const board = this.board

    // Pawns. A white pawn on `sq + 15/17` never exists, so walk backwards from
    // the target square instead: white attacks upward, so it must sit below.
    const pawnDeltas = PAWN_ATTACKERS[by]
    const enemyPawn = piece(by, PAWN)
    for (const d of pawnDeltas) {
      const from = sq + d
      if (onBoard(from) && board[from] === enemyPawn) return true
    }

    const enemyKnight = piece(by, KNIGHT)
    for (const d of KNIGHT_DELTAS) {
      const from = sq + d
      if (onBoard(from) && board[from] === enemyKnight) return true
    }

    const enemyKing = piece(by, KING)
    for (const d of KING_DELTAS) {
      const from = sq + d
      if (onBoard(from) && board[from] === enemyKing) return true
    }

    for (const d of BISHOP_DELTAS) {
      for (let from = sq + d; onBoard(from); from += d) {
        const p = board[from]!
        if (p === EMPTY) continue
        if (pieceColor(p) === by) {
          const t = pieceType(p)
          if (t === BISHOP || t === QUEEN) return true
        }
        break
      }
    }

    for (const d of ROOK_DELTAS) {
      for (let from = sq + d; onBoard(from); from += d) {
        const p = board[from]!
        if (p === EMPTY) continue
        if (pieceColor(p) === by) {
          const t = pieceType(p)
          if (t === ROOK || t === QUEEN) return true
        }
        break
      }
    }

    return false
  }

  inCheck(color: Color = this.turn): boolean {
    return this.isAttacked(this.kingSq[color], other(color))
  }

  /* ------------------------------------------------------------- make ---- */

  makeMove(move: Move): void {
    const from = moveFrom(move)
    const to = moveTo(move)
    const moving = movePiece(move)
    const captured = moveCaptured(move)
    const color = pieceColor(moving)
    const flags = moveFlags(move)

    this.undoStack.push({
      move,
      castling: this.castling,
      ep: this.ep,
      halfmove: this.halfmove,
      hashLo: this.hashLo,
      hashHi: this.hashHi,
      repetitionStart: this.repetitionStart,
    })

    // Clear the previous en-passant file out of the hash before it changes.
    if (this.ep >= 0) {
      this.hashLo ^= EP_KEYS_LO[fileOf(this.ep)]!
      this.hashHi ^= EP_KEYS_HI[fileOf(this.ep)]!
    }

    if (captured !== EMPTY) {
      const capturedSq = flags & FLAG_EN_PASSANT ? (color === WHITE ? to + 16 : to - 16) : to
      this.board[capturedSq] = EMPTY
      this.togglePiece(captured, capturedSq)
    }

    this.board[from] = EMPTY
    this.togglePiece(moving, from)

    const promotion = movePromotion(move)
    const landed = promotion ? piece(color, promotion) : moving
    this.board[to] = landed
    this.togglePiece(landed, to)

    if (pieceType(moving) === KING) {
      this.kingSq[color] = to
      if (flags & 4) {
        // King-side: the rook jumps from the h-file to the f-file.
        const rookFrom = color === WHITE ? H1 : H8
        const rookTo = color === WHITE ? F1 : F8
        const rook = this.board[rookFrom]!
        this.board[rookFrom] = EMPTY
        this.board[rookTo] = rook
        this.togglePiece(rook, rookFrom)
        this.togglePiece(rook, rookTo)
      } else if (flags & 8) {
        const rookFrom = color === WHITE ? A1 : A8
        const rookTo = color === WHITE ? D1 : D8
        const rook = this.board[rookFrom]!
        this.board[rookFrom] = EMPTY
        this.board[rookTo] = rook
        this.togglePiece(rook, rookFrom)
        this.togglePiece(rook, rookTo)
      }
    }

    const nextCastling = this.castling & CASTLE_MASK[from]! & CASTLE_MASK[to]!
    if (nextCastling !== this.castling) {
      this.hashLo ^= CASTLE_KEYS_LO[this.castling]! ^ CASTLE_KEYS_LO[nextCastling]!
      this.hashHi ^= CASTLE_KEYS_HI[this.castling]! ^ CASTLE_KEYS_HI[nextCastling]!
      this.castling = nextCastling
    }

    this.ep = flags & 1 ? (color === WHITE ? from - 16 : from + 16) : -1
    if (this.ep >= 0) {
      this.hashLo ^= EP_KEYS_LO[fileOf(this.ep)]!
      this.hashHi ^= EP_KEYS_HI[fileOf(this.ep)]!
    }

    const irreversible = captured !== EMPTY || pieceType(moving) === PAWN
    this.halfmove = irreversible ? 0 : this.halfmove + 1
    if (color === BLACK) this.fullmove++
    this.turn = other(color)
    this.hashLo ^= TURN_KEY_LO
    this.hashHi ^= TURN_KEY_HI

    this.repetition.push(this.hashLo)
    if (irreversible) this.repetitionStart = this.repetition.length - 1
  }

  unmakeMove(): Move {
    const undo = this.undoStack.pop()
    if (!undo) return 0
    const { move } = undo
    const from = moveFrom(move)
    const to = moveTo(move)
    const moving = movePiece(move)
    const captured = moveCaptured(move)
    const color = pieceColor(moving)
    const flags = moveFlags(move)

    this.board[from] = moving
    this.board[to] = EMPTY

    if (pieceType(moving) === KING) {
      this.kingSq[color] = from
      if (flags & 4) {
        const rookFrom = color === WHITE ? H1 : H8
        const rookTo = color === WHITE ? F1 : F8
        this.board[rookFrom] = this.board[rookTo]!
        this.board[rookTo] = EMPTY
      } else if (flags & 8) {
        const rookFrom = color === WHITE ? A1 : A8
        const rookTo = color === WHITE ? D1 : D8
        this.board[rookFrom] = this.board[rookTo]!
        this.board[rookTo] = EMPTY
      }
    }

    if (captured !== EMPTY) {
      const capturedSq = flags & FLAG_EN_PASSANT ? (color === WHITE ? to + 16 : to - 16) : to
      this.board[capturedSq] = captured
    }

    this.castling = undo.castling
    this.ep = undo.ep
    this.halfmove = undo.halfmove
    this.hashLo = undo.hashLo
    this.hashHi = undo.hashHi
    if (color === BLACK) this.fullmove--
    this.turn = color
    this.repetition.pop()
    this.repetitionStart = undo.repetitionStart
    return move
  }

  /**
   * Hands the opponent a free move. Used by null-move pruning in the search;
   * the hash is updated properly so transposition entries stay honest, and the
   * position is *not* recorded for repetition, since it never really occurred.
   */
  makeNullMove(): void {
    this.nullStack.push({ ep: this.ep, hashLo: this.hashLo, hashHi: this.hashHi, halfmove: this.halfmove })
    if (this.ep >= 0) {
      this.hashLo ^= EP_KEYS_LO[fileOf(this.ep)]!
      this.hashHi ^= EP_KEYS_HI[fileOf(this.ep)]!
    }
    this.ep = -1
    this.halfmove++
    this.turn = other(this.turn)
    this.hashLo ^= TURN_KEY_LO
    this.hashHi ^= TURN_KEY_HI
  }

  unmakeNullMove(): void {
    const undo = this.nullStack.pop()
    if (!undo) return
    this.ep = undo.ep
    this.hashLo = undo.hashLo
    this.hashHi = undo.hashHi
    this.halfmove = undo.halfmove
    this.turn = other(this.turn)
  }

  get ply(): number {
    return this.undoStack.length
  }

  /** How many times the current position has occurred since the last capture
   * or pawn move — three means a draw is claimable. */
  repetitionCount(): number {
    let count = 0
    for (let i = this.repetitionStart; i < this.repetition.length; i++) {
      if (this.repetition[i] === this.hashLo) count++
    }
    return count
  }

  /**
   * True only for material that cannot deliver mate even with help from a
   * cooperative opponent: bare kings, king + one minor, or any number of
   * bishops all on one colour complex. Two knights are excluded — mate is
   * possible there, just not forcible.
   */
  insufficientMaterial(): boolean {
    let minors = 0
    let knights = 0
    let bishopParity = -1
    let bishopsMixed = false
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) continue
      const p = this.board[sq]!
      if (p === EMPTY) continue
      const type = pieceType(p)
      if (type === KING) continue
      if (type === PAWN || type === ROOK || type === QUEEN) return false
      minors++
      if (type === KNIGHT) {
        knights++
        continue
      }
      const parity = (fileOf(sq) + rankOf(sq)) & 1
      if (bishopParity < 0) bishopParity = parity
      else if (bishopParity !== parity) bishopsMixed = true
    }
    if (minors <= 1) return true
    return knights === 0 && !bishopsMixed
  }

}

export { square, squareName }
