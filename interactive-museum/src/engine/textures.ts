import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import type { Scene } from '@babylonjs/core/scene'
import type { ExhibitDef } from '@/data/museum'

/**
 * Everything visible in this museum is painted at runtime onto a canvas — the
 * plaques, the artworks, the labels, the dust sprite, the stone veining. The
 * build ships no image files at all.
 */

/** Small deterministic PRNG so every visit paints the same museum. */
function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function ctxOf(tex: DynamicTexture) {
  // Babylon hands back an ICanvasRenderingContext; for 2D canvas work the DOM
  // type is the accurate one and every call below is part of both surfaces.
  return tex.getContext() as unknown as CanvasRenderingContext2D
}

function finish(tex: DynamicTexture) {
  // update() must keep its default invertY of true — that is the canvas
  // convention (y increasing downwards). Passing false uploads every canvas
  // upside-down, which on a plaque or a label reads as mirrored text.
  tex.update()
  tex.hasAlpha = false
  return tex
}

/** Wrap text to a pixel width, returning the lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

/* ------------------------------------------------------------------ *
 * Architecture
 * ------------------------------------------------------------------ */

/** Veined stone for floors — subtle, seamless enough at museum scale. */
export function makeStoneTexture(scene: Scene, base: string, vein: string, seed = 7): Texture {
  const size = 512
  const tex = new DynamicTexture('stone', { width: size, height: size }, scene, true)
  const ctx = ctxOf(tex)
  const rng = makeRng(seed)

  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // Mottling, so large floors don't read as flat colour under a spotlight.
  for (let i = 0; i < 2600; i++) {
    const x = rng() * size
    const y = rng() * size
    const r = 6 + rng() * 34
    ctx.globalAlpha = 0.012 + rng() * 0.035
    ctx.fillStyle = rng() > 0.5 ? vein : '#000000'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Veins: a few drifting polylines with tapering width.
  ctx.globalAlpha = 1
  ctx.strokeStyle = vein
  ctx.lineCap = 'round'
  for (let v = 0; v < 9; v++) {
    let x = rng() * size
    let y = -20
    const drift = (rng() - 0.5) * 2.4
    ctx.globalAlpha = 0.05 + rng() * 0.1
    ctx.lineWidth = 0.6 + rng() * 2.4
    ctx.beginPath()
    ctx.moveTo(x, y)
    while (y < size + 20) {
      x += drift + (rng() - 0.5) * 9
      y += 10 + rng() * 14
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  ctx.globalAlpha = 1
  finish(tex)
  tex.wrapU = Texture.WRAP_ADDRESSMODE
  tex.wrapV = Texture.WRAP_ADDRESSMODE
  return tex
}

/** Flat plaster with a faint grain, for walls. */
export function makePlasterTexture(scene: Scene, base: string, seed = 3): Texture {
  const size = 256
  const tex = new DynamicTexture('plaster', { width: size, height: size }, scene, true)
  const ctx = ctxOf(tex)
  const rng = makeRng(seed)

  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 9000; i++) {
    ctx.globalAlpha = rng() * 0.05
    ctx.fillStyle = rng() > 0.5 ? '#ffffff' : '#000000'
    ctx.fillRect(rng() * size, rng() * size, 1.5, 1.5)
  }

  ctx.globalAlpha = 1
  finish(tex)
  tex.wrapU = Texture.WRAP_ADDRESSMODE
  tex.wrapV = Texture.WRAP_ADDRESSMODE
  return tex
}

/* ------------------------------------------------------------------ *
 * Signage
 * ------------------------------------------------------------------ */

/** The engraved wall plaque each room introduces itself with. */
export function makePlaqueTexture(
  scene: Scene,
  opts: { room: string; title: string; body: string; accent: string },
): Texture {
  const w = 1024
  const h = 512
  const tex = new DynamicTexture('plaque', { width: w, height: h }, scene, true)
  const ctx = ctxOf(tex)

  ctx.fillStyle = '#15120e'
  ctx.fillRect(0, 0, w, h)

  // Brushed-metal sheen across the plate.
  const sheen = ctx.createLinearGradient(0, 0, w, h)
  sheen.addColorStop(0, 'rgba(255,255,255,0.10)')
  sheen.addColorStop(0.45, 'rgba(255,255,255,0.02)')
  sheen.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 3
  ctx.strokeRect(24, 24, w - 48, h - 48)

  ctx.fillStyle = opts.accent
  ctx.font = '500 30px "JetBrains Mono", monospace'
  ctx.fillText(opts.room.toUpperCase(), 64, 108)

  ctx.fillStyle = '#f3ead9'
  ctx.font = '600 68px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(opts.title, 62, 190)

  ctx.strokeStyle = opts.accent
  ctx.globalAlpha = 0.5
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(64, 218)
  ctx.lineTo(w - 64, 218)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.fillStyle = 'rgba(228,220,205,0.82)'
  ctx.font = '300 27px "Inter", system-ui, sans-serif'
  const lines = wrap(ctx, opts.body, w - 140)
  lines.slice(0, 7).forEach((line, i) => ctx.fillText(line, 64, 268 + i * 37))

  return finish(tex)
}

/** A short label — years on the monoliths, names under the orbs. */
export function makeLabelTexture(
  scene: Scene,
  opts: { text: string; sub?: string; color: string; size?: number; bg?: string },
): Texture {
  const w = 512
  const h = opts.sub ? 256 : 160
  const tex = new DynamicTexture('label', { width: w, height: h }, scene, true)
  const ctx = ctxOf(tex)

  ctx.clearRect(0, 0, w, h)
  if (opts.bg) {
    ctx.fillStyle = opts.bg
    ctx.fillRect(0, 0, w, h)
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = opts.color
  ctx.font = `500 ${opts.size ?? 92}px "Cormorant Garamond", Georgia, serif`
  ctx.fillText(opts.text, w / 2, opts.sub ? 108 : h / 2 + 30)

  if (opts.sub) {
    ctx.fillStyle = 'rgba(240,236,228,0.72)'
    ctx.font = '400 34px "Inter", system-ui, sans-serif'
    wrap(ctx, opts.sub, w - 60)
      .slice(0, 3)
      .forEach((line, i) => ctx.fillText(line, w / 2, 168 + i * 42))
  }

  tex.update()
  tex.hasAlpha = !opts.bg
  return tex
}

/** Soft round sprite used for dust motes and light bloom points. */
export function makeDotTexture(scene: Scene): Texture {
  const size = 128
  const tex = new DynamicTexture('dot', { width: size, height: size }, scene, true)
  const ctx = ctxOf(tex)

  ctx.clearRect(0, 0, size, size)
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  tex.update()
  tex.hasAlpha = true
  return tex
}

/* ------------------------------------------------------------------ *
 * The collection — each exhibit's canvas is generated from its `pattern`
 * ------------------------------------------------------------------ */

export function makeExhibitTexture(scene: Scene, exhibit: ExhibitDef): Texture {
  const w = 640
  const h = 820
  const tex = new DynamicTexture(`art-${exhibit.id}`, { width: w, height: h }, scene, true)
  const ctx = ctxOf(tex)
  const [dark, mid, light] = exhibit.colors
  const rng = makeRng(exhibit.id.length * 977 + exhibit.year.length * 31 + 5)

  ctx.fillStyle = dark
  ctx.fillRect(0, 0, w, h)

  switch (exhibit.pattern) {
    case 'refraction': {
      // Overlapping glass panes, each bending a shared light source.
      for (let i = 0; i < 41; i++) {
        const cx = rng() * w
        const cy = rng() * h
        const r = 60 + rng() * 200
        const rot = rng() * Math.PI
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rot)
        const g = ctx.createLinearGradient(-r, 0, r, 0)
        g.addColorStop(0, 'rgba(0,0,0,0)')
        g.addColorStop(0.5, mid)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.globalAlpha = 0.14 + rng() * 0.2
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(-r, -r * 0.35)
        ctx.lineTo(r, -r * 0.1)
        ctx.lineTo(r * 0.6, r * 0.4)
        ctx.lineTo(-r * 0.8, r * 0.2)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      // The source itself.
      ctx.globalAlpha = 1
      const beam = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, h * 0.5)
      beam.addColorStop(0, light)
      beam.addColorStop(0.12, 'rgba(255,255,255,0.35)')
      beam.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = beam
      ctx.fillRect(0, 0, w, h)
      break
    }

    case 'cascade': {
      // Forty thousand pins, drawn as the streaks they leave falling.
      for (let i = 0; i < 1400; i++) {
        const x = rng() * w
        const y = rng() * h
        const len = 8 + rng() * rng() * 190
        ctx.globalAlpha = 0.06 + rng() * 0.45
        ctx.strokeStyle = rng() > 0.82 ? light : mid
        ctx.lineWidth = 0.5 + rng() * 1.9
        ctx.beginPath()
        ctx.moveTo(x, y)
        // Slight arc — they are on nylon, not in free fall.
        ctx.quadraticCurveTo(x + (rng() - 0.5) * 24, y + len * 0.6, x + (rng() - 0.5) * 10, y + len)
        ctx.stroke()
      }
      ctx.globalAlpha = 0.5
      const floor = ctx.createLinearGradient(0, h * 0.72, 0, h)
      floor.addColorStop(0, 'rgba(0,0,0,0)')
      floor.addColorStop(1, light)
      ctx.fillStyle = floor
      ctx.fillRect(0, h * 0.72, w, h * 0.28)
      break
    }

    case 'machine': {
      // Concentric movements, none of them driving anything.
      const cx = w / 2
      const cy = h / 2
      for (let ring = 0; ring < 9; ring++) {
        const r = 40 + ring * 38
        const teeth = 12 + ring * 5
        ctx.globalAlpha = 0.24 + ring * 0.06
        ctx.strokeStyle = ring % 3 === 0 ? light : mid
        ctx.lineWidth = ring % 3 === 0 ? 2.4 : 1.1
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
        for (let t = 0; t < teeth; t++) {
          const a = (t / teeth) * Math.PI * 2 + ring * 0.2
          ctx.beginPath()
          ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
          ctx.lineTo(cx + Math.cos(a) * (r + 11), cy + Math.sin(a) * (r + 11))
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 0.9
      ctx.fillStyle = light
      ctx.beginPath()
      ctx.arc(cx, cy, 13, 0, Math.PI * 2)
      ctx.fill()
      break
    }

    case 'signal': {
      // Stacked traces, decaying from signal at the top into noise at the base.
      for (let band = 0; band < 34; band++) {
        const y = 40 + band * (h - 80) / 34
        const noise = band / 34
        ctx.globalAlpha = 0.28 + (1 - noise) * 0.5
        ctx.strokeStyle = noise > 0.55 ? mid : light
        ctx.lineWidth = 1.3
        ctx.beginPath()
        for (let x = 0; x <= w; x += 4) {
          const clean = Math.sin((x / w) * Math.PI * 6 + band * 0.5) * 13 * (1 - noise)
          const dirty = (rng() - 0.5) * 44 * noise
          ctx.lineTo(x, y + clean + dirty)
        }
        ctx.stroke()
      }
      break
    }

    case 'paper': {
      // Folded facets, each shaded by the angle it was folded to.
      const cols = 7
      const rows = 9
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c / cols) * w
          const y = (r / rows) * h
          const cw = w / cols
          const ch = h / rows
          const shade = rng()
          ctx.globalAlpha = 1
          ctx.fillStyle = shade > 0.62 ? light : shade > 0.3 ? mid : dark
          ctx.beginPath()
          if ((r + c) % 2 === 0) {
            ctx.moveTo(x, y)
            ctx.lineTo(x + cw, y)
            ctx.lineTo(x, y + ch)
          } else {
            ctx.moveTo(x + cw, y)
            ctx.lineTo(x + cw, y + ch)
            ctx.lineTo(x, y + ch)
          }
          ctx.closePath()
          ctx.fill()
          ctx.globalAlpha = 0.16
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
      break
    }

    case 'clock': {
      // A face reading a time that is correct once every ten thousand years.
      const cx = w / 2
      const cy = h / 2
      const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, h * 0.55)
      bg.addColorStop(0, mid)
      bg.addColorStop(1, dark)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 240; i++) {
        const a = (i / 240) * Math.PI * 2
        const major = i % 20 === 0
        const r0 = major ? 210 : 244
        ctx.globalAlpha = major ? 0.95 : 0.3
        ctx.strokeStyle = light
        ctx.lineWidth = major ? 3 : 1
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
        ctx.lineTo(cx + Math.cos(a) * 260, cy + Math.sin(a) * 260)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.strokeStyle = light
      ctx.lineCap = 'round'
      ctx.lineWidth = 7
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(-1.9) * 150, cy + Math.sin(-1.9) * 150)
      ctx.stroke()
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(0.7) * 225, cy + Math.sin(0.7) * 225)
      ctx.stroke()
      break
    }

    case 'lost': {
      // Unlisted, unsigned, and damaged by whatever it sat behind.
      for (let i = 0; i < 900; i++) {
        ctx.globalAlpha = 0.02 + rng() * 0.1
        ctx.fillStyle = rng() > 0.5 ? mid : '#000'
        const bx = rng() * w
        const by = rng() * h
        ctx.fillRect(bx, by, 2 + rng() * 40, 1 + rng() * 5)
      }
      // A figure, barely.
      ctx.globalAlpha = 0.5
      const f = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.42, 240)
      f.addColorStop(0, light)
      f.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = f
      ctx.beginPath()
      ctx.ellipse(w * 0.5, h * 0.45, 130, 220, 0, 0, Math.PI * 2)
      ctx.fill()
      // Scratches.
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = '#000'
      for (let i = 0; i < 30; i++) {
        ctx.lineWidth = 0.6 + rng() * 2
        ctx.beginPath()
        ctx.moveTo(rng() * w, rng() * h)
        ctx.lineTo(rng() * w, rng() * h)
        ctx.stroke()
      }
      break
    }
  }

  // Every canvas gets the same vignette and canvas tooth.
  ctx.globalAlpha = 1
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.72)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 5000; i++) {
    ctx.globalAlpha = rng() * 0.05
    ctx.fillStyle = rng() > 0.5 ? '#fff' : '#000'
    ctx.fillRect(rng() * w, rng() * h, 1, 1)
  }

  return finish(tex)
}
