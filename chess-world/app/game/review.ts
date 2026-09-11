/**
 * Grading a game.
 *
 * The search says what a position is worth; this says what that means about
 * the move someone played. It is deliberately pure arithmetic — the engine
 * calls happen elsewhere — so the thresholds can be argued with, and tested,
 * without running a search.
 */
import { BLACK, WHITE, type Color } from './types'

export type MoveQuality = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'

/**
 * Evaluations are clamped to this before anything is subtracted from anything.
 * Past a rook up the game is won, and without a cap a mate score would make
 * every later move look like a catastrophe.
 */
export const EVAL_CAP = 1500

/** Centipawns thrown away, and what that is called. */
export const QUALITY_LOSS: Record<Exclude<MoveQuality, 'best'>, number> = {
  good: 0,
  inaccuracy: 50,
  mistake: 120,
  blunder: 250,
}

export const QUALITY_LABEL: Record<MoveQuality, string> = {
  best: 'Best',
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
}

/** The mark a scoresheet would carry. */
export const QUALITY_MARK: Record<MoveQuality, string> = {
  best: '★',
  good: '',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
}

export interface ReviewedMove {
  ply: number
  san: string
  color: Color
  /** Centipawns from the mover's point of view, before and after the move. */
  before: number
  after: number
  /** How much better the engine's move was, in centipawns. Never negative. */
  loss: number
  quality: MoveQuality
  /** The engine's choice, when it is not the move that was played. */
  best: string | null
  bestFrom: number
  bestTo: number
}

export interface SideReview {
  color: Color
  moves: number
  best: number
  inaccuracies: number
  mistakes: number
  blunders: number
  /** Average centipawns thrown away per move. */
  acpl: number
  accuracy: number
}

export interface GameReview {
  moves: ReviewedMove[]
  white: SideReview
  black: SideReview
  /** The ply that cost the most — where the game turned. */
  turningPoint: ReviewedMove | null
  /** Milliseconds the engine was given per position. */
  budgetMs: number
  depth: number
}

/** A mate score is worth the cap, in whichever direction it points. */
export function toCentipawns(score: number, mateIn: number | null): number {
  if (mateIn !== null) return mateIn > 0 ? EVAL_CAP : -EVAL_CAP
  return Math.max(-EVAL_CAP, Math.min(EVAL_CAP, score))
}

export function classify(loss: number, matchedEngine: boolean): MoveQuality {
  if (matchedEngine) return 'best'
  if (loss < QUALITY_LOSS.inaccuracy) return 'good'
  if (loss < QUALITY_LOSS.mistake) return 'inaccuracy'
  if (loss < QUALITY_LOSS.blunder) return 'mistake'
  return 'blunder'
}

/**
 * A move's accuracy decays with what it threw away: everything from perfect
 * down to nothing, 85% for a 30-centipawn slip and half marks around 125.
 *
 * This is our own curve, not Lichess's — theirs works from win probability,
 * which needs a model this engine does not have. Averaging per move rather
 * than scoring the average loss stops one catastrophe from being the whole
 * story of a long game.
 */
export function moveAccuracy(loss: number): number {
  return 100 * Math.exp(-Math.max(0, loss) / 180)
}

export function summariseSide(moves: ReviewedMove[], color: Color): SideReview {
  const own = moves.filter((entry) => entry.color === color)
  const total = own.reduce((sum, entry) => sum + entry.loss, 0)
  const accuracy = own.reduce((sum, entry) => sum + moveAccuracy(entry.loss), 0)
  return {
    color,
    moves: own.length,
    best: own.filter((entry) => entry.quality === 'best').length,
    inaccuracies: own.filter((entry) => entry.quality === 'inaccuracy').length,
    mistakes: own.filter((entry) => entry.quality === 'mistake').length,
    blunders: own.filter((entry) => entry.quality === 'blunder').length,
    acpl: own.length ? Math.round(total / own.length) : 0,
    accuracy: own.length ? Math.round((accuracy / own.length) * 10) / 10 : 0,
  }
}

export function summarise(moves: ReviewedMove[], budgetMs: number, depth: number): GameReview {
  let turningPoint: ReviewedMove | null = null
  for (const entry of moves) {
    if (entry.quality === 'best' || entry.quality === 'good') continue
    if (!turningPoint || entry.loss > turningPoint.loss) turningPoint = entry
  }
  return {
    moves,
    white: summariseSide(moves, WHITE),
    black: summariseSide(moves, BLACK),
    turningPoint,
    budgetMs,
    depth,
  }
}
