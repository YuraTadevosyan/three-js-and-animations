import type { EngineReply, EngineRequest } from '~/game/engine.worker'
import { Position } from '~/game/position'
import { toSan } from '~/game/san'
import { findBestMove, type SearchLimits } from '~/game/search'
import { moveFrom, movePromotion, moveTo } from '~/game/types'

/**
 * Thin wrapper around the search worker, with a same-thread fallback for
 * browsers that refuse to construct a module worker. The fallback blocks, so
 * its time budget is clamped hard.
 */
export function createEngine() {
  let worker: Worker | null = null
  let failed = false
  let nextId = 1
  const pending = new Map<number, (reply: EngineReply) => void>()

  function ensure(): Worker | null {
    if (worker || failed) return worker
    try {
      worker = new Worker(new URL('../game/engine.worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (event: MessageEvent<EngineReply>) => {
        const resolve = pending.get(event.data.id)
        if (!resolve) return
        pending.delete(event.data.id)
        resolve(event.data)
      }
      worker.onerror = () => {
        failed = true
        worker?.terminate()
        worker = null
      }
    } catch {
      failed = true
      worker = null
    }
    return worker
  }

  function localSearch(fen: string, limits: SearchLimits, id: number): EngineReply {
    const position = Position.fromFen(fen)
    const info = findBestMove(position, { ...limits, timeMs: Math.min(limits.timeMs, 600) })
    if (!info) {
      return { id, move: null, score: 0, depth: 0, nodes: 0, elapsed: 0, mateIn: null, pv: [] }
    }
    const pv: string[] = []
    let played = 0
    for (const move of info.pv) {
      pv.push(toSan(position, move))
      position.makeMove(move)
      played++
    }
    for (let i = 0; i < played; i++) position.unmakeMove()
    return {
      id,
      move: { from: moveFrom(info.move), to: moveTo(info.move), promotion: movePromotion(info.move) },
      score: info.score,
      depth: info.depth,
      nodes: info.nodes,
      elapsed: info.elapsed,
      mateIn: info.mateIn,
      pv,
    }
  }

  function think(fen: string, limits: SearchLimits): Promise<EngineReply> {
    const id = nextId++
    const instance = ensure()
    if (!instance) return Promise.resolve(localSearch(fen, limits, id))
    return new Promise<EngineReply>((resolve) => {
      pending.set(id, resolve)
      const request: EngineRequest = { id, fen, limits }
      instance.postMessage(request)
      // If the worker dies mid-search, fall back rather than hanging the game.
      setTimeout(() => {
        if (!pending.has(id)) return
        pending.delete(id)
        resolve(localSearch(fen, limits, id))
      }, limits.timeMs + 5000)
    })
  }

  /**
   * True when no worker could be made and a search would run here, on the
   * thread that draws the board. Callers that are only *describing* a position
   * rather than playing one use this to keep out of the way.
   */
  function blocking(): boolean {
    ensure()
    return failed
  }

  function destroy(): void {
    worker?.terminate()
    worker = null
    pending.clear()
  }

  return { think, blocking, destroy }
}
