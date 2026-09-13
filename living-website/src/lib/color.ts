import { clamp, lerp, lerpAngle } from './math'

/** Hue 0-360, saturation 0-100, lightness 0-100 — matching Tailwind's HSL vars. */
export interface Hsl {
  h: number
  s: number
  l: number
}

export const hsl = (h: number, s: number, l: number): Hsl => ({ h, s, l })

export function mixHsl(a: Hsl, b: Hsl, t: number): Hsl {
  return {
    h: lerpAngle(a.h, b.h, t),
    s: lerp(a.s, b.s, t),
    l: lerp(a.l, b.l, t),
  }
}

/** The string form Tailwind's `hsl(var(--token))` expects: "220 40% 12%". */
export const toVar = (c: Hsl) =>
  `${c.h.toFixed(1)} ${clamp(c.s, 0, 100).toFixed(1)}% ${clamp(c.l, 0, 100).toFixed(1)}%`

export const toCss = (c: Hsl, alpha = 1) =>
  alpha >= 1
    ? `hsl(${c.h.toFixed(1)} ${c.s.toFixed(1)}% ${c.l.toFixed(1)}%)`
    : `hsl(${c.h.toFixed(1)} ${c.s.toFixed(1)}% ${c.l.toFixed(1)}% / ${alpha})`

/** HSL → packed 0xRRGGBB, which is what Pixi wants for tints and uniforms. */
export function toHex(c: Hsl): number {
  const [r, g, b] = toRgb(c)
  return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255)
}

/** HSL → normalised [r, g, b], the form GLSL uniforms take. */
export function toRgb(c: Hsl): [number, number, number] {
  const h = ((c.h % 360) + 360) % 360 / 360
  const s = clamp(c.s / 100, 0, 1)
  const l = clamp(c.l / 100, 0, 1)

  if (s === 0) return [l, l, l]

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const channel = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)]
}
