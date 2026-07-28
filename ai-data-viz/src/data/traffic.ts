import { Rng, fbm1d } from '@/lib/rng'
import { int, dec } from '@/lib/format'
import { dominantPeriod, summarize, type Insight } from '@/lib/stats'

/**
 * City traffic — a week of congestion by corridor, plus a road graph the view
 * animates vehicles along.
 *
 * Congestion is a continuous magnitude, so the heatmap gets the sequential blue
 * ramp with a scale legend, not eight categorical hues. The corridors themselves
 * are nominal, so where they appear as bars they all wear slot 1.
 */

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const HOURS = Array.from({ length: 24 }, (_, i) => i)

export interface Corridor {
  id: string
  name: string
  /** 7 × 24 congestion index, 0–100. */
  grid: number[][]
  /** Mean speed in km/h across the week. */
  meanSpeed: number
  lengthKm: number
}

export interface RoadNode {
  id: number
  x: number
  y: number
  /** Junction weight — drives the node radius in the animated map. */
  weight: number
}

export interface RoadEdge {
  from: number
  to: number
  /** 0–1, drives how many vehicles the view spawns on this edge. */
  load: number
}

export interface Incident {
  corridor: string
  day: number
  hour: number
  severity: 'warning' | 'serious' | 'critical'
  kind: string
}

export interface TrafficData {
  corridors: Corridor[]
  /** City-wide congestion, flattened to 168 hourly readings. */
  weekly: number[]
  nodes: RoadNode[]
  edges: RoadEdge[]
  incidents: Incident[]
  insights: Insight[]
}

const CORRIDORS = [
  { id: 'n1', name: 'North Ring', lengthKm: 14.2, base: 46, commuter: 1.0 },
  { id: 'ha', name: 'Harbour Approach', lengthKm: 8.6, base: 38, commuter: 1.25 },
  { id: 'cx', name: 'Central Cross', lengthKm: 6.1, base: 52, commuter: 1.4 },
  { id: 'ea', name: 'East Arterial', lengthKm: 11.8, base: 41, commuter: 0.9 },
  { id: 'rv', name: 'Riverside', lengthKm: 9.4, base: 33, commuter: 0.7 },
  { id: 'ap', name: 'Airport Link', lengthKm: 17.5, base: 29, commuter: 0.55 },
  { id: 'ol', name: 'Old Town Loop', lengthKm: 4.3, base: 44, commuter: 0.8 },
  { id: 'sq', name: 'South Quays', lengthKm: 12.9, base: 36, commuter: 1.1 },
]

export function generateTraffic(seed = 'city-traffic'): TrafficData {
  const corridors: Corridor[] = CORRIDORS.map((spec) => {
    const wave = fbm1d(`${seed}:${spec.id}`, 3)
    const rng = new Rng(`${seed}:${spec.id}:n`)
    const grid: number[][] = []
    for (let d = 0; d < 7; d++) {
      const row: number[] = []
      const weekend = d >= 5
      for (let h = 0; h < 24; h++) {
        // Two commuter peaks on weekdays; one lazy midday hump at the weekend.
        const morning = Math.exp(-((h - 8) ** 2) / 5.5) * (weekend ? 0.15 : 1)
        const evening = Math.exp(-((h - 17.5) ** 2) / 7) * (weekend ? 0.3 : 1.12)
        const midday = Math.exp(-((h - 13) ** 2) / 14) * (weekend ? 0.95 : 0.4)
        const night = Math.exp(-((h - 2) ** 2) / 6) * (weekend ? 0.4 : 0.1)
        const shape = (morning + evening) * spec.commuter + midday * 0.6 + night * 0.25
        const value =
          spec.base * 0.25 +
          shape * spec.base * 0.95 +
          (wave(d * 24 + h) - 0.5) * 9 +
          rng.normal(0, 3)
        row.push(clamp(value, 2, 100))
      }
      grid.push(row)
    }
    const flat = grid.flat()
    return {
      id: spec.id,
      name: spec.name,
      grid,
      lengthKm: spec.lengthKm,
      // Congestion index 0–100 mapped onto a plausible free-flow speed.
      meanSpeed: 64 - (summarize(flat).mean / 100) * 42,
    }
  })

  const weekly: number[] = []
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      weekly.push(corridors.reduce((sum, c) => sum + c.grid[d][h], 0) / corridors.length)
    }
  }

  const { nodes, edges } = buildRoadGraph(`${seed}:graph`)
  const incidents = buildIncidents(`${seed}:incidents`, corridors)

  return { corridors, weekly, nodes, edges, incidents, insights: analyse(corridors, weekly, incidents) }
}

/**
 * A ring-and-spoke road graph laid out in normalised 0–1 space. Positions are
 * fixed rather than force-simulated: a city map that reshuffles on every reload
 * stops reading as a map.
 */
function buildRoadGraph(seed: string): { nodes: RoadNode[]; edges: RoadEdge[] } {
  const rng = new Rng(seed)
  const nodes: RoadNode[] = []
  const edges: RoadEdge[] = []

  nodes.push({ id: 0, x: 0.5, y: 0.5, weight: 1 })

  const rings = [
    { r: 0.16, count: 6 },
    { r: 0.3, count: 10 },
    { r: 0.44, count: 14 },
  ]

  let id = 1
  const ringIds: number[][] = []
  for (const ring of rings) {
    const ids: number[] = []
    for (let i = 0; i < ring.count; i++) {
      const a = (i / ring.count) * Math.PI * 2 + rng.range(-0.06, 0.06)
      const r = ring.r * rng.range(0.93, 1.07)
      nodes.push({
        id,
        x: 0.5 + Math.cos(a) * r,
        y: 0.5 + Math.sin(a) * r * 0.78,
        weight: rng.range(0.45, 1),
      })
      ids.push(id)
      id++
    }
    ringIds.push(ids)
  }

  // Ring roads.
  for (const ids of ringIds) {
    for (let i = 0; i < ids.length; i++) {
      edges.push({ from: ids[i], to: ids[(i + 1) % ids.length], load: rng.range(0.25, 1) })
    }
  }
  // Spokes from the centre outward, each ring linking to the nearest node out.
  for (const inner of ringIds[0]) edges.push({ from: 0, to: inner, load: rng.range(0.5, 1) })
  for (let r = 0; r < ringIds.length - 1; r++) {
    for (const from of ringIds[r]) {
      const to = nearest(nodes, from, ringIds[r + 1])
      edges.push({ from, to, load: rng.range(0.2, 0.95) })
    }
  }

  return { nodes, edges }
}

function nearest(nodes: RoadNode[], fromId: number, candidates: number[]): number {
  const a = nodes.find((n) => n.id === fromId)!
  let best = candidates[0]
  let bestD = Infinity
  for (const id of candidates) {
    const b = nodes.find((n) => n.id === id)!
    const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2
    if (d < bestD) {
      bestD = d
      best = id
    }
  }
  return best
}

function buildIncidents(seed: string, corridors: Corridor[]): Incident[] {
  const rng = new Rng(seed)
  const kinds = ['Collision', 'Stalled vehicle', 'Signal fault', 'Roadworks', 'Debris']
  const severities: Incident['severity'][] = ['warning', 'serious', 'critical']
  return Array.from({ length: 5 }, () => {
    const c = rng.pick(corridors)
    return {
      corridor: c.name,
      day: rng.int(0, 6),
      hour: rng.int(6, 20),
      severity: rng.pick(severities),
      kind: rng.pick(kinds),
    }
  }).sort((a, b) => a.day * 24 + a.hour - (b.day * 24 + b.hour))
}

function analyse(corridors: Corridor[], weekly: number[], incidents: Incident[]): Insight[] {
  const out: Insight[] = []
  const stats = summarize(weekly)

  const peakIdx = weekly.indexOf(Math.max(...weekly))
  out.push({
    id: 'peak',
    kind: 'summary',
    severity: 'warning',
    text: `The week peaks on ${DAYS[Math.floor(peakIdx / 24)]} at ${String(peakIdx % 24).padStart(2, '0')}:00, with a city-wide congestion index of ${dec(weekly[peakIdx])}.`,
    evidence: `p95 ${dec(stats.p95)}`,
  })

  const period = dominantPeriod(weekly, [12, 24, 48, 168])
  if (period) {
    out.push({
      id: 'seasonality',
      kind: 'seasonality',
      severity: 'info',
      text: `Congestion repeats on a ${period.lag}-hour cycle — the commuter rhythm dominates every other signal in the week.`,
      evidence: `autocorr ${period.strength.toFixed(2)}`,
    })
  }

  const worst = [...corridors].sort((a, b) => b.grid.flat().reduce((x, y) => x + y, 0) - a.grid.flat().reduce((x, y) => x + y, 0))[0]
  const best = [...corridors].sort((a, b) => a.grid.flat().reduce((x, y) => x + y, 0) - b.grid.flat().reduce((x, y) => x + y, 0))[0]
  out.push({
    id: 'corridors',
    kind: 'summary',
    severity: 'info',
    text: `${worst.name} carries the heaviest sustained load at ${dec(worst.meanSpeed)} km/h mean speed; ${best.name} runs freest at ${dec(best.meanSpeed)} km/h.`,
    evidence: `${corridors.length} corridors`,
  })

  const weekdayMean = summarize(weekly.slice(0, 5 * 24)).mean
  const weekendMean = summarize(weekly.slice(5 * 24)).mean
  out.push({
    id: 'weekend',
    kind: 'trend',
    severity: 'good',
    text: `Weekend load runs ${(((weekdayMean - weekendMean) / weekdayMean) * 100).toFixed(0)}% below the weekday average, and the twin commuter peaks collapse into one midday hump.`,
    evidence: `${dec(weekdayMean)} vs ${dec(weekendMean)}`,
  })

  const critical = incidents.filter((i) => i.severity === 'critical')
  out.push({
    id: 'incidents',
    kind: 'anomaly',
    severity: critical.length ? 'critical' : 'warning',
    text: `${int(incidents.length)} incidents logged this week${critical.length ? `, ${critical.length} of them critical — the worst on ${critical[0].corridor} (${critical[0].kind})` : ''}.`,
    evidence: `${incidents.length} events`,
  })

  const nightMean = summarize(weekly.filter((_, i) => i % 24 < 5)).mean
  out.push({
    id: 'night',
    kind: 'summary',
    severity: 'good',
    text: `Overnight (00:00–05:00) the network sits at ${dec(nightMean)} — effectively free-flowing across all corridors.`,
    evidence: `min ${dec(stats.min)}`,
  })

  return out
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
