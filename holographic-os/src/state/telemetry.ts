import { batch, signal } from '@preact/signals'
import { clamp, lerp, makeNoise, makeRng, RingBuffer } from '@/lib/util'

/**
 * Simulated machine telemetry.
 *
 * Two channels on purpose:
 *   - `stats` (a signal, 10 Hz) drives the numeric readouts.
 *   - the ring buffers are plain mutable arrays that canvas graphs sample on
 *     their own rAF loop, so eight scrolling charts never touch the VDOM.
 *
 * `fps` is the one genuinely real number here — the WebGL loop reports it via
 * `reportFrame()`, so the graph reacts to actual load on the user's machine.
 */

export const TOTAL_RAM_GB = 64
export const TOTAL_VRAM_GB = 24
export const CORE_COUNT = 8

/** 10 Hz × 180 samples = a rolling 18-second window. */
const HISTORY = 180
const SAMPLE_MS = 100

export interface Stats {
  cpu: number
  cores: number[]
  gpu: number
  vram: number
  ram: number
  cpuTemp: number
  gpuTemp: number
  fan: number
  netDown: number
  netUp: number
  diskRead: number
  diskWrite: number
  power: number
  fps: number
  uptimeMs: number
}

export interface ProcessRow {
  pid: number
  name: string
  cpu: number
  gpu: number
  mem: number
  kind: 'system' | 'user' | 'render'
}

export const history = {
  cpu: new RingBuffer(HISTORY),
  gpu: new RingBuffer(HISTORY),
  ram: new RingBuffer(HISTORY),
  vram: new RingBuffer(HISTORY),
  netDown: new RingBuffer(HISTORY),
  netUp: new RingBuffer(HISTORY),
  gpuTemp: new RingBuffer(HISTORY),
  power: new RingBuffer(HISTORY),
  fps: new RingBuffer(HISTORY),
}

export const stats = signal<Stats>({
  cpu: 12,
  cores: new Array(CORE_COUNT).fill(12),
  gpu: 18,
  vram: 4.2,
  ram: 18.4,
  cpuTemp: 42,
  gpuTemp: 48,
  fan: 1200,
  netDown: 2.4,
  netUp: 0.6,
  diskRead: 8,
  diskWrite: 3,
  power: 96,
  fps: 60,
  uptimeMs: 0,
})

export const processes = signal<ProcessRow[]>([])

const noiseCpu = makeNoise(1337)
const noiseGpu = makeNoise(4242)
const noiseNet = makeNoise(909)
const noiseRam = makeNoise(77)
const coreNoise = Array.from({ length: CORE_COUNT }, (_, i) => makeNoise(200 + i * 37))
const rng = makeRng(20260807)

const BASE_PROCESSES: Array<{ name: string; kind: ProcessRow['kind']; weight: number; mem: number }> = [
  { name: 'holo-compositor', kind: 'system', weight: 0.3, mem: 2.1 },
  { name: 'novad (assistant)', kind: 'system', weight: 0.12, mem: 1.4 },
  { name: 'volumetric-render', kind: 'render', weight: 0.34, mem: 5.8 },
  { name: 'lattice-projector', kind: 'render', weight: 0.18, mem: 3.2 },
  { name: 'atmos-sim', kind: 'user', weight: 0.08, mem: 0.9 },
  { name: 'vault-indexer', kind: 'system', weight: 0.05, mem: 0.6 },
  { name: 'net-relay', kind: 'system', weight: 0.04, mem: 0.4 },
  { name: 'telemetry-agent', kind: 'system', weight: 0.03, mem: 0.3 },
  { name: 'shell', kind: 'user', weight: 0.02, mem: 0.2 },
]

/** A transient burst of load, e.g. a window opening or a render job starting. */
interface Burst {
  start: number
  duration: number
  gpu: number
  cpu: number
}

let bursts: Burst[] = []
let startedAt = 0
let timer: number | null = null
let t = 0

// --- real frame timing -------------------------------------------------------
let frameCount = 0
let frameWindowStart = 0
let measuredFps = 60

/** Called once per rendered WebGL frame by the background renderer. */
export function reportFrame(now: number): void {
  if (frameWindowStart === 0) frameWindowStart = now
  frameCount++
  const elapsed = now - frameWindowStart
  if (elapsed >= 500) {
    measuredFps = (frameCount * 1000) / elapsed
    frameCount = 0
    frameWindowStart = now
  }
}

/** Kicks a load spike — the shell calls this when the user opens something. */
export function pulseLoad(intensity = 1): void {
  bursts.push({
    start: performance.now(),
    duration: 1400 + rng() * 1800,
    gpu: 22 * intensity + rng() * 18 * intensity,
    cpu: 14 * intensity + rng() * 12 * intensity,
  })
  if (bursts.length > 12) bursts = bursts.slice(-12)
}

function burstAt(now: number, key: 'gpu' | 'cpu'): number {
  let total = 0
  for (const b of bursts) {
    const p = (now - b.start) / b.duration
    if (p < 0 || p > 1) continue
    // Fast attack, slow decay.
    const env = p < 0.15 ? p / 0.15 : Math.pow(1 - (p - 0.15) / 0.85, 1.6)
    total += b[key] * env
  }
  return total
}

function sample(): void {
  const now = performance.now()
  t += SAMPLE_MS / 1000
  bursts = bursts.filter((b) => now - b.start < b.duration)

  const prev = stats.peek()

  // --- GPU: idle floor + slow swell + bursts ---
  const gpuTarget = clamp(16 + noiseGpu(t * 0.35) * 26 + burstAt(now, 'gpu'), 3, 99)
  const gpu = lerp(prev.gpu, gpuTarget, 0.28)

  // --- CPU: correlated with GPU but noisier ---
  const cpuTarget = clamp(8 + noiseCpu(t * 0.5) * 22 + gpu * 0.32 + burstAt(now, 'cpu'), 2, 99)
  const cpu = lerp(prev.cpu, cpuTarget, 0.33)

  const cores = coreNoise.map((n, i) => {
    const spread = n(t * 0.9 + i * 3.1) * 46 - 18
    return clamp(cpu + spread, 0, 100)
  })

  // --- Memory drifts slowly and tracks GPU load for VRAM ---
  const ram = clamp(16 + noiseRam(t * 0.12) * 12 + gpu * 0.08, 8, TOTAL_RAM_GB * 0.92)
  const vram = clamp(3.4 + gpu * 0.09 + noiseRam(t * 0.2 + 40) * 3.2, 1.5, TOTAL_VRAM_GB * 0.95)

  // --- Thermals lag load, fan chases temperature ---
  const gpuTemp = lerp(prev.gpuTemp, 38 + gpu * 0.46, 0.05)
  const cpuTemp = lerp(prev.cpuTemp, 35 + cpu * 0.42, 0.06)
  const fan = lerp(prev.fan, 900 + Math.max(0, gpuTemp - 44) * 132, 0.04)

  // --- Network: bursty downloads, thin uplink ---
  const netDown = clamp(Math.pow(Math.max(0, noiseNet(t * 0.7)), 2.1) * 78 + rng() * 1.5, 0, 120)
  const netUp = clamp(netDown * 0.14 + noiseNet(t * 1.3 + 12) * 2.4, 0, 40)

  const diskRead = clamp(noiseNet(t * 1.1 + 60) * 140 * (gpu > 55 ? 1.8 : 0.5), 0, 520)
  const diskWrite = clamp(noiseNet(t * 0.9 + 90) * 60 * 0.7, 0, 300)

  const power = clamp(52 + gpu * 2.4 + cpu * 0.9, 40, 420)

  const fps = measuredFps

  stats.value = {
    cpu,
    cores,
    gpu,
    vram,
    ram,
    cpuTemp,
    gpuTemp,
    fan,
    netDown,
    netUp,
    diskRead,
    diskWrite,
    power,
    fps,
    uptimeMs: now - startedAt,
  }

  history.cpu.push(cpu)
  history.gpu.push(gpu)
  history.ram.push((ram / TOTAL_RAM_GB) * 100)
  history.vram.push((vram / TOTAL_VRAM_GB) * 100)
  history.netDown.push(netDown)
  history.netUp.push(netUp)
  history.gpuTemp.push(gpuTemp)
  history.power.push(power)
  history.fps.push(fps)

  // Process table refreshes at 2 Hz — fast enough to feel live, slow enough to read.
  if (Math.round(t * 10) % 5 === 0) {
    const rows = BASE_PROCESSES.map((p, i) => ({
      pid: 1024 + i * 137,
      name: p.name,
      cpu: clamp(cpu * p.weight * (0.7 + rng() * 0.6), 0, 100),
      gpu: clamp(gpu * p.weight * (p.kind === 'render' ? 1.6 : 0.4) * (0.7 + rng() * 0.6), 0, 100),
      mem: p.mem * (0.9 + rng() * 0.25),
      kind: p.kind,
    }))
    rows.sort((a, b) => b.cpu - a.cpu)
    processes.value = rows
  }
}

export function startTelemetry(): () => void {
  if (timer !== null) return () => {}
  startedAt = performance.now() - 4 * 3600 * 1000 - 17 * 60 * 1000 // pretend we booted earlier today
  // Prime the history so graphs open with a full trace instead of drawing in.
  // Batched so 180 primer samples collapse into a single notification.
  batch(() => {
    for (let i = 0; i < HISTORY; i++) sample()
  })
  timer = window.setInterval(sample, SAMPLE_MS)
  return () => {
    if (timer !== null) window.clearInterval(timer)
    timer = null
  }
}
