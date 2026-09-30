/**
 * "lake.jpg" — the one photo this computer has owned for sixty years.
 *
 * It is not a file. It is a function of a seed, rendered three ways:
 *
 *  - as an SVG string, so it exists in the static HTML with no JS
 *    (Web 2.0, Material and Glass show it as an <img>),
 *  - rasterised from that SVG, for eras that need pixels
 *    (DOS turns it into half-block ANSI art, Paint dithers it to 16 colours),
 *  - rebuilt in 3D from the same ridge functions, for the 2040 hologram.
 */

export const W = 320
export const H = 200
export const HORIZON = 122

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth 1-D value noise with a fixed lattice per seed. */
function valueNoise(seed: number): (x: number) => number {
  const r = rng(seed)
  const lattice = Array.from({ length: 64 }, () => r())
  return (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    const a = lattice[((i % 64) + 64) % 64]
    const b = lattice[(((i + 1) % 64) + 64) % 64]
    const s = f * f * (3 - 2 * f)
    return a + (b - a) * s
  }
}

function fbm(seed: number, octaves: number): (x: number) => number {
  const layers = Array.from({ length: octaves }, (_, o) => valueNoise(seed * 31 + o * 7))
  return (x: number) => {
    let sum = 0
    let amp = 1
    let norm = 0
    let freq = 1
    for (const n of layers) {
      sum += n(x * freq) * amp
      norm += amp
      amp *= 0.5
      freq *= 2.03
    }
    return sum / norm
  }
}

export const SUN = { x: 214, y: 101, r: 17 }

export interface Ridge {
  /** Peak height above the horizon, in SVG units. */
  amp: number
  /** Lattice cells across the width — lower is broader mountains. */
  scale: number
  color: string
  /** Depth in the 3D rebuild: 0 is the shoreline, 1 the far range. */
  depth: number
  noise: (x: number) => number
}

export const RIDGES: readonly Ridge[] = [
  { amp: 50, scale: 5.5, color: '#9a5f9f', depth: 1, noise: fbm(11, 4) },
  { amp: 36, scale: 7, color: '#5e3b7c', depth: 0.62, noise: fbm(23, 4) },
  { amp: 20, scale: 9, color: '#2d1f48', depth: 0.3, noise: fbm(37, 3) },
]

/** Height (0 … amp) of ridge `i` at column x ∈ [0, W]. */
export function ridgeHeight(i: number, x: number): number {
  const r = RIDGES[i]
  let h = 0.18 + 0.82 * r.noise((x / W) * r.scale)
  // The far range opens a valley for the sun to set into.
  if (i === 0) h *= 1 - 0.62 * Math.exp(-(((x - SUN.x) / 42) ** 2))
  // The near range rises into the left shore where the pines stand.
  if (i === 2) h *= 0.55 + 0.9 * Math.exp(-(((x - 30) / 70) ** 2))
  return h * r.amp
}

export const TREES: readonly { x: number; h: number }[] = [
  { x: 10, h: 30 },
  { x: 21, h: 40 },
  { x: 33, h: 34 },
  { x: 44, h: 26 },
  { x: 55, h: 19 },
  { x: 292, h: 16 },
  { x: 303, h: 22 },
]

export const STARS: readonly { x: number; y: number; r: number; o: number }[] = (() => {
  const r = rng(99)
  return Array.from({ length: 22 }, () => ({
    x: +(r() * W).toFixed(1),
    y: +(r() * 52).toFixed(1),
    r: +(0.4 + r() * 0.7).toFixed(2),
    o: +(0.35 + r() * 0.5).toFixed(2),
  }))
})()

const f1 = (n: number) => +n.toFixed(1)

function ridgePath(i: number): string {
  let d = `M0 ${HORIZON + 1}`
  for (let x = 0; x <= W; x += 4) d += ` L${x} ${f1(HORIZON - ridgeHeight(i, x))}`
  return `${d} L${W} ${HORIZON + 1} Z`
}

function treePath(x: number, h: number, base: number): string {
  // A pine as three stacked triangles.
  const w = h * 0.36
  let d = ''
  for (let k = 0; k < 3; k++) {
    const top = base - h + k * h * 0.26
    const bot = base - h * 0.28 + k * h * 0.26 - h * 0.12
    const ww = w * (0.55 + k * 0.28)
    d += `M${f1(x)} ${f1(top)} L${f1(x + ww)} ${f1(bot)} L${f1(x - ww)} ${f1(bot)} Z `
  }
  d += `M${f1(x - 0.8)} ${f1(base - h * 0.2)} h1.6 V${base} h-1.6 Z`
  return d
}

function buildSvg(): string {
  const r = rng(7)
  const ridges = RIDGES.map((rd, i) => `<path d="${ridgePath(i)}" fill="${rd.color}"/>`).join('')
  const trees = TREES.map((t) => {
    const base = HORIZON + 2 - (t.x < 80 ? ridgeHeight(2, t.x) * 0.35 : 0)
    return `<path d="${treePath(t.x, t.h, base)}" fill="#130d22"/>`
  }).join('')

  const glitter: string[] = []
  for (let y = HORIZON + 3, k = 0; y < 186; y += 3.2, k++) {
    const w = (26 - k * 0.9) * (0.6 + r() * 0.6)
    if (w < 2) break
    glitter.push(
      `<rect x="${f1(SUN.x - w / 2 + (r() - 0.5) * 4)}" y="${f1(y)}" width="${f1(w)}" height="1.1" fill="#ffe2a6" opacity="${(0.85 - k * 0.035).toFixed(2)}"/>`,
    )
  }
  const ripples: string[] = []
  for (let k = 0; k < 16; k++) {
    const y = HORIZON + 6 + k * 4.6 + r() * 2
    const x = r() * W
    const w = 18 + r() * 70
    ripples.push(`<rect x="${f1(x - w / 2)}" y="${f1(y)}" width="${f1(w)}" height=".7" fill="#ffd6e8" opacity="${(0.08 + r() * 0.14).toFixed(2)}"/>`)
  }
  const stars = STARS.map((s) => `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="#fff" opacity="${s.o}"/>`).join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="${HORIZON}" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="#141a44"/><stop offset=".42" stop-color="#4b2f7f"/><stop offset=".7" stop-color="#d9608a"/><stop offset=".88" stop-color="#ff9e6b"/><stop offset="1" stop-color="#ffd08a"/>` +
    `</linearGradient>` +
    `<linearGradient id="water" x1="0" y1="${HORIZON}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="#f29a78"/><stop offset=".3" stop-color="#8d4a86"/><stop offset="1" stop-color="#1a1334"/>` +
    `</linearGradient>` +
    `<radialGradient id="glow" cx="${SUN.x}" cy="${SUN.y}" r="90" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="#ffe3ad" stop-opacity=".75"/><stop offset=".35" stop-color="#ffb38a" stop-opacity=".28"/><stop offset="1" stop-color="#ff8a8a" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<clipPath id="lake"><rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}"/></clipPath>` +
    `</defs>` +
    `<rect width="${W}" height="${HORIZON + 1}" fill="url(#sky)"/>` +
    stars +
    `<circle cx="${SUN.x}" cy="${SUN.y}" r="90" fill="url(#glow)"/>` +
    `<circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r}" fill="#ffe9b8"/>` +
    ridges +
    trees +
    `<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#water)"/>` +
    // The reflection: sun and ridges mirrored about the horizon, faded.
    `<g clip-path="url(#lake)" opacity=".38"><g transform="matrix(1 0 0 -1 0 ${HORIZON * 2})">` +
    `<circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r * 1.1}" fill="#ffe9b8"/>` +
    ridges +
    trees +
    `</g></g>` +
    glitter.join('') +
    ripples.join('') +
    `</svg>`
  )
}

export const LAKE_SVG = buildSvg()
export const LAKE_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LAKE_SVG)}`

const rasters = new Map<string, Promise<ImageData | null>>()

async function decode(src: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = src
  await img.decode()
  return img
}

async function raster(w: number, h: number, layers: string[]): Promise<ImageData | null> {
  try {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.imageSmoothingQuality = 'high'
    for (const src of layers) ctx.drawImage(await decode(src), 0, 0, w, h)
    return ctx.getImageData(0, 0, w, h)
  } catch {
    return null
  }
}

/**
 * The photo as pixels, at any size. Client only. Resolves to null if the
 * browser refuses to decode or read back the SVG.
 *
 * Pass `art` (the painted layer from world.art) to get the photo as its
 * owner left it, brush strokes included.
 */
export function rasterLake(w: number, h: number, art = ''): Promise<ImageData | null> {
  // Painted versions aren't cached: the painting keeps changing.
  if (art) return raster(w, h, [LAKE_URL, art])
  const key = `${w}x${h}`
  let p = rasters.get(key)
  if (!p) {
    p = raster(w, h, [LAKE_URL])
    rasters.set(key, p)
  }
  return p
}

/** Only the painted strokes, as pixels: transparent wherever nothing was painted. */
export const rasterArt = (art: string, w: number, h: number): Promise<ImageData | null> => (art ? raster(w, h, [art]) : Promise.resolve(null))

type RGB = readonly [number, number, number]

/**
 * Map pixels onto a fixed palette with 4×4 ordered (Bayer) dithering, the way
 * 16-colour hardware actually had to. Returns palette indices.
 */
export function ditherToPalette(img: ImageData, palette: readonly RGB[], strength = 36): Uint8Array {
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
  const out = new Uint8Array(img.width * img.height)
  const d = img.data
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = y * img.width + x
      const b = (bayer[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * strength
      const r = d[i * 4] + b
      const g = d[i * 4 + 1] + b
      const bl = d[i * 4 + 2] + b
      let best = 0
      let bestD = Infinity
      for (let k = 0; k < palette.length; k++) {
        const p = palette[k]
        // Weighted RGB distance — cheap, and close enough to perceptual.
        const dr = r - p[0]
        const dg = g - p[1]
        const db = bl - p[2]
        const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db
        if (dist < bestD) {
          bestD = dist
          best = k
        }
      }
      out[i] = best
    }
  }
  return out
}

/** The sixteen colours of CGA / EGA text mode, and of Windows 95's basic palette. */
export const PALETTE_16: readonly RGB[] = [
  [0, 0, 0],
  [0, 0, 170],
  [0, 170, 0],
  [0, 170, 170],
  [170, 0, 0],
  [170, 0, 170],
  [170, 85, 0],
  [170, 170, 170],
  [85, 85, 85],
  [85, 85, 255],
  [85, 255, 85],
  [85, 255, 255],
  [255, 85, 85],
  [255, 85, 255],
  [255, 255, 85],
  [255, 255, 255],
]

export const WIN_PALETTE_16: readonly RGB[] = [
  [0, 0, 0],
  [128, 0, 0],
  [0, 128, 0],
  [128, 128, 0],
  [0, 0, 128],
  [128, 0, 128],
  [0, 128, 128],
  [192, 192, 192],
  [128, 128, 128],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [0, 0, 255],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
]

export const rgbCss = (c: RGB): string => `rgb(${c[0]},${c[1]},${c[2]})`
