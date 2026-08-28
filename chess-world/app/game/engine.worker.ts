/**
 * The search runs off the main thread: a 1.8s "Master" think would otherwise
 * freeze the render loop mid-animation, and the whole point of this app is that
 * the board never stops moving.
 */
import { Position } from './position'
import { findBestMove, type SearchLimits } from './search'
import { toSan } from './san'
import { moveFrom, movePromotion, moveTo } from './types'

export interface EngineRequest {
  id: number
  fen: string
  limits: SearchLimits
}

export interface EngineReply {
  id: number
  /** Null when the position has no legal moves. */
  move: { from: number; to: number; promotion: number } | null
  score: number
  depth: number
  nodes: number
  elapsed: number
  mateIn: number | null
  pv: string[]
}

const ctx = self as unknown as Worker

ctx.onmessage = (event: MessageEvent<EngineRequest>) => {
  const { id, fen, limits } = event.data
  const position = Position.fromFen(fen)
  const info = findBestMove(position, limits)

  if (!info) {
    ctx.postMessage({
      id, move: null, score: 0, depth: 0, nodes: 0, elapsed: 0, mateIn: null, pv: [],
    } satisfies EngineReply)
    return
  }

  // Render the principal variation as SAN while we still have the position.
  const pv: string[] = []
  let played = 0
  for (const move of info.pv) {
    pv.push(toSan(position, move))
    position.makeMove(move)
    played++
  }
  for (let i = 0; i < played; i++) position.unmakeMove()

  ctx.postMessage({
    id,
    move: { from: moveFrom(info.move), to: moveTo(info.move), promotion: movePromotion(info.move) },
    score: info.score,
    depth: info.depth,
    nodes: info.nodes,
    elapsed: info.elapsed,
    mateIn: info.mateIn,
    pv,
  } satisfies EngineReply)
}
