/**
 * The live 2040 hologram. Loaded lazily the first time the timeline nears
 * the end of the page.
 */

import { CAMERA, TARGET, buildScene, eyeFor } from './scene'
import { Holo2D } from './holo2d'
import { GpuHolo, type HoloRenderer } from '@/gpu/holo'
import { getGpu } from '@/gpu/device'
import { lookAt, multiply, perspective } from '@/lib/mat4'
import { LIVE } from '@/timeline/eras'
import { currentT, onProgress, prefersReducedMotion, ramp, within } from '@/timeline/progress'

export interface SciFiMount {
  root: HTMLElement
  canvas: HTMLCanvasElement
  count: HTMLElement
}

/** Points fly in from the glass panels across this stretch of t… */
const ARRIVAL = [5.6, 6.0] as const
/** …and fall into a single point across this one. */
const COLLAPSE = [6.6, 6.92] as const
/** Panel rects are sampled while 2025 is still whole. */
const SAMPLE = [5.3, 5.63] as const

let clock = 0
let pulseAt = -1

/** "Show me the lake": send a ring of light across the reconstruction. */
export function pulse(): void {
  pulseAt = clock
}

export async function mountSciFi(m: SciFiMount): Promise<() => void> {
  const scene = buildScene()
  const gpu = await getGpu()
  const holo: HoloRenderer = (gpu && (await GpuHolo.create(gpu, m.canvas, scene))) || new Holo2D(m.canvas, scene)
  m.root.dataset.gpu = holo instanceof GpuHolo ? 'on' : 'off'
  m.count.textContent = `${holo.count.toLocaleString('en-US')} points`

  // ── where each point is born: somewhere inside a 2025 glass panel ──────
  const starts = new Float32Array(scene.count * 4)
  let sampledAt = -Infinity
  const seedStarts = () => {
    const stage = m.root.parentElement
    if (!stage) return
    const sr = stage.getBoundingClientRect()
    const rects = Array.from(document.querySelectorAll<HTMLElement>('.layer-glass .gl-panel'))
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 8 && r.height > 8)
    const cum: number[] = []
    let total = 0
    for (const r of rects) cum.push((total += r.width * r.height))
    for (let i = 0; i < scene.count; i++) {
      const s0 = scene.seed[i * 4]
      const s1 = scene.seed[i * 4 + 1]
      const s2 = scene.seed[i * 4 + 2]
      const s3 = scene.seed[i * 4 + 3]
      let x = s2 * 2 - 1
      let y = s3 * 2 - 1
      if (rects.length) {
        const pick = s0 * total
        let k = 0
        while (k < cum.length - 1 && cum[k] < pick) k++
        const r = rects[k]
        x = ((r.left + s2 * r.width - sr.left) / sr.width) * 2 - 1
        y = 1 - ((r.top + s3 * r.height - sr.top) / sr.height) * 2
      }
      starts[i * 4] = x
      starts[i * 4 + 1] = y
      starts[i * 4 + 2] = s1 * 0.42 // arrival delay
      starts[i * 4 + 3] = s0
    }
    holo.setStarts(starts)
  }
  seedStarts()

  // ── camera and pointer ────────────────────────────────────────────────
  const reduced = prefersReducedMotion()
  const cam = { yaw: 0, pitch: 0, drag: false, id: -1, lx: 0, ly: 0 }
  const ptr = { x: 0, y: 0, over: false, kick: 0 }
  const isHud = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('.sf-panel, .sf-cmd, .sf-top, button, input, textarea, a')

  const onMove = (e: PointerEvent) => {
    const r = m.canvas.getBoundingClientRect()
    ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1
    ptr.y = 1 - ((e.clientY - r.top) / r.height) * 2
    ptr.over = !isHud(e.target)
    if (cam.drag && e.pointerId === cam.id) {
      cam.yaw -= (e.clientX - cam.lx) * 0.006
      cam.pitch = Math.min(0.34, Math.max(-0.24, cam.pitch + (e.clientY - cam.ly) * 0.004))
      cam.lx = e.clientX
      cam.ly = e.clientY
    }
    wake()
  }
  const onDown = (e: PointerEvent) => {
    if (isHud(e.target) || e.button !== 0) return
    cam.drag = true
    cam.id = e.pointerId
    cam.lx = e.clientX
    cam.ly = e.clientY
    ptr.kick = 1
    m.root.setPointerCapture(e.pointerId)
  }
  const onUp = (e: PointerEvent) => {
    if (e.pointerId === cam.id) cam.drag = false
  }
  const onLeave = () => {
    ptr.over = false
  }
  m.root.addEventListener('pointermove', onMove)
  m.root.addEventListener('pointerdown', onDown)
  m.root.addEventListener('pointerup', onUp)
  m.root.addEventListener('pointercancel', onUp)
  m.root.addEventListener('pointerleave', onLeave)

  // ── frame loop, parked whenever 2040 isn't on screen ──────────────────
  const born = performance.now()
  let last = born
  let raf = 0
  let blank = false

  const frame = (now: number) => {
    raf = 0
    const t = currentT()
    if (!within(LIVE.scifi, t)) return
    const time = (now - born) / 1000
    clock = time
    const dt = Math.min(1 / 30, (now - last) / 1000)
    last = now

    if (t >= SAMPLE[0] && t <= SAMPLE[1] && now - sampledAt > 300) {
      sampledAt = now
      seedStarts()
    }

    const arrival = ramp(ARRIVAL[0], ARRIVAL[1], t)
    const w = m.canvas.clientWidth || 1
    const h = m.canvas.clientHeight || 1
    const aspect = w / h
    const yaw = cam.yaw + (reduced ? 0 : Math.sin(time * 0.08) * 0.28)
    const { view, right, up } = lookAt(eyeFor(aspect, yaw, cam.pitch), TARGET)
    const viewProj = multiply(perspective(CAMERA.fov, aspect, 0.05, 20), view)

    ptr.kick *= Math.pow(0.02, dt) // decays over about a second
    const p = pulseAt >= 0 ? (time - pulseAt) / 1.6 : -1
    if (p > 1) pulseAt = -1

    holo.frame({
      viewProj,
      right,
      up,
      time,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      arrival,
      collapse: ramp(COLLAPSE[0], COLLAPSE[1], t),
      pointer: [ptr.x, ptr.y, ptr.over || ptr.kick > 0.05 ? 1 : 0, (ptr.over ? 1.1 : 0) + ptr.kick * 3],
      dt,
      aspect,
      scanX: ((time * 0.3) % 1) * 4.6 - 2.3,
      pulse: p >= 0 && p <= 1 ? p : -1,
      still: reduced,
    })

    // Before the points arrive there's nothing to draw: clear once, then
    // wait for the scroll listener to wake us.
    if (arrival <= 0) {
      if (blank) return
      blank = true
    } else blank = false
    raf = requestAnimationFrame(frame)
  }
  const wake = () => {
    if (!raf) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }
  const off = onProgress(wake)
  const onResize = () => {
    sampledAt = -Infinity
    wake()
  }
  window.addEventListener('resize', onResize)

  return () => {
    off()
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    m.root.removeEventListener('pointermove', onMove)
    m.root.removeEventListener('pointerdown', onDown)
    m.root.removeEventListener('pointerup', onUp)
    m.root.removeEventListener('pointercancel', onUp)
    m.root.removeEventListener('pointerleave', onLeave)
    holo.destroy()
  }
}
