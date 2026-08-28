import { evaluate, PIECE_VALUE } from './eval'
import { generateMoves, isLegal } from './movegen'
import { Position } from './position'
import {
  EMPTY, KING, type Move, moveCaptured, movePiece, movePromotion, moveTo, pieceType,
} from './types'

export const MATE_SCORE = 30000
const MATE_THRESHOLD = 29000
const INFINITY = 40000
const MAX_PLY = 64

/* ---------------------------------------------------- transposition table -- */

const TT_BITS = 20
const TT_SIZE = 1 << TT_BITS
const TT_MASK = TT_SIZE - 1

const EXACT = 0
const LOWER = 1
const UPPER = 2

const ttKey = new Int32Array(TT_SIZE)
const ttMove = new Int32Array(TT_SIZE)
const ttScore = new Int32Array(TT_SIZE)
const ttDepth = new Int8Array(TT_SIZE)
const ttFlag = new Int8Array(TT_SIZE)
const ttStamp = new Int32Array(TT_SIZE)
let generation = 0

export function clearTable(): void {
  ttKey.fill(0)
  ttMove.fill(0)
  ttDepth.fill(0)
  ttStamp.fill(0)
  generation = 0
}

/* ------------------------------------------------------------- interface -- */

export interface SearchLimits {
  /** Hard depth ceiling for iterative deepening. */
  depth: number
  /** Wall-clock budget in milliseconds; the current iteration is abandoned. */
  timeMs: number
  /**
   * Centipawn window for "good enough" root moves. Above zero the engine picks
   * randomly among them, which is what makes the easier levels feel human
   * rather than merely shallow.
   */
  randomness?: number
  seed?: number
}

export interface SearchInfo {
  move: Move
  score: number
  depth: number
  nodes: number
  elapsed: number
  pv: Move[]
  /** Positive: the engine mates in N. Negative: it is being mated in N. */
  mateIn: number | null
}

export const DIFFICULTIES = {
  novice: { depth: 2, timeMs: 250, randomness: 120 },
  club: { depth: 5, timeMs: 700, randomness: 30 },
  master: { depth: 8, timeMs: 1800, randomness: 0 },
} satisfies Record<string, SearchLimits>

export type Difficulty = keyof typeof DIFFICULTIES

/* --------------------------------------------------------------- search -- */

const killers = new Int32Array(MAX_PLY * 2)
const history = new Int32Array(16 * 128)

let nodes = 0
let deadline = 0
let aborted = false

function timeUp(): boolean {
  if (aborted) return true
  if ((nodes & 0x3ff) === 0 && Date.now() >= deadline) aborted = true
  return aborted
}

/** Most Valuable Victim / Least Valuable Attacker, plus killers and history. */
function scoreMove(move: Move, ply: number, ttBest: Move): number {
  if (move === ttBest) return 1 << 24
  const captured = moveCaptured(move)
  if (captured !== EMPTY) {
    const victim = PIECE_VALUE[pieceType(captured)]!
    const attacker = PIECE_VALUE[pieceType(movePiece(move))]!
    return (1 << 20) + victim * 16 - attacker
  }
  const promo = movePromotion(move)
  if (promo) return (1 << 19) + PIECE_VALUE[promo]!
  if (killers[ply * 2] === move) return 1 << 18
  if (killers[ply * 2 + 1] === move) return (1 << 18) - 1
  return history[movePiece(move) * 128 + moveTo(move)]!
}

function orderMoves(moves: Move[], ply: number, ttBest: Move): Move[] {
  const scored = moves.map((move) => ({ move, score: scoreMove(move, ply, ttBest) }))
  scored.sort((a, b) => b.score - a.score)
  return scored.map((entry) => entry.move)
}

/**
 * Captures-only search at the leaves. Without it the engine happily walks into
 * a recapture that sits one ply beyond the horizon.
 */
function quiescence(pos: Position, alpha: number, beta: number, ply: number): number {
  nodes++
  if (timeUp()) return 0

  const standPat = evaluate(pos)
  if (standPat >= beta) return beta
  if (standPat > alpha) alpha = standPat
  if (ply >= MAX_PLY - 1) return standPat

  for (const move of orderMoves(generateMoves(pos, true), ply, 0)) {
    // Delta pruning: even winning this piece for free would not reach alpha.
    const captured = moveCaptured(move)
    if (captured !== EMPTY && standPat + PIECE_VALUE[pieceType(captured)]! + 200 < alpha) continue
    if (!isLegal(pos, move)) continue
    pos.makeMove(move)
    const score = -quiescence(pos, -beta, -alpha, ply + 1)
    pos.unmakeMove()
    if (aborted) return 0
    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

function alphaBeta(pos: Position, depth: number, alpha: number, beta: number, ply: number): number {
  nodes++
  if (timeUp()) return 0

  if (ply > 0) {
    if (pos.halfmove >= 100 || pos.repetitionCount() >= 2 || pos.insufficientMaterial()) return 0
    // Mate-distance pruning keeps the engine from dithering with a forced mate.
    alpha = Math.max(alpha, -MATE_SCORE + ply)
    beta = Math.min(beta, MATE_SCORE - ply - 1)
    if (alpha >= beta) return alpha
  }

  const inCheck = pos.inCheck()
  if (inCheck) depth++
  if (depth <= 0) return quiescence(pos, alpha, beta, ply)

  const index = pos.hashLo & TT_MASK
  let ttBest: Move = 0
  if (ttKey[index] === pos.hashHi && ttStamp[index] !== 0) {
    ttBest = ttMove[index]!
    if (ply > 0 && ttDepth[index]! >= depth) {
      const score = ttScore[index]!
      const flag = ttFlag[index]!
      if (flag === EXACT) return score
      if (flag === LOWER && score >= beta) return score
      if (flag === UPPER && score <= alpha) return score
    }
  }

  // Null-move pruning: give the opponent a free move; if the position is still
  // winning, it is good enough to cut. Disabled in check and in pawn endings,
  // where zugzwang makes "passing" a lie.
  if (!inCheck && depth >= 3 && ply > 0 && hasNonPawnMaterial(pos)) {
    pos.makeNullMove()
    const score = -alphaBeta(pos, depth - 3, -beta, -beta + 1, ply + 1)
    pos.unmakeNullMove()
    if (aborted) return 0
    if (score >= beta && Math.abs(score) < MATE_THRESHOLD) return beta
  }

  let best = -INFINITY
  let bestMove: Move = 0
  let legalCount = 0
  const originalAlpha = alpha

  for (const move of orderMoves(generateMoves(pos), ply, ttBest)) {
    if (!isLegal(pos, move)) continue
    legalCount++
    pos.makeMove(move)
    let score: number
    if (legalCount === 1) {
      score = -alphaBeta(pos, depth - 1, -beta, -alpha, ply + 1)
    } else {
      // Late-move reduction on quiet moves that ordering already ranked low.
      const reduction = depth >= 3 && legalCount > 3 && moveCaptured(move) === EMPTY && !inCheck ? 1 : 0
      score = -alphaBeta(pos, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1)
      if (score > alpha && (reduction > 0 || score < beta)) {
        score = -alphaBeta(pos, depth - 1, -beta, -alpha, ply + 1)
      }
    }
    pos.unmakeMove()
    if (aborted) return 0

    if (score > best) {
      best = score
      bestMove = move
      if (score > alpha) {
        alpha = score
        if (alpha >= beta) {
          if (moveCaptured(move) === EMPTY) {
            killers[ply * 2 + 1] = killers[ply * 2]!
            killers[ply * 2] = move
            const slot = movePiece(move) * 128 + moveTo(move)
            history[slot] = history[slot]! + depth * depth
          }
          break
        }
      }
    }
  }

  if (legalCount === 0) return inCheck ? -MATE_SCORE + ply : 0

  ttKey[index] = pos.hashHi
  ttMove[index] = bestMove
  ttScore[index] = best
  ttDepth[index] = depth
  ttFlag[index] = best >= beta ? LOWER : best > originalAlpha ? EXACT : UPPER
  ttStamp[index] = generation

  return best
}

function hasNonPawnMaterial(pos: Position): boolean {
  for (let sq = 0; sq < 128; sq++) {
    if (sq & 0x88) continue
    const p = pos.board[sq]!
    if (p === EMPTY) continue
    const type = pieceType(p)
    if (type !== 1 && type !== KING) return true
  }
  return false
}

function collectPv(pos: Position, limit: number): Move[] {
  const pv: Move[] = []
  let plies = 0
  while (plies < limit) {
    const index = pos.hashLo & TT_MASK
    if (ttKey[index] !== pos.hashHi || ttStamp[index] === 0) break
    const move = ttMove[index]!
    if (!move) break
    const legal = generateMoves(pos).filter((m) => isLegal(pos, m))
    if (!legal.includes(move)) break
    pv.push(move)
    pos.makeMove(move)
    plies++
  }
  for (let i = 0; i < plies; i++) pos.unmakeMove()
  return pv
}

/**
 * Iterative deepening root search. Each completed depth replaces the answer, so
 * running out of time only costs the deepest (unfinished) iteration.
 */
export function findBestMove(pos: Position, limits: SearchLimits): SearchInfo | null {
  const started = Date.now()
  deadline = started + limits.timeMs
  aborted = false
  nodes = 0
  generation++
  killers.fill(0)
  for (let i = 0; i < history.length; i++) history[i] = (history[i]! / 2) | 0

  const root = pos.clone()
  const rootMoves = generateMoves(root).filter((m) => isLegal(root, m))
  if (rootMoves.length === 0) return null

  const randomness = limits.randomness ?? 0
  let rng = (limits.seed ?? Date.now()) | 1

  let ordered = rootMoves
  let best: SearchInfo = {
    move: rootMoves[0]!,
    score: 0,
    depth: 0,
    nodes: 0,
    elapsed: 0,
    pv: [],
    mateIn: null,
  }

  for (let depth = 1; depth <= limits.depth; depth++) {
    const scored: { move: Move; score: number }[] = []
    // With randomness on, every root move gets a full window so the "close
    // enough" comparison below sees real scores rather than upper bounds.
    let alpha = -INFINITY

    for (const move of ordered) {
      root.makeMove(move)
      const score = -alphaBeta(root, depth - 1, -INFINITY, randomness > 0 ? INFINITY : -alpha, 1)
      root.unmakeMove()
      if (aborted) break
      scored.push({ move, score })
      if (score > alpha) alpha = score
    }

    if (scored.length === 0) break
    scored.sort((a, b) => b.score - a.score)
    ordered = scored.map((entry) => entry.move)

    const top = scored[0]!
    const pool = randomness > 0 ? scored.filter((entry) => entry.score >= top.score - randomness) : [top]
    rng ^= rng << 13
    rng ^= rng >>> 17
    rng ^= rng << 5
    const picked = pool[Math.abs(rng) % pool.length]!

    root.makeMove(picked.move)
    const pv = [picked.move, ...collectPv(root, depth + 4)]
    root.unmakeMove()

    best = {
      move: picked.move,
      score: picked.score,
      depth,
      nodes,
      elapsed: Date.now() - started,
      pv,
      mateIn: mateDistance(picked.score),
    }

    // A forced mate is as good as it gets, and the clock has the final word.
    if (Math.abs(picked.score) >= MATE_THRESHOLD) break
    if (Date.now() >= deadline) break
    if (aborted) break
  }

  best.nodes = nodes
  best.elapsed = Date.now() - started
  return best
}

function mateDistance(score: number): number | null {
  if (Math.abs(score) < MATE_THRESHOLD) return null
  const plies = MATE_SCORE - Math.abs(score)
  const moves = Math.ceil(plies / 2)
  return score > 0 ? moves : -moves
}
