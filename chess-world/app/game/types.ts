/**
 * Board representation: 0x88.
 *
 * 128 squares laid out as 8 ranks of 16, of which the right-hand 8 of each row
 * are off-board. A square is on the board iff `(sq & 0x88) === 0`, which makes
 * "did that slide fall off the edge" a single AND instead of a bounds check.
 *
 * Index 0 is a8 and index 119 is h1, so rank = 8 - (sq >> 4) and file = sq & 7.
 */

export type Color = 0 | 1

export const WHITE: Color = 0
export const BLACK: Color = 1

/** Piece types. Stored in the low 3 bits of a piece code. */
export const PAWN = 1
export const KNIGHT = 2
export const BISHOP = 3
export const ROOK = 4
export const QUEEN = 5
export const KING = 6

export const EMPTY = 0

/** A piece code is `(color << 3) | type`; 0 means an empty square. */
export type Piece = number

export const piece = (color: Color, type: number): Piece => (color << 3) | type
export const pieceType = (p: Piece): number => p & 7
export const pieceColor = (p: Piece): Color => ((p >> 3) & 1) as Color
export const other = (c: Color): Color => (c ^ 1) as Color

export const W_PAWN = piece(WHITE, PAWN)
export const W_KNIGHT = piece(WHITE, KNIGHT)
export const W_BISHOP = piece(WHITE, BISHOP)
export const W_ROOK = piece(WHITE, ROOK)
export const W_QUEEN = piece(WHITE, QUEEN)
export const W_KING = piece(WHITE, KING)
export const B_PAWN = piece(BLACK, PAWN)
export const B_KNIGHT = piece(BLACK, KNIGHT)
export const B_BISHOP = piece(BLACK, BISHOP)
export const B_ROOK = piece(BLACK, ROOK)
export const B_QUEEN = piece(BLACK, QUEEN)
export const B_KING = piece(BLACK, KING)

/* ---------------------------------------------------------------- squares -- */

export const onBoard = (sq: number): boolean => (sq & 0x88) === 0
/** File index, 0 = a … 7 = h. */
export const fileOf = (sq: number): number => sq & 7
/** Rank index, 0 = rank 1 … 7 = rank 8. */
export const rankOf = (sq: number): number => 7 - (sq >> 4)
/** 0x88 index from file/rank indices (both 0-based, rank 0 = rank 1). */
export const square = (file: number, rank: number): number => (7 - rank) * 16 + file

export const A1 = square(0, 0)
export const C1 = square(2, 0)
export const D1 = square(3, 0)
export const E1 = square(4, 0)
export const F1 = square(5, 0)
export const G1 = square(6, 0)
export const H1 = square(7, 0)
export const A8 = square(0, 7)
export const C8 = square(2, 7)
export const D8 = square(3, 7)
export const E8 = square(4, 7)
export const F8 = square(5, 7)
export const G8 = square(6, 7)
export const H8 = square(7, 7)

const FILE_NAMES = 'abcdefgh'

export function squareName(sq: number): string {
  return FILE_NAMES[fileOf(sq)] + String(rankOf(sq) + 1)
}

export function parseSquare(name: string): number {
  const file = FILE_NAMES.indexOf(name[0] ?? '')
  const rank = Number(name[1]) - 1
  if (file < 0 || !(rank >= 0 && rank <= 7)) return -1
  return square(file, rank)
}

/* ------------------------------------------------------------ castling ---- */

export const CASTLE_WK = 1
export const CASTLE_WQ = 2
export const CASTLE_BK = 4
export const CASTLE_BQ = 8

/* --------------------------------------------------------------- moves ---- */

export const FLAG_DOUBLE_PAWN = 1
export const FLAG_EN_PASSANT = 2
export const FLAG_CASTLE_KING = 4
export const FLAG_CASTLE_QUEEN = 8

/**
 * Moves are packed into one 31-bit integer so the search can push millions of
 * them around without allocating:
 *
 *     bits  0-7   from square
 *     bits  8-15  to square
 *     bits 16-19  moving piece code
 *     bits 20-23  captured piece code (0 when quiet)
 *     bits 24-26  promotion piece type (0 when none)
 *     bits 27-30  flags
 */
export type Move = number

export const encodeMove = (
  from: number,
  to: number,
  moving: Piece,
  captured: Piece = 0,
  promotion = 0,
  flags = 0,
): Move => from | (to << 8) | (moving << 16) | (captured << 20) | (promotion << 24) | (flags << 27)

export const moveFrom = (m: Move): number => m & 0xff
export const moveTo = (m: Move): number => (m >> 8) & 0xff
export const movePiece = (m: Move): Piece => (m >> 16) & 0xf
export const moveCaptured = (m: Move): Piece => (m >> 20) & 0xf
export const movePromotion = (m: Move): number => (m >> 24) & 0x7
export const moveFlags = (m: Move): number => (m >> 27) & 0xf
export const isCastle = (m: Move): boolean => (moveFlags(m) & (FLAG_CASTLE_KING | FLAG_CASTLE_QUEEN)) !== 0
export const isEnPassant = (m: Move): boolean => (moveFlags(m) & FLAG_EN_PASSANT) !== 0

/** Long algebraic ("e2e4", "e7e8q") — used for logging and test fixtures. */
export function moveToUci(m: Move): string {
  const promo = movePromotion(m)
  return squareName(moveFrom(m)) + squareName(moveTo(m)) + (promo ? ' pnbrqk'[promo] : '')
}

export const PIECE_LETTERS = ' PNBRQK'
export const PIECE_NAMES = ['', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as const
export type PieceName = (typeof PIECE_NAMES)[number]

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
