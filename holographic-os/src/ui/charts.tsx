import type { JSX } from 'preact'
import { useCanvas, type Palette } from '@/ui/useCanvas'
import type { RingBuffer } from '@/lib/util'
import { clamp } from '@/lib/util'

export type Tone = 'primary' | 'accent' | 'warn' | 'danger'

/** DOM elements can use `var()` directly; canvas cannot. */
const TONE_VAR: Record<Tone, string> = {
  primary: '--primary',
  accent: '--accent',
  warn: '--warn',
  danger: '--danger',
}

function toneCss(tone: Tone, alpha: number): string {
  return `hsl(var(${TONE_VAR[tone]}) / ${alpha})`
}

function toneFn(p: Palette, tone: Tone): (a?: number) => string {
  return p[tone]
}

// ---------------------------------------------------------------------------
// Sparkline — a filled scrolling trace read straight from a ring buffer.
// ---------------------------------------------------------------------------

interface SparklineProps {
  buffer: RingBuffer
  /** Fixed y-max. Omit to auto-scale to the visible window. */
  max?: number
  tone?: Tone
  /** Draws the dotted 25/50/75% guides. */
  grid?: boolean
  class?: string
}

export function Sparkline({ buffer, max, tone = 'primary', grid = true, class: cls = '' }: SparklineProps): JSX.Element {
  const ref = useCanvas(({ ctx, w, h, p }) => {
    const n = buffer.length
    if (n < 2) return

    const color = toneFn(p, tone)
    const top = max ?? Math.max(buffer.max() * 1.15, 1)

    if (grid) {
      ctx.strokeStyle = p.primary(0.1)
      ctx.lineWidth = 1
      ctx.setLineDash([2, 4])
      for (const f of [0.25, 0.5, 0.75]) {
        const y = h - f * h
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }

    const px = (i: number) => (i / (n - 1)) * w
    const py = (v: number) => h - clamp(v / top, 0, 1) * (h - 2) - 1

    // Filled body.
    const fill = ctx.createLinearGradient(0, 0, 0, h)
    fill.addColorStop(0, color(0.34))
    fill.addColorStop(1, color(0))
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let i = 0; i < n; i++) ctx.lineTo(px(i), py(buffer.at(i)))
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()

    // Stroke with a bloom pass underneath.
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const x = px(i)
      const y = py(buffer.at(i))
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = color(0.32)
    ctx.lineWidth = 3.5
    ctx.stroke()
    ctx.strokeStyle = color(1)
    ctx.lineWidth = 1.25
    ctx.stroke()

    // Leading dot.
    const lastY = py(buffer.last)
    ctx.beginPath()
    ctx.arc(w - 1, lastY, 2.2, 0, Math.PI * 2)
    ctx.fillStyle = color(1)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(w - 1, lastY, 5, 0, Math.PI * 2)
    ctx.fillStyle = color(0.22)
    ctx.fill()
  })

  return <canvas ref={ref} class={`h-full w-full ${cls}`} />
}

// ---------------------------------------------------------------------------
// Gauge — radial arc with a needle-free sweep.
// ---------------------------------------------------------------------------

interface GaugeProps {
  /** 0–100. */
  value: number
  label: string
  readout: string
  tone?: Tone
  class?: string
}

export function Gauge({ value, label, readout, tone = 'primary', class: cls = '' }: GaugeProps): JSX.Element {
  const ref = useCanvas(({ ctx, w, h, t, p }) => {
    const color = toneFn(p, tone)
    const cx = w / 2
    const cy = h / 2 + 4
    const r = Math.min(w, h * 1.5) / 2 - 10
    const START = Math.PI * 0.75
    const SWEEP = Math.PI * 1.5
    const frac = clamp(value / 100, 0, 1)

    // Track.
    ctx.beginPath()
    ctx.arc(cx, cy, r, START, START + SWEEP)
    ctx.strokeStyle = p.primary(0.13)
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.stroke()

    // Tick marks every 10%.
    for (let i = 0; i <= 10; i++) {
      const a = START + (i / 10) * SWEEP
      const inner = r - 9
      const outer = r - (i % 5 === 0 ? 13 : 11)
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer)
      ctx.strokeStyle = p.primary(i / 10 <= frac ? 0.5 : 0.16)
      ctx.lineWidth = 1.2
      ctx.stroke()
    }

    // Value arc, with a soft outer bloom.
    if (frac > 0.001) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, START, START + SWEEP * frac)
      ctx.strokeStyle = color(0.28)
      ctx.lineWidth = 11
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, r, START, START + SWEEP * frac)
      ctx.strokeStyle = color(1)
      ctx.lineWidth = 4
      ctx.stroke()

      // Head pip that pulses gently.
      const a = START + SWEEP * frac
      ctx.beginPath()
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3 + Math.sin(t * 3) * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = color(1)
      ctx.fill()
    }
  })

  return (
    <div class={`relative ${cls}`}>
      <canvas ref={ref} class="h-full w-full" />
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
        <span class="font-mono text-lg leading-none text-primary text-glow tabular-nums">{readout}</span>
        <span class="label mt-1 !text-[0.55rem]">{label}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Meter — horizontal segmented bar (DOM, not canvas).
// ---------------------------------------------------------------------------

interface MeterProps {
  value: number
  max?: number
  tone?: Tone
  /** Number of discrete cells. */
  segments?: number
  class?: string
}

export function Meter({ value, max = 100, tone = 'primary', segments = 28, class: cls = '' }: MeterProps): JSX.Element {
  const frac = clamp(value / max, 0, 1)
  const lit = Math.round(frac * segments)

  return (
    <div class={`flex h-2 items-stretch gap-[2px] ${cls}`} role="meter" aria-valuenow={Math.round(value)} aria-valuemax={max}>
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          class="flex-1 rounded-[1px] transition-colors duration-150"
          style={{
            background: i < lit ? toneCss(tone, 0.9) : 'hsl(var(--primary) / 0.1)',
            boxShadow: i < lit && i >= lit - 2 ? `0 0 8px ${toneCss(tone, 0.7)}` : undefined,
          }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CoreBars — per-core CPU load as a vertical bar field.
// ---------------------------------------------------------------------------

export function CoreBars({ cores, class: cls = '' }: { cores: number[]; class?: string }): JSX.Element {
  return (
    <div class={`flex items-end gap-1 ${cls}`}>
      {cores.map((v, i) => (
        <div key={i} class="flex flex-1 flex-col items-center gap-1">
          <div class="relative flex h-14 w-full items-end overflow-hidden rounded-sm bg-primary/10">
            <div
              class="w-full rounded-sm transition-[height] duration-100 ease-out"
              style={{
                height: `${clamp(v, 2, 100)}%`,
                background: `linear-gradient(to top, hsl(var(--primary) / 0.35), ${
                  v > 78 ? 'hsl(var(--warn) / 0.95)' : 'hsl(var(--primary) / 0.95)'
                })`,
              }}
            />
          </div>
          <span class="font-mono text-[0.5rem] text-muted-foreground">{i}</span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ring — compact progress circle used in the widget rail.
// ---------------------------------------------------------------------------

interface RingProps {
  value: number
  tone?: Tone
  /** Centre text. */
  readout?: string
  sub?: string
  class?: string
}

export function Ring({ value, tone = 'primary', readout, sub, class: cls = '' }: RingProps): JSX.Element {
  const ref = useCanvas(({ ctx, w, h, p }) => {
    const color = toneFn(p, tone)
    const cx = w / 2
    const cy = h / 2
    const r = Math.min(w, h) / 2 - 6
    const frac = clamp(value / 100, 0, 1)

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = p.primary(0.12)
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac)
    ctx.strokeStyle = color(0.3)
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac)
    ctx.strokeStyle = color(1)
    ctx.lineWidth = 2.5
    ctx.stroke()
  })

  return (
    <div class={`relative ${cls}`}>
      <canvas ref={ref} class="h-full w-full" />
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {readout && <span class="font-mono text-xs leading-none text-primary tabular-nums">{readout}</span>}
        {sub && <span class="mt-0.5 font-mono text-[0.5rem] uppercase tracking-widest text-muted-foreground">{sub}</span>}
      </div>
    </div>
  )
}
