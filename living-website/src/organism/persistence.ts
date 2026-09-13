import type { Plant } from './state'

const KEY = 'living-website:v1'

export interface Saved {
  bornAt: number
  lastSeen: number
  visits: number
  generations: number
  fertility: number
  plants: Plant[]
}

/**
 * Storage can throw outright (Safari private mode, blocked site data) or come
 * back as garbage from an older build. Every path here has to survive that
 * without taking the page down — a garden that fails to load is a garden that
 * starts fresh, not a blank screen.
 */
export function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Saved>
    if (!parsed || !Array.isArray(parsed.plants)) return null

    const plants = parsed.plants
      .filter((p): p is Plant => !!p && typeof p.seed === 'number' && typeof p.age === 'number')
      .slice(0, 24)
      .map((p) => ({
        id: typeof p.id === 'string' ? p.id : `p${Math.random().toString(36).slice(2, 9)}`,
        seed: p.seed >>> 0,
        x: Number.isFinite(p.x) ? Math.min(1, Math.max(0, p.x)) : Math.random(),
        age: Math.min(1.4, Math.max(0, p.age)),
        vigor: Number.isFinite(p.vigor) ? Math.min(1, Math.max(0, p.vigor)) : 1,
        gen: Number.isFinite(p.gen) ? p.gen : 0,
      }))

    return {
      bornAt: Number(parsed.bornAt) || Date.now(),
      lastSeen: Number(parsed.lastSeen) || Date.now(),
      visits: Number(parsed.visits) || 0,
      generations: Number(parsed.generations) || 0,
      fertility: Number.isFinite(parsed.fertility) ? parsed.fertility! : 0.5,
      plants,
    }
  } catch {
    return null
  }
}

export function save(data: Saved): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Quota or a blocked origin. The session keeps running in memory.
  }
}

export function forget(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to do */
  }
}
