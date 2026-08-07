import { useEffect, useRef } from 'preact/hooks'
import type { RefObject } from 'preact'
import { projection } from '@/state/os'

/** Colour accessors resolved from CSS custom properties into literal `hsl()`. */
export interface Palette {
  primary: (a?: number) => string
  accent: (a?: number) => string
  warn: (a?: number) => string
  danger: (a?: number) => string
  muted: (a?: number) => string
}

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D
  /** CSS-pixel dimensions; the context is already DPR-scaled. */
  w: number
  h: number
  /** Seconds since the canvas mounted. */
  t: number
  dt: number
  /**
   * Theme colours resolved from *this canvas's* computed style, so a chart
   * inside a hue-shifted window picks up that window's tint. Canvas2D cannot
   * parse `var()`, so every colour must come through here rather than being
   * written as a `hsl(var(--x))` string.
   */
  p: Palette
}

const FALLBACK: Record<keyof Palette, string> = {
  primary: '190 96% 72%',
  accent: '152 90% 68%',
  warn: '33 100% 66%',
  danger: '348 95% 68%',
  muted: '195 22% 60%',
}

const VAR_NAME: Record<keyof Palette, string> = {
  primary: '--primary',
  accent: '--accent',
  warn: '--warn',
  danger: '--danger',
  muted: '--muted-foreground',
}

/** Reads the five theme triples off an element and closes over them. */
function resolvePalette(el: Element): Palette {
  const style = getComputedStyle(el)
  const read = (key: keyof Palette): string => style.getPropertyValue(VAR_NAME[key]).trim() || FALLBACK[key]

  const triples: Record<keyof Palette, string> = {
    primary: read('primary'),
    accent: read('accent'),
    warn: read('warn'),
    danger: read('danger'),
    muted: read('muted'),
  }

  return {
    primary: (a = 1) => `hsl(${triples.primary} / ${a})`,
    accent: (a = 1) => `hsl(${triples.accent} / ${a})`,
    warn: (a = 1) => `hsl(${triples.warn} / ${a})`,
    danger: (a = 1) => `hsl(${triples.danger} / ${a})`,
    muted: (a = 1) => `hsl(${triples.muted} / ${a})`,
  }
}

/**
 * Mounts a DPR-correct, resize-aware canvas driven by rAF.
 *
 * Every live graph in the OS runs through this rather than through component
 * state — the telemetry sampler ticks at 10 Hz and the charts redraw at frame
 * rate, and neither should re-render the VDOM to do it.
 */
export function useCanvas(draw: (frame: CanvasFrame) => void): RefObject<HTMLCanvasElement> {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let disposed = false
    const start = performance.now()
    let last = start
    let w = 0
    let h = 0

    // Resolving custom properties forces a style read, so do it once and only
    // redo it when the global hue actually moves.
    let palette = resolvePalette(canvas)
    let paletteHue = projection.peek().hue

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const frame = (now: number) => {
      if (disposed) return
      raf = requestAnimationFrame(frame)

      const hue = projection.peek().hue
      if (hue !== paletteHue) {
        palette = resolvePalette(canvas)
        paletteHue = hue
      }

      const t = (now - start) / 1000
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      ctx.clearRect(0, 0, w, h)
      drawRef.current({ ctx, w, h, t, dt, p: palette })
    }

    raf = requestAnimationFrame(frame)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return ref
}
