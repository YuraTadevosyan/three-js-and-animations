import type { Mood, Plant, WeatherId } from './state'

/**
 * Discrete events. Per-frame values are NOT events — components read those
 * straight off the state object inside their own tick callback. Only things
 * that happen at a moment in time go through here, so a Lit re-render is
 * rare rather than 60 times a second.
 */
export interface OrganismEvents {
  weather: { from: WeatherId; to: WeatherId }
  mood: { from: Mood; to: Mood }
  phase: { from: string; to: string }
  breath: { count: number }
  planted: { plant: Plant; bySeed: boolean }
  died: { plant: Plant }
  bloomed: { plant: Plant }
  thunder: { strength: number }
  returned: { awayMs: number; grewBy: number }
}

type Handler<K extends keyof OrganismEvents> = (payload: OrganismEvents[K]) => void

export class Bus {
  #handlers = new Map<string, Set<Handler<never>>>()

  on<K extends keyof OrganismEvents>(event: K, fn: Handler<K>): () => void {
    let set = this.#handlers.get(event)
    if (!set) this.#handlers.set(event, (set = new Set()))
    set.add(fn as Handler<never>)
    return () => set!.delete(fn as Handler<never>)
  }

  emit<K extends keyof OrganismEvents>(event: K, payload: OrganismEvents[K]) {
    const set = this.#handlers.get(event)
    if (!set) return
    for (const fn of set) {
      try {
        ;(fn as Handler<K>)(payload)
      } catch (err) {
        // One bad listener must never stop the heartbeat.
        console.error(`[organism] listener for "${event}" threw`, err)
      }
    }
  }
}
