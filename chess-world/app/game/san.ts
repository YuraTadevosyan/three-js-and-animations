import { generateLegalMoves, isLegal } from './movegen'
import { Position } from './position'
import {
  EMPTY, FLAG_CASTLE_KING, FLAG_CASTLE_QUEEN, KING, PAWN, PIECE_LETTERS, type Move, fileOf,
  moveCaptured, moveFlags, moveFrom, movePiece, movePromotion, moveTo, pieceType, rankOf, squareName,
} from './types'

const FILE_NAMES = 'abcdefgh'

/**
 * Standard algebraic notation for a move that is legal in `pos`. Must be called
 * *before* the move is played, since disambiguation depends on the position.
 */
export function toSan(pos: Position, move: Move): string {
  const flags = moveFlags(move)
  if (flags & FLAG_CASTLE_KING) return 'O-O' + suffix(pos, move)
  if (flags & FLAG_CASTLE_QUEEN) return 'O-O-O' + suffix(pos, move)

  const moving = movePiece(move)
  const type = pieceType(moving)
  const from = moveFrom(move)
  const to = moveTo(move)
  const captured = moveCaptured(move)
  let san = ''

  if (type === PAWN) {
    if (captured !== EMPTY) san += FILE_NAMES[fileOf(from)] + 'x'
    san += squareName(to)
    const promo = movePromotion(move)
    if (promo) san += '=' + PIECE_LETTERS[promo]
  } else {
    san += PIECE_LETTERS[type]
    san += disambiguate(pos, move)
    if (captured !== EMPTY) san += 'x'
    san += squareName(to)
  }

  return san + suffix(pos, move)
}

/** File, rank, or both — whichever is the shortest unambiguous form. */
function disambiguate(pos: Position, move: Move): string {
  const type = pieceType(movePiece(move))
  if (type === KING) return ''
  const from = moveFrom(move)
  const to = moveTo(move)

  let sameFile = false
  let sameRank = false
  let ambiguous = false
  for (const alt of generateLegalMoves(pos)) {
    if (alt === move) continue
    if (moveTo(alt) !== to) continue
    if (pieceType(movePiece(alt)) !== type) continue
    ambiguous = true
    if (fileOf(moveFrom(alt)) === fileOf(from)) sameFile = true
    if (rankOf(moveFrom(alt)) === rankOf(from)) sameRank = true
  }

  if (!ambiguous) return ''
  if (!sameFile) return FILE_NAMES[fileOf(from)]!
  if (!sameRank) return String(rankOf(from) + 1)
  return squareName(from)
}

function suffix(pos: Position, move: Move): string {
  pos.makeMove(move)
  const check = pos.inCheck()
  const hasReply = generateLegalMoves(pos).length > 0
  pos.unmakeMove()
  if (check) return hasReply ? '+' : '#'
  return ''
}

/**
 * Parses one SAN token against the legal moves of `pos`. Tolerant of the usual
 * PGN decorations (`+`, `#`, `!?`, `e.p.`) and of `0-0` for castling.
 * Returns null when nothing matches, which is how the game fixtures are tested.
 */
export function fromSan(pos: Position, token: string): Move | null {
  const clean = token
    .replace(/[+#?!]+$/g, '')
    .replace(/e\.p\.$/i, '')
    .replace(/0/g, 'O')
    .trim()
  if (!clean) return null

  const legal = generateLegalMoves(pos)

  if (clean === 'O-O' || clean === 'O-O-O') {
    const wanted = clean === 'O-O' ? FLAG_CASTLE_KING : FLAG_CASTLE_QUEEN
    return legal.find((m) => moveFlags(m) & wanted) ?? null
  }

  const match = /^([NBRQK])?([a-h])?([1-8])?x?([a-h][1-8])(?:=?([NBRQ]))?$/.exec(clean)
  if (!match) return null
  const [, pieceLetter, fromFile, fromRank, target, promoLetter] = match

  const type = pieceLetter ? PIECE_LETTERS.indexOf(pieceLetter) : PAWN
  const toSq = squareIndex(target!)
  const promo = promoLetter ? PIECE_LETTERS.indexOf(promoLetter) : 0

  const candidates = legal.filter((m) => {
    if (moveTo(m) !== toSq) return false
    if (pieceType(movePiece(m)) !== type) return false
    if (promo && movePromotion(m) !== promo) return false
    if (!promo && movePromotion(m)) return false
    const from = moveFrom(m)
    if (fromFile && FILE_NAMES[fileOf(from)] !== fromFile) return false
    if (fromRank && rankOf(from) + 1 !== Number(fromRank)) return false
    return true
  })

  return candidates.length === 1 ? candidates[0]! : (candidates[0] ?? null)
}

function squareIndex(name: string): number {
  return (8 - Number(name[1])) * 16 + FILE_NAMES.indexOf(name[0]!)
}

export { isLegal }
