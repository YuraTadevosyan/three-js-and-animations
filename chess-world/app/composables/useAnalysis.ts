/**
 * Analysis: the live evaluation, and the post-game review.
 *
 * This runs its own engine instance — a second worker — so that watching the
 * evaluation never takes a millisecond away from the opponent's search. The
 * two never share a position: one is deciding what to play, this one is only
 * ever describing what is already on the board.
 */
import { ref, shallowRef } from 'vue'
import { ChessGame, type MoveRecord } from '~/game/game'
import {
  classify, summarise, toCentipawns, type GameReview, type ReviewedMove,
} from '~/game/review'
import { WHITE, type Color } from '~/game/types'
import { createEngine } from './useEngine'

export interface LiveEval {
  /** Centipawns, always from the first army's point of view. */
  cp: number
  /** Moves to mate from the same point of view, or null. */
  mateIn: number | null
  depth: number
  fen: string
}

/** Shallow and quick: the bar should land within one animation, not stall it. */
const LIVE_LIMITS = { depth: 9, timeMs: 140 }
const REVIEW_DEPTH = 11
/** A whole review should feel like a wait, not an errand. */
const REVIEW_BUDGET_MS = 14_000

const engine = createEngine()

const evalEnabled = ref(true)
const liveEval = shallowRef<LiveEval | null>(null)
const reviewing = ref(false)
const reviewProgress = ref(0)
const review = shallowRef<GameReview | null>(null)

let evalToken = 0
let reviewToken = 0

/** What a position is worth to the side to move, without searching it. */
function terminalScore(fen: string): number | null {
  const status = new ChessGame(fen).status()
  if (!status.over) return null
  return status.outcome === 'checkmate' ? -1500 : 0
}

export function useAnalysis() {
  function setEvalEnabled(enabled: boolean): void {
    evalEnabled.value = enabled
    if (!enabled) {
      evalToken++
      liveEval.value = null
    }
  }

  /**
   * Evaluates the position on the board. Only the most recent call is allowed
   * to write the result, so a fast sequence of moves cannot leave the bar
   * showing a position that is three moves old.
   */
  async function evaluate(fen: string, turn: Color, over = false): Promise<void> {
    if (!evalEnabled.value) return
    // A bar nobody asked for is not worth a stutter: where the search cannot
    // be got off this thread, there is simply no bar.
    if (engine.blocking()) return
    const token = ++evalToken
    if (over) {
      const terminal = terminalScore(fen)
      if (terminal !== null) {
        liveEval.value = {
          cp: turn === WHITE ? terminal : -terminal,
          mateIn: null,
          depth: 0,
          fen,
        }
      }
      return
    }
    const reply = await engine.think(fen, LIVE_LIMITS)
    if (token !== evalToken) return
    // The search answers from the point of view of whoever is to move; the bar
    // is always drawn from the first army's.
    const sign = turn === WHITE ? 1 : -1
    liveEval.value = {
      cp: toCentipawns(reply.score, reply.mateIn) * sign,
      mateIn: reply.mateIn === null ? null : reply.mateIn * sign,
      depth: reply.depth,
      fen,
    }
  }

  /**
   * Grades every move of a game.
   *
   * One search per *position*, not per move: the position after a move is the
   * position before the next one, so a 40-move game costs 81 searches rather
   * than 162. Each move's loss is then the difference between what the engine
   * could have had and what the player actually got, both measured from the
   * mover's side of the board.
   */
  async function runReview(startFen: string, records: MoveRecord[]): Promise<GameReview | null> {
    if (!records.length || reviewing.value) return null
    const token = ++reviewToken
    reviewing.value = true
    reviewProgress.value = 0

    try {
      const positions = [startFen, ...records.map((record) => record.fen)]
      // Without a worker every search runs here, so the whole review is cut
      // down to something that stutters rather than freezes.
      const total = engine.blocking() ? REVIEW_BUDGET_MS / 3 : REVIEW_BUDGET_MS
      const budget = Math.max(60, Math.min(220, Math.round(total / positions.length)))
      const scores: number[] = []
      const bests: ({ from: number; to: number; san: string } | null)[] = []

      for (let i = 0; i < positions.length; i++) {
        const fen = positions[i]!
        const terminal = terminalScore(fen)
        if (terminal !== null) {
          scores.push(terminal)
          bests.push(null)
        } else {
          const reply = await engine.think(fen, { depth: REVIEW_DEPTH, timeMs: budget })
          if (token !== reviewToken) return null
          scores.push(toCentipawns(reply.score, reply.mateIn))
          bests.push(
            reply.move ? { from: reply.move.from, to: reply.move.to, san: reply.pv[0] ?? '' } : null,
          )
        }
        reviewProgress.value = (i + 1) / positions.length
        // Back to the task queue between positions, so the progress bar is
        // drawn even when the searches are running on this thread.
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      const moves: ReviewedMove[] = records.map((record, i) => {
        const before = scores[i]!
        // The next position is the opponent's to move, so its score has to be
        // turned round before it can be compared with this one.
        const after = -scores[i + 1]!
        const best = bests[i]
        const matched = !!best && best.from === record.from && best.to === record.to
        // A move the engine would have played cannot have lost anything; any
        // difference there is the search disagreeing with itself between two
        // depths, not the player throwing something away.
        const loss = matched ? 0 : Math.max(0, before - after)
        return {
          ply: record.ply,
          san: record.san,
          color: record.color,
          before,
          after,
          loss,
          quality: classify(loss, matched),
          best: matched || !best ? null : best.san,
          bestFrom: best?.from ?? -1,
          bestTo: best?.to ?? -1,
        }
      })

      const result = summarise(moves, budget, REVIEW_DEPTH)
      review.value = result
      return result
    } finally {
      if (token === reviewToken) {
        reviewing.value = false
        reviewProgress.value = 0
      }
    }
  }

  function cancelReview(): void {
    reviewToken++
    reviewing.value = false
    reviewProgress.value = 0
  }

  function clearReview(): void {
    cancelReview()
    review.value = null
  }

  function reviewedAt(ply: number): ReviewedMove | null {
    return review.value?.moves.find((entry) => entry.ply === ply) ?? null
  }

  return {
    evalEnabled,
    liveEval,
    reviewing,
    reviewProgress,
    review,
    setEvalEnabled,
    evaluate,
    runReview,
    cancelReview,
    clearReview,
    reviewedAt,
  }
}
