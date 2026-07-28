import { Rng, fbm1d } from '@/lib/rng'
import { bytes, compact, dec } from '@/lib/format'
import { summarize, topAnomaly, type Insight } from '@/lib/stats'

/**
 * Network packets — a topology of core, edge and client nodes with packets
 * animating along the links.
 *
 * A node-link diagram is an all-pairs form: any two nodes can end up adjacent,
 * so the palette's all-pairs cap applies and node classes stop at **three**
 * (validated: worst all-pairs CVD ΔE 9.4 dark / 9.2 light). Shape reinforces
 * the class so identity never rests on hue alone.
 */

export const NODE_CLASSES = [
  { key: 'core', label: 'Core router', slot: 1 },
  { key: 'edge', label: 'Edge gateway', slot: 2 },
  { key: 'client', label: 'Client subnet', slot: 3 },
] as const

export type NodeClass = (typeof NODE_CLASSES)[number]['key']

export interface NetNode {
  id: number
  name: string
  cls: NodeClass
  /** Simulation position, filled by d3-force in the view. */
  x?: number
  y?: number
  vx?: number
  vy?: number
  /** Packets per second currently transiting this node. */
  pps: number
  latencyMs: number
}

export interface NetLink {
  source: number | NetNode
  target: number | NetNode
  /** 0–1 utilisation; drives packet spawn rate and link weight. */
  util: number
  capacityGbps: number
}

export interface ProtocolSlice {
  name: string
  slot: number
  share: number
}

export interface NetworkData {
  nodes: NetNode[]
  links: NetLink[]
  protocols: ProtocolSlice[]
  /** 180 seconds of aggregate throughput, Gbps. */
  throughput: number[]
  /** Latency histogram: bucket upper bound in ms → count. */
  latency: { bucket: number; count: number }[]
  insights: Insight[]
}

const CORE_NAMES = ['ams-core-1', 'fra-core-1', 'lhr-core-2', 'sin-core-1']
const EDGE_NAMES = [
  'ap-south-2',
  'us-east-4',
  'eu-west-1',
  'sa-east-1',
  'af-north-1',
  'us-west-3',
  'eu-north-2',
  'ap-ne-1',
]

export function generateNetwork(seed = 'network-packets'): NetworkData {
  const rng = new Rng(seed)
  const nodes: NetNode[] = []
  const links: NetLink[] = []

  CORE_NAMES.forEach((name) => {
    nodes.push({ id: nodes.length, name, cls: 'core', pps: rng.range(180_000, 340_000), latencyMs: rng.range(0.4, 1.6) })
  })
  EDGE_NAMES.forEach((name) => {
    nodes.push({ id: nodes.length, name, cls: 'edge', pps: rng.range(40_000, 120_000), latencyMs: rng.range(3, 14) })
  })
  for (let i = 0; i < 26; i++) {
    nodes.push({
      id: nodes.length,
      name: `subnet-${String(i + 1).padStart(2, '0')}`,
      cls: 'client',
      pps: rng.range(600, 9_000),
      latencyMs: rng.range(8, 48),
    })
  }

  const cores = nodes.filter((n) => n.cls === 'core')
  const edges = nodes.filter((n) => n.cls === 'edge')
  const clients = nodes.filter((n) => n.cls === 'client')

  // Full mesh between cores — that is what makes them cores.
  for (let i = 0; i < cores.length; i++) {
    for (let j = i + 1; j < cores.length; j++) {
      links.push({ source: cores[i].id, target: cores[j].id, util: rng.range(0.35, 0.85), capacityGbps: 400 })
    }
  }
  // Each edge homes to two cores for redundancy.
  edges.forEach((e, i) => {
    links.push({ source: cores[i % cores.length].id, target: e.id, util: rng.range(0.2, 0.9), capacityGbps: 100 })
    links.push({ source: cores[(i + 1) % cores.length].id, target: e.id, util: rng.range(0.1, 0.6), capacityGbps: 100 })
  })
  // Clients hang off a single edge.
  clients.forEach((c, i) => {
    links.push({ source: edges[i % edges.length].id, target: c.id, util: rng.range(0.05, 0.7), capacityGbps: 10 })
  })

  // One edge gets a deliberate burst so the anomaly scan has a real target.
  const hotspot = edges[0]
  hotspot.pps *= 3.4
  hotspot.latencyMs *= 4.1
  for (const l of links) {
    if (l.target === hotspot.id || l.source === hotspot.id) l.util = Math.min(0.98, l.util * 1.9)
  }

  const wave = fbm1d(`${seed}:throughput`, 4)
  const throughput: number[] = []
  for (let i = 0; i < 180; i++) {
    const base = 42 + Math.sin(i / 22) * 6 + (wave(i * 0.12) - 0.5) * 14
    // A short burst three-quarters of the way through the window.
    const burst = i > 132 && i < 146 ? 26 * Math.exp(-((i - 139) ** 2) / 12) : 0
    throughput.push(Math.max(4, base + burst + rng.normal(0, 1.4)))
  }

  const protocols: ProtocolSlice[] = [
    { name: 'TCP', slot: 1, share: 0.492 },
    { name: 'QUIC', slot: 2, share: 0.263 },
    { name: 'UDP', slot: 3, share: 0.144 },
    { name: 'ICMP', slot: 4, share: 0.061 },
    { name: 'Other', slot: 5, share: 0.04 },
  ]

  // Latency is log-normal in practice — a long right tail, not a bell.
  const latencyRng = new Rng(`${seed}:latency`)
  const buckets = [2, 5, 10, 20, 40, 80, 160, 320, 640]
  const samples = Array.from({ length: 4000 }, () => Math.exp(latencyRng.normal(2.5, 0.85)))
  const latency = buckets.map((bucket, i) => ({
    bucket,
    count: samples.filter((s) => s <= bucket && s > (buckets[i - 1] ?? 0)).length,
  }))

  return { nodes, links, protocols, throughput, latency, insights: analyse(nodes, links, throughput, hotspot) }
}

function analyse(nodes: NetNode[], links: NetLink[], throughput: number[], hotspot: NetNode): Insight[] {
  const out: Insight[] = []
  const stats = summarize(throughput)

  out.push({
    id: 'throughput',
    kind: 'summary',
    severity: 'info',
    text: `Aggregate throughput averages ${dec(stats.mean)} Gbps over the 180-second window, peaking at ${dec(stats.max)} Gbps.`,
    evidence: `p95 ${dec(stats.p95)} Gbps`,
  })

  const burst = topAnomaly(throughput, 40, 2.5)
  if (burst) {
    out.push({
      id: 'burst',
      kind: 'anomaly',
      severity: burst.z >= 4 ? 'critical' : 'serious',
      text: `Traffic burst at t+${burst.index}s reaches ${dec(burst.value)} Gbps against a 40-second rolling baseline — consistent with a volumetric event, not organic growth.`,
      evidence: `z +${burst.z.toFixed(1)}σ`,
    })
  }

  out.push({
    id: 'hotspot',
    kind: 'anomaly',
    severity: 'serious',
    text: `${hotspot.name} is the outlier node: ${compact(hotspot.pps)} pps at ${dec(hotspot.latencyMs)} ms, well clear of its peer gateways.`,
    evidence: `${links.filter((l) => l.source === hotspot.id || l.target === hotspot.id).length} adjacent links saturated`,
  })

  const saturated = links.filter((l) => l.util > 0.85)
  out.push({
    id: 'saturation',
    kind: 'summary',
    severity: saturated.length > 6 ? 'critical' : saturated.length > 2 ? 'warning' : 'good',
    text: `${saturated.length} of ${links.length} links are running above 85% utilisation.`,
    evidence: `${((saturated.length / links.length) * 100).toFixed(0)}% of the fabric`,
  })

  const totalPps = nodes.reduce((a, n) => a + n.pps, 0)
  out.push({
    id: 'volume',
    kind: 'summary',
    severity: 'info',
    text: `The fabric is forwarding ${compact(totalPps)} packets per second across ${nodes.length} nodes — roughly ${bytes(totalPps * 780)} per second at a 780-byte average frame.`,
    evidence: `${nodes.length} nodes · ${links.length} links`,
  })

  const clientLatency = nodes.filter((n) => n.cls === 'client').map((n) => n.latencyMs)
  const cl = summarize(clientLatency)
  out.push({
    id: 'latency',
    kind: 'summary',
    severity: cl.p95 > 40 ? 'warning' : 'good',
    text: `Client-subnet latency has a median of ${dec(cl.p50)} ms and a 95th percentile of ${dec(cl.p95)} ms — the distribution is log-normal, so the tail carries the pain.`,
    evidence: `n = ${clientLatency.length}`,
  })

  return out
}
