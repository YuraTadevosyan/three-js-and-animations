import { findMove, generateLegalMoves } from './movegen'
import { Position } from './position'
import { fromSan, toSan } from './san'
import {
  BLACK, EMPTY, FLAG_CASTLE_KING, FLAG_CASTLE_QUEEN, KING, PAWN, QUEEN, STARTING_FEN, WHITE,
  type Color, type Move, isEnPassant, moveCaptured, moveFlags, moveFrom, movePiece, movePromotion,
  moveTo, pieceColor, pieceType, squareName,
} from './types'

export type Outcome = 'checkmate' | 'stalemate' | 'fifty-move' | 'repetition' | 'insufficient'

export interface GameStatus {
  over: boolean
  outcome: Outcome | null
  /** Winner on checkmate, null on any draw or while the game is running. */
  winner: Color | null
  inCheck: boolean
  turn: Color
}

/**
 * Everything the renderer needs to choreograph one move without re-deriving it
 * from the board: who moved, from where, what died and on which square (which
 * is *not* the destination for en passant), and whether a rook came along.
 */
export interface MoveRecord {
  move: Move
  san: string
  ply: number
  moveNumber: number
  color: Color
  piece: number
  pieceType: number
  from: number
  to: number
  captured: number
  capturedSquare: number
  promotion: number
  castle: { rookFrom: number; rookTo: number } | null
  check: boolean
  mate: boolean
  /** Position after the move, so Cinema can seek without replaying. */
  fen: string
}

export interface BoardPiece {
  square: number
  piece: number
  type: number
  color: Color
}

export class ChessGame {
  position: Position
  history: MoveRecord[] = []
  private future: Move[] = []

  constructor(fen: string = STARTING_FEN) {
    this.position = Position.fromFen(fen)
  }

  reset(fen: string = STARTING_FEN): void {
    this.position.setFen(fen)
    this.history = []
    this.future = []
  }

  get turn(): Color {
    return this.position.turn
  }

  get fen(): string {
    return this.position.toFen()
  }

  legalMoves(): Move[] {
    return generateLegalMoves(this.position)
  }

  movesFrom(square: number): Move[] {
    return this.legalMoves().filter((m) => moveFrom(m) === square)
  }

  /** Legal move matching from → to, or null. Promotion defaults to a queen. */
  find(from: number, to: number, promotion = 0): Move | null {
    return findMove(this.position, from, to, promotion) ?? (promotion ? null : findMove(this.position, from, to, QUEEN))
  }

  /** True when a from → to move needs the player to choose a promotion piece. */
  needsPromotion(from: number, to: number): boolean {
    return this.movesFrom(from).some((m) => moveTo(m) === to && movePromotion(m) !== 0)
  }

  play(move: Move): MoveRecord {
    const record = this.describe(move)
    this.position.makeMove(move)
    this.history.push(record)
    this.future = []
    return record
  }

  playSan(san: string): MoveRecord | null {
    const move = fromSan(this.position, san)
    return move === null ? null : this.play(move)
  }

  undo(): MoveRecord | null {
    const record = this.history.pop()
    if (!record) return null
    this.position.unmakeMove()
    this.future.push(record.move)
    return record
  }

  redo(): MoveRecord | null {
    const move = this.future.pop()
    if (move === undefined) return null
    const record = this.describe(move)
    this.position.makeMove(move)
    this.history.push(record)
    return record
  }

  canRedo(): boolean {
    return this.future.length > 0
  }

  /** Builds the record for a move that has *not* been played yet. */
  private describe(move: Move): MoveRecord {
    const pos = this.position
    const from = moveFrom(move)
    const to = moveTo(move)
    const piece = movePiece(move)
    const color = pieceColor(piece)
    const captured = moveCaptured(move)
    const flags = moveFlags(move)
    const san = toSan(pos, move)

    let castle: MoveRecord['castle'] = null
    if (flags & FLAG_CASTLE_KING) castle = { rookFrom: to + 1, rookTo: to - 1 }
    else if (flags & FLAG_CASTLE_QUEEN) castle = { rookFrom: to - 2, rookTo: to + 1 }

    pos.makeMove(move)
    const check = pos.inCheck()
    const mate = check && generateLegalMoves(pos).length === 0
    const fen = pos.toFen()
    pos.unmakeMove()

    return {
      move,
      san,
      ply: this.history.length,
      moveNumber: pos.fullmove,
      color,
      piece,
      pieceType: pieceType(piece),
      from,
      to,
      captured,
      capturedSquare: isEnPassant(move) ? (color === WHITE ? to + 16 : to - 16) : to,
      promotion: movePromotion(move),
      castle,
      check,
      mate,
      fen,
    }
  }

  status(): GameStatus {
    const pos = this.position
    const inCheck = pos.inCheck()
    const hasMoves = generateLegalMoves(pos).length > 0
    if (!hasMoves) {
      return {
        over: true,
        outcome: inCheck ? 'checkmate' : 'stalemate',
        winner: inCheck ? ((pos.turn ^ 1) as Color) : null,
        inCheck,
        turn: pos.turn,
      }
    }
    if (pos.halfmove >= 100) {
      return { over: true, outcome: 'fifty-move', winner: null, inCheck, turn: pos.turn }
    }
    if (pos.repetitionCount() >= 3) {
      return { over: true, outcome: 'repetition', winner: null, inCheck, turn: pos.turn }
    }
    if (pos.insufficientMaterial()) {
      return { over: true, outcome: 'insufficient', winner: null, inCheck, turn: pos.turn }
    }
    return { over: false, outcome: null, winner: null, inCheck, turn: pos.turn }
  }

  /** Every piece on the board — the renderer's source of truth after a reset. */
  pieces(): BoardPiece[] {
    const out: BoardPiece[] = []
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) continue
      const piece = this.position.board[sq]!
      if (piece === EMPTY) continue
      out.push({ square: sq, piece, type: pieceType(piece), color: pieceColor(piece) })
    }
    return out
  }

  /** Material captured by each side, for the tray beside the board. */
  captured(): { white: number[]; black: number[] } {
    const white: number[] = []
    const black: number[] = []
    for (const record of this.history) {
      if (record.captured === EMPTY) continue
      const type = pieceType(record.captured)
      if (pieceColor(record.captured) === WHITE) black.push(type)
      else white.push(type)
    }
    return { white, black }
  }

  /** Square of the king that is currently in check, or -1. */
  checkedKingSquare(): number {
    return this.position.inCheck() ? this.position.kingSq[this.position.turn] : -1
  }
}

export { BLACK, KING, PAWN, QUEEN, WHITE, squareName }
export type { Color, Move }
