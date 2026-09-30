/**
 * LAKE.PCX, rebuilt as a point cloud.
 *
 * The 2040 hologram isn't a picture of the photo: it re-derives the scene
 * from the same seeded ridge functions that drew it (src/lib/landscape.ts),
 * so the mountains have the same silhouettes, the sun sits in the same
 * valley and the pines stand on the same shore — now with depth.
 *
 * Per point, four floats in each of three arrays:
 *   base  = x, y, z, sprite size (px)
 *   color = r, g, b, kind   (0 solid · 1 ring · 2 star · 3 reflection · 4 water · 5 paint)
 *   seed  = four uniform randoms (the renderer uses two)
 */

import { H, HORIZON, RIDGES, SUN, TREES, W, ridgeHeight, rng } from '@/lib/landscape'

export const KIND = { solid: 0, ring: 1, star: 2, reflection: 3, water: 4, paint: 5 } as const

/**
 * Points held back for whatever was painted over the photo in 1995. They sit
 * at the end of every buffer with size 0 until writeArt() fills them in.
 */
export const ART_SLOTS = 6000

/** Where the camera looks, and where everything collapses to at the end. */
export const TARGET: readonly [number, number, number] = [0, 0.22, -0.95]
export const COLLAPSE_POINT: readonly [number, number, number] = [0, 0.62, -0.9]

export interface Scene {
  count: number
  base: Float32Array
  color: Float32Array
  seed: Float32Array
}

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
]
const mix3 = (a: number[], b: number[], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

/**
 * Ridge i sits this far back, spans this deep, and is scaled this tall.
 * Relief is exaggerated ~1.45× over the photo: a faithful 3D copy of a
 * 320×200 sunset is a thin strip, and holograms are allowed to show off.
 */
const RIDGE_Z = [-2.05, -1.4, -0.82]
const RIDGE_DEPTH = [0.5, 0.38, 0.26]
const RIDGE_SCALE = [0.0171, 0.0148, 0.0138]
const RIDGE_WIDTH = [1.45, 1.22, 1.06]

/** Photo x (0…W) → world x for something at ridge depth `widen`. */
const worldX = (x: number, widen = 1) => (x / W - 0.5) * 2.6 * widen

/** The orbit camera, shared by the renderer and the framing tests. */
export const CAMERA = { fov: (50 * Math.PI) / 180, dist: 3, pitch: 0.28 }

export function eyeFor(aspect: number, yaw: number, pitchOffset = 0): [number, number, number] {
  const pitch = CAMERA.pitch + pitchOffset
  // Portrait screens pull the camera back so the whole range fits.
  const dist = CAMERA.dist * Math.max(1, 1.35 / aspect)
  return [
    TARGET[0] + Math.sin(yaw) * Math.cos(pitch) * dist,
    TARGET[1] + Math.sin(pitch) * dist,
    TARGET[2] + Math.cos(yaw) * Math.cos(pitch) * dist,
  ]
}

export function buildScene(): Scene {
  const r = rng(2040)
  const base: number[] = []
  const color: number[] = []
  const seed: number[] = []
  const push = (x: number, y: number, z: number, size: number, c: readonly number[], kind: number) => {
    base.push(x, y, z, size)
    color.push(c[0], c[1], c[2], kind)
    seed.push(r(), r(), r(), r())
  }

  // Mountain ranges: a heightfield per ridge, peaked along its ridgeline,
  // plus its reflection in the lake.
  RIDGES.forEach((ridge, i) => {
    const cols = 250
    const rows = 26
    const c0 = hex(ridge.color)
    for (let cx = 0; cx < cols; cx++) {
      const sx = (cx / (cols - 1)) * W
      const h = ridgeHeight(i, sx)
      for (let rz = 0; rz < rows; rz++) {
        const dz = (rz / (rows - 1) - 0.5) * 2 * RIDGE_DEPTH[i]
        const fall = Math.exp(-((dz / (RIDGE_DEPTH[i] * 0.55)) ** 2))
        const y = h * RIDGE_SCALE[i] * fall * (0.9 + 0.1 * r())
        if (y < 0.012) continue
        const x = worldX(sx + (r() - 0.5) * 1.6, RIDGE_WIDTH[i])
        const z = RIDGE_Z[i] + dz + (r() - 0.5) * 0.02
        const peak = y / (ridge.amp * RIDGE_SCALE[i])
        const c = mix3(c0, [1, 0.82, 0.86], peak * 0.35)
        push(x, y, z, 2.1, c, KIND.solid)
        push(x, -y * 0.92, z, 1.8, c, KIND.reflection)
      }
    }
  })

  // The lake: warm near the horizon, dark at the shore.
  const warm = hex('#f29a78')
  const mid = hex('#8d4a86')
  const deep = hex('#1a1334')
  for (let k = 0; k < 7000; k++) {
    const x = (r() - 0.5) * 4.2
    const z = -2.2 + r() * 2.9
    const u = (z + 2.2) / 2.9
    const c = u < 0.3 ? mix3(warm, mid, u / 0.3) : mix3(mid, deep, (u - 0.3) / 0.7)
    push(x, 0, z, 1.5, c, KIND.water)
  }

  // The sun, setting into the valley in the far range.
  const sunX = worldX(SUN.x, RIDGE_WIDTH[0])
  const sunY = (HORIZON - SUN.y) * RIDGE_SCALE[0]
  const sunZ = -2.45
  const sunR = SUN.r * RIDGE_SCALE[0] * 0.9
  const sunC = hex('#ffe9b8')
  for (let k = 0; k < 1800; k++) {
    const u = r() * 2 - 1
    const a = r() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const rad = sunR * Math.cbrt(r())
    push(sunX + Math.cos(a) * s * rad, sunY + u * rad, sunZ + Math.sin(a) * s * rad, 2.6, sunC, KIND.solid)
  }
  // …and its glitter path across the water toward us.
  const glint = hex('#ffe2a6')
  for (let k = 0; k < 520; k++) {
    const z = sunZ + 0.2 + r() ** 0.7 * 2.9
    const spread = 0.04 + ((z - sunZ) / 2.9) * 0.22
    push(sunX * (1 - ((z - sunZ) / 2.9) * 0.4) + (r() - 0.5) * spread, 0.002, z, 2, glint, KIND.water)
  }

  // Pines on the shores.
  const pine = hex('#2f8f73')
  for (const t of TREES) {
    const left = t.x < W / 2
    const tx = worldX(t.x, 1.1)
    const tz = left ? -0.62 + (t.x / 80) * -0.15 : -0.7
    const th = t.h * 0.016
    const ground = left ? ridgeHeight(2, t.x) * RIDGE_SCALE[2] * 0.35 : 0
    for (let k = 0; k < 200; k++) {
      const y = r() ** 1.3 * th
      const rad = (1 - y / th) * th * 0.28 * Math.sqrt(r())
      const a = r() * Math.PI * 2
      push(tx + Math.cos(a) * rad, ground + y, tz + Math.sin(a) * rad, 1.9, pine, KIND.solid)
    }
  }

  // Stars on a far dome.
  const star = [0.92, 0.95, 1]
  for (let k = 0; k < 900; k++) {
    const a = (r() - 0.5) * Math.PI * 1.1
    const e = 0.2 + r() * 0.9
    const d = 4.4
    push(Math.sin(a) * Math.cos(e) * d, 0.5 + Math.sin(e) * d * 0.55, TARGET[2] - Math.cos(a) * Math.cos(e) * d, 1.4, star, KIND.star)
  }

  // Two instrument rings around the reconstruction.
  const ringC = [0.45, 1, 1]
  for (let k = 0; k < 1500; k++) {
    const a = (k / 1500) * Math.PI * 2
    push(Math.cos(a) * 1.9, 0.01, TARGET[2] + Math.sin(a) * 1.9, k % 25 === 0 ? 3 : 1.5, ringC, KIND.ring)
  }
  for (let k = 0; k < 1100; k++) {
    const a = (k / 1100) * Math.PI * 2
    push(Math.cos(a) * 1.55, 0.42 + Math.sin(a * 3) * 0.015, TARGET[2] + Math.sin(a) * 1.55, 1.2, ringC, KIND.ring)
  }

  for (let k = 0; k < ART_SLOTS; k++) push(0, 0, 0, 0, [0, 0, 0], KIND.paint)

  const count = base.length / 4
  return { count, base: new Float32Array(base), color: new Float32Array(color), seed: new Float32Array(seed) }
}

/**
 * Where a pixel of the photo lives in the reconstruction. Paint on the sky
 * and it hangs behind the far range; paint on a mountain and it lies on that
 * mountain's near slope; paint on the lake and it floats on the water.
 */
export function photoToWorld(px: number, py: number): [number, number, number] {
  if (py >= HORIZON) {
    const u = (py - HORIZON) / (H - HORIZON)
    return [worldX(px, RIDGE_WIDTH[0] - 0.45 * u), 0.006, -2.2 + u * 2.9]
  }
  // Nearest range first: it hides the ones behind it, as in the photo.
  for (let i = RIDGES.length - 1; i >= 0; i--) {
    const h = ridgeHeight(i, px)
    if (py < HORIZON - h) continue
    const y = (HORIZON - py) * RIDGE_SCALE[i]
    // The heightfield falls off as a Gaussian from the ridgeline; solve it
    // for the depth at which the near slope is exactly this high.
    const dz = RIDGE_DEPTH[i] * 0.55 * Math.sqrt(Math.log(Math.max(1.0001, (h * RIDGE_SCALE[i]) / Math.max(y, 1e-4))))
    return [worldX(px, RIDGE_WIDTH[i]), y, RIDGE_Z[i] + Math.min(dz, RIDGE_DEPTH[i]) + 0.015]
  }
  // Sky. Compressed by half above the far ridgeline so the top of the photo
  // stays inside the camera's view, and continuous with the ridge below it.
  const top = ridgeHeight(0, px)
  return [worldX(px, RIDGE_WIDTH[0]), (top + (HORIZON - top - py) * 0.5) * RIDGE_SCALE[0], -2.5]
}

/**
 * Turn the painted layer (any size; transparent where unpainted) into points
 * in the reserved slots. Returns how many were used. Pass null to clear.
 */
export function writeArt(scene: Scene, img: { width: number; height: number; data: ArrayLike<number> } | null): number {
  const first = scene.count - ART_SLOTS
  scene.base.fill(0, first * 4)
  if (!img) return 0
  const painted: number[] = []
  for (let i = 0; i < img.width * img.height; i++) if (img.data[i * 4 + 3] > 60) painted.push(i)
  // More paint than slots: keep an even sample of it.
  const stride = Math.max(1, Math.ceil(painted.length / ART_SLOTS))
  let used = 0
  for (let k = 0; k < painted.length && used < ART_SLOTS; k += stride) {
    const i = painted[k]
    const px = (((i % img.width) + 0.5) / img.width) * W
    const py = ((Math.floor(i / img.width) + 0.5) / img.height) * H
    const o = (first + used) * 4
    scene.base.set([...photoToWorld(px, py), 2.4], o)
    scene.color.set([img.data[i * 4] / 255, img.data[i * 4 + 1] / 255, img.data[i * 4 + 2] / 255, KIND.paint], o)
    used++
  }
  return used
}
