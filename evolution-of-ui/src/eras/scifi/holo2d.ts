/**
 * The hologram without WebGPU: the same scene, camera and arrival/collapse
 * choreography, drawn as additive squares on a 2D canvas. No physics, fewer
 * points, no reflections — but still the lake, and still in 3D.
 */

import { fitCanvas } from '@/gpu/device'
import type { HoloFrame, HoloRenderer } from '@/gpu/holo'
import { transform } from '@/lib/mat4'
import { COLLAPSE_POINT, KIND, TARGET, type Scene } from './scene'

const STYLE: Record<number, string> = {
  [KIND.solid]: '#7fe9ff',
  [KIND.ring]: '#5ff7ff',
  [KIND.star]: '#e8f4ff',
  [KIND.water]: '#4fb8ff',
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export class Holo2D implements HoloRenderer {
  private ctx: CanvasRenderingContext2D
  private starts: Float32Array
  private clip = new Float32Array(4)
  /** Indices to draw, grouped by kind so fillStyle changes rarely. */
  private order: Int32Array

  constructor(
    private canvas: HTMLCanvasElement,
    private scene: Scene,
    stride = 3,
  ) {
    this.ctx = canvas.getContext('2d')!
    this.starts = new Float32Array(scene.count * 4)
    const picked: number[] = []
    for (let i = 0; i < scene.count; i += stride) if (scene.color[i * 4 + 3] !== KIND.reflection) picked.push(i)
    picked.sort((a, b) => scene.color[a * 4 + 3] - scene.color[b * 4 + 3])
    this.order = Int32Array.from(picked)
  }

  get count(): number {
    return this.order.length
  }

  setStarts(starts: Float32Array): void {
    this.starts = starts
  }

  frame(f: HoloFrame): void {
    fitCanvas(this.canvas, 1.5)
    const { ctx, canvas, scene, starts, clip } = this
    const W = canvas.width
    const H = canvas.height
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, W, H)
    if (f.arrival <= 0) return
    ctx.globalCompositeOperation = 'lighter'
    let style = -1
    const rot = f.time * 0.12
    const cr = Math.cos(rot)
    const sr = Math.sin(rot)
    for (const i of this.order) {
      const kind = scene.color[i * 4 + 3]
      if (kind !== style) {
        ctx.fillStyle = STYLE[kind] ?? '#7fe9ff'
        style = kind
      }
      let x = scene.base[i * 4]
      const y0 = scene.base[i * 4 + 1]
      let z = scene.base[i * 4 + 2]
      let y = y0
      if (kind === KIND.ring) {
        const dz = z - TARGET[2]
        const nx = cr * x + sr * dz
        z = -sr * x + cr * dz + TARGET[2]
        x = nx
      }
      const seed = starts[i * 4 + 3]
      const col = smooth(seed * 0.45, seed * 0.45 + 0.55, f.collapse)
      x += (COLLAPSE_POINT[0] - x) * col
      y += (COLLAPSE_POINT[1] - y) * col
      z += (COLLAPSE_POINT[2] - z) * col
      transform(f.viewProj, x, y, z, clip)
      const w = Math.max(clip[3], 0.05)
      const m = smooth(starts[i * 4 + 2], starts[i * 4 + 2] + 0.55, f.arrival)
      const nx = starts[i * 4] + (clip[0] / w - starts[i * 4]) * m
      const ny = starts[i * 4 + 1] + (clip[1] / w - starts[i * 4 + 1]) * m
      const sx = (nx * 0.5 + 0.5) * W
      const sy = (0.5 - ny * 0.5) * H
      if (sx < -4 || sy < -4 || sx > W + 4 || sy > H + 4) continue
      const size = Math.max(1, scene.base[i * 4 + 3] * f.dpr * Math.min(2.4, Math.max(0.6, 2.6 / w)) * (1 + col))
      let alpha = kind === KIND.water ? 0.35 : kind === KIND.star ? 0.5 : 0.7
      alpha *= (0.6 + 0.4 * m) * Math.min(1, f.arrival / 0.06) * (1 + col)
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.fillRect(sx - size / 2, sy - size / 2, size, size)
    }
    ctx.globalAlpha = 1
  }

  destroy(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
