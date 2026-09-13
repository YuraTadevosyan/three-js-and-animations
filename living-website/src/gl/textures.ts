import { Texture } from 'pixi.js'
import { makeRng } from '@/lib/rng'

/**
 * Every texture on this page is drawn into an offscreen canvas at runtime.
 * Nothing is fetched — the whole site ships zero binary assets, which also
 * means the sky renders correctly on the very first frame with no pop-in.
 */

const cache = new Map<string, Texture>()

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  const ctx = el.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')
  return [el, ctx]
}

function cached(key: string, make: () => HTMLCanvasElement): Texture {
  let tex = cache.get(key)
  if (!tex) {
    tex = Texture.from(make())
    cache.set(key, tex)
  }
  return tex
}

/** A soft round falloff. The workhorse behind clouds, fog, glow and bokeh. */
export function softBlob(size = 256, falloff = 2.2): Texture {
  return cached(`blob-${size}-${falloff}`, () => {
    const [el, ctx] = canvas(size, size)
    const r = size / 2
    const img = ctx.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const d = Math.hypot(x - r, y - r) / r
        const a = Math.pow(Math.max(0, 1 - d), falloff)
        const i = (y * size + x) * 4
        img.data[i] = 255
        img.data[i + 1] = 255
        img.data[i + 2] = 255
        img.data[i + 3] = Math.round(a * 255)
      }
    }
    ctx.putImageData(img, 0, 0)
    return el
  })
}

/** A lumpy cloud mask built from a handful of overlapping blobs. */
export function cloudPuff(variant: number): Texture {
  return cached(`cloud-${variant}`, () => {
    const w = 512
    const h = 256
    const [el, ctx] = canvas(w, h)
    const rng = makeRng(0x9e37 + variant * 7919)

    const lobes = rng.int(6, 10)
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < lobes; i++) {
      const cx = w * rng.range(0.16, 0.84)
      // Lobes cluster along the lower half so the top edge stays billowed
      // and the base stays flat, the way real cumulus reads.
      const cy = h * rng.range(0.42, 0.72)
      const rx = w * rng.range(0.1, 0.24)
      const ry = rx * rng.range(0.55, 0.85)

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx)
      g.addColorStop(0, 'rgba(255,255,255,0.42)')
      g.addColorStop(0.55, 'rgba(255,255,255,0.2)')
      g.addColorStop(1, 'rgba(255,255,255,0)')

      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(1, ry / rx)
      ctx.translate(-cx, -cy)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, rx, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // Fade the outer border so tiling sprites never show a hard rectangle.
    ctx.globalCompositeOperation = 'destination-in'
    const fade = ctx.createRadialGradient(w / 2, h / 2, h * 0.18, w / 2, h / 2, w * 0.52)
    fade.addColorStop(0, 'rgba(0,0,0,1)')
    fade.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = fade
    ctx.fillRect(0, 0, w, h)

    return el
  })
}

/** A vertical rain streak, soft at both ends. */
export function rainStreak(): Texture {
  return cached('rain', () => {
    const [el, ctx] = canvas(8, 96)
    const g = ctx.createLinearGradient(0, 0, 0, 96)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.85)')
    g.addColorStop(0.85, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(2.5, 0, 3, 96)
    return el
  })
}

/** A six-armed flake with a soft core — legible at 6px, not a fuzzy dot. */
export function snowFlake(): Texture {
  return cached('snow', () => {
    const size = 48
    const [el, ctx] = canvas(size, size)
    const c = size / 2

    const glow = ctx.createRadialGradient(c, c, 0, c, c, c)
    glow.addColorStop(0, 'rgba(255,255,255,0.95)')
    glow.addColorStop(0.4, 'rgba(255,255,255,0.5)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, size, size)

    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(c, c)
      ctx.lineTo(c + Math.cos(a) * c * 0.72, c + Math.sin(a) * c * 0.72)
      ctx.stroke()
    }
    return el
  })
}

/** A four-point star flare for the sun and for fireflies. */
export function starFlare(): Texture {
  return cached('flare', () => {
    const size = 192
    const [el, ctx] = canvas(size, size)
    const c = size / 2

    const core = ctx.createRadialGradient(c, c, 0, c, c, c)
    core.addColorStop(0, 'rgba(255,255,255,1)')
    core.addColorStop(0.12, 'rgba(255,255,255,0.7)')
    core.addColorStop(0.4, 'rgba(255,255,255,0.16)')
    core.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = core
    ctx.fillRect(0, 0, size, size)

    ctx.globalCompositeOperation = 'lighter'
    for (const angle of [0, Math.PI / 2]) {
      ctx.save()
      ctx.translate(c, c)
      ctx.rotate(angle)
      const spike = ctx.createLinearGradient(-c, 0, c, 0)
      spike.addColorStop(0, 'rgba(255,255,255,0)')
      spike.addColorStop(0.5, 'rgba(255,255,255,0.55)')
      spike.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = spike
      ctx.fillRect(-c, -1.6, size, 3.2)
      ctx.restore()
    }
    return el
  })
}

export function disposeTextures() {
  for (const tex of cache.values()) tex.destroy(true)
  cache.clear()
}
