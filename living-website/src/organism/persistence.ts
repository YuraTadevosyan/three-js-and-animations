import { clampGenome, genomeFromSeed, SPECIES_LIST, type Genome } from '@/lib/genome'
import type { Plant, Species } from './state'

const KEY = 'living-website:v1'

export interface Saved {
  bornAt: number
  lastSeen: number
  visits: number
  generations: number
  pollinations: number
  fertility: number
  plants: Plant[]
}

const isSpecies = (v: unknown): v is Species =>
  typeof v === 'string' && (SPECIES_LIST as string[]).includes(v)

/**
 * Rebuild a genome from stored data.
 *
 * Gardens saved before plants had genomes hold nothing but a seed, so the
 * seed-derived genome is both the migration path and the fallback for any
 * field that comes back missing or corrupt. Nobody loses a garden over a
 * schema change.
 */
function reviveGenome(raw: unknown, seed: number): Genome {
  const base = genomeFromSeed(seed)
  if (!raw || typeof raw !== 'object') return base

  const stored = raw as Record<string, unknown>
  const merged: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(stored)) {
    if (key === 'species') continue
    if (typeof value === 'number' && Number.isFinite(value)) merged[key] = value
  }
  merged.species = isSpecies(stored.species) ? stored.species : base.species

  return clampGenome(merged as unknown as Genome)
}

function reviveParents(raw: unknown): [Species, Species] | null {
  if (!Array.isArray(raw) || raw.length !== 2) return null
  const [a, b] = raw
  return isSpecies(a) && isSpecies(b) ? [a, b] : null
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
      .map((p) => {
        const seed = p.seed >>> 0
        return {
          id: typeof p.id === 'string' ? p.id : `p${Math.random().toString(36).slice(2, 9)}`,
          seed,
          genome: reviveGenome(p.genome, seed),
          x: Number.isFinite(p.x) ? Math.min(1, Math.max(0, p.x)) : Math.random(),
          age: Math.min(1.4, Math.max(0, p.age)),
          vigor: Number.isFinite(p.vigor) ? Math.min(1, Math.max(0, p.vigor)) : 1,
          gen: Number.isFinite(p.gen) ? p.gen : 0,
          pollen: p.pollen ? reviveGenome(p.pollen, seed) : null,
          parents: reviveParents(p.parents),
        }
      })

    return {
      bornAt: Number(parsed.bornAt) || Date.now(),
      lastSeen: Number(parsed.lastSeen) || Date.now(),
      visits: Number(parsed.visits) || 0,
      generations: Number(parsed.generations) || 0,
      pollinations: Number(parsed.pollinations) || 0,
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
