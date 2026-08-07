import type { JSX } from 'preact'
import { useRef } from 'preact/hooks'
import { useCanvas } from '@/ui/useCanvas'
import type { Condition } from '@/state/weather'
import { clamp, makeRng } from '@/lib/util'

interface Particle {
  x: number
  y: number
  vy: number
  len: number
  phase: number
}

interface Props {
  condition: Condition
  /** 0–1 precipitation strength. */
  intensity: number
  windKph: number
  cloudCover: number
  /** Particle budget scales with panel size; keep widgets cheap. */
  density?: number
  class?: string
}

/**
 * A live sky for the current simulated conditions.
 *
 * Everything is drawn procedurally in the desktop's cyan palette rather than
 * naturalistic sky colours — this is a projection of the weather, not a photo
 * of it. Particles persist across frames in a ref so the field keeps falling
 * as conditions cross-fade.
 */
export function WeatherCanvas({
  condition,
  intensity,
  windKph,
  cloudCover,
  density = 1,
  class: cls = '',
}: Props): JSX.Element {
  const particles = useRef<Particle[]>([])
  const flash = useRef({ at: -10, strength: 0 })
  const rng = useRef(makeRng(4242))

  const ref = useCanvas(({ ctx, w, h, t, dt, p: pal }) => {
    const wind = windKph / 40
    const isSnow = condition === 'snow'
    const isWet = condition === 'rain' || condition === 'storm' || isSnow

    // --- sky ---
    const sky = ctx.createLinearGradient(0, 0, 0, h)
    const dark = condition === 'storm' ? 0.75 : cloudCover / 220
    sky.addColorStop(0, `hsl(198 70% ${Math.max(4, 16 - dark * 12)}% )`)
    sky.addColorStop(1, `hsl(190 65% ${Math.max(3, 9 - dark * 6)}%)`)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    // --- sun / glow disc, veiled by cloud cover ---
    if (condition === 'clear' || condition === 'partly') {
      const cxp = w * 0.74
      const cyp = h * 0.28
      const veil = 1 - cloudCover / 130
      const glow = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, Math.min(w, h) * 0.6)
      glow.addColorStop(0, `hsl(186 100% 78% / ${0.5 * veil})`)
      glow.addColorStop(0.35, `hsl(190 100% 65% / ${0.16 * veil})`)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      ctx.beginPath()
      ctx.arc(cxp, cyp, Math.min(w, h) * 0.075, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(188 100% 86% / ${0.85 * veil})`
      ctx.fill()
    }

    // --- clouds: overlapping soft discs drifting on the wind ---
    const cloudCount = Math.round(clamp(cloudCover / 14, 0, 8))
    for (let i = 0; i < cloudCount; i++) {
      const seed = i * 37.7
      const speed = 0.008 + (i % 3) * 0.004
      const cxp = ((t * speed * (1 + wind) + i * 0.21) % 1.4 - 0.2) * w
      const cyp = h * (0.16 + ((i * 0.17) % 0.5))
      const r = Math.min(w, h) * (0.14 + ((seed % 7) / 7) * 0.16)
      const alpha = 0.05 + (cloudCover / 100) * 0.14

      for (let b = 0; b < 3; b++) {
        const bx = cxp + (b - 1) * r * 0.65
        const by = cyp + Math.sin(seed + b) * r * 0.16
        const br = r * (b === 1 ? 1 : 0.74)
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, br)
        g.addColorStop(0, `hsl(195 60% ${condition === 'storm' ? 26 : 52}% / ${alpha})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(bx, by, br, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // --- fog: soft horizontal bands ---
    if (condition === 'fog') {
      for (let i = 0; i < 5; i++) {
        const y = h * (0.35 + i * 0.13) + Math.sin(t * 0.3 + i) * 4
        const g = ctx.createLinearGradient(0, y - 14, 0, y + 14)
        g.addColorStop(0, 'transparent')
        g.addColorStop(0.5, `hsl(192 40% 62% / ${0.1 + (i % 2) * 0.05})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.fillRect(0, y - 14, w, 28)
      }
    }

    // --- precipitation ---
    const target = isWet ? Math.round(intensity * 150 * density) : 0
    const pool = particles.current

    while (pool.length < target) {
      pool.push({
        x: rng.current() * w,
        y: rng.current() * h,
        vy: (isSnow ? 26 : 210) * (0.6 + rng.current() * 0.8),
        len: isSnow ? 1.2 + rng.current() * 1.6 : 6 + rng.current() * 12,
        phase: rng.current() * Math.PI * 2,
      })
    }
    if (pool.length > target) pool.length = target

    if (pool.length) {
      ctx.lineCap = 'round'
      for (const p of pool) {
        p.y += p.vy * dt
        p.x += (isSnow ? Math.sin(t * 1.4 + p.phase) * 12 : 0) * dt + wind * (isSnow ? 26 : 70) * dt

        if (p.y > h) {
          p.y = -p.len
          p.x = rng.current() * w
        }
        if (p.x > w) p.x -= w
        if (p.x < 0) p.x += w

        if (isSnow) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.len, 0, Math.PI * 2)
          ctx.fillStyle = `hsl(190 90% 88% / ${0.35 + (p.len / 3) * 0.4})`
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - wind * 9, p.y + p.len)
          ctx.strokeStyle = `hsl(188 95% 76% / ${0.18 + (p.vy / 340) * 0.35})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    // --- lightning ---
    if (condition === 'storm') {
      if (t - flash.current.at > 2.2 && rng.current() < 0.014) {
        flash.current = { at: t, strength: 0.5 + rng.current() * 0.5 }
      }
      const age = t - flash.current.at
      if (age < 0.42) {
        // Two quick strobes, then decay.
        const env = age < 0.06 ? 1 : age < 0.12 ? 0.3 : Math.max(0, 1 - (age - 0.12) / 0.3) * 0.55
        const a = env * flash.current.strength

        ctx.fillStyle = `hsl(190 100% 88% / ${a * 0.32})`
        ctx.fillRect(0, 0, w, h)

        // Bolt path — same seed for the whole flash so it doesn't twitch.
        const boltRng = makeRng(Math.floor(flash.current.at * 1000))
        ctx.beginPath()
        let bx = w * (0.2 + boltRng() * 0.6)
        let by = 0
        ctx.moveTo(bx, by)
        while (by < h * 0.72) {
          bx += (boltRng() - 0.5) * w * 0.16
          by += h * (0.08 + boltRng() * 0.1)
          ctx.lineTo(bx, by)
        }
        ctx.strokeStyle = `hsl(188 100% 92% / ${a})`
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.strokeStyle = `hsl(190 100% 80% / ${a * 0.35})`
        ctx.lineWidth = 6
        ctx.stroke()
      }
    }

    // --- horizon line, ties it back to the desktop's grid ---
    ctx.beginPath()
    ctx.moveTo(0, h - 0.5)
    ctx.lineTo(w, h - 0.5)
    ctx.strokeStyle = pal.primary(0.3)
    ctx.lineWidth = 1
    ctx.stroke()
  })

  return <canvas ref={ref} class={`h-full w-full ${cls}`} />
}
