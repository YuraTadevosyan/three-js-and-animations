import type { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { HoloProjector, SHAPES, type ShapeName } from '@/gl/projector'
import { pulseLoad } from '@/state/telemetry'

/** Windowed WebGL projector — a wireframe volume you can spin with the pointer. */
export function Projector(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const projectorRef = useRef<HoloProjector | null>(null)
  const [shape, setShape] = useState<ShapeName>('knot')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const projector = new HoloProjector(canvas, 'knot')
    projectorRef.current = projector
    projector.start()

    // The canvas lives inside a resizable window, so track the element rather
    // than the viewport.
    const observer = new ResizeObserver(() => projector.resize())
    observer.observe(canvas)

    return () => {
      observer.disconnect()
      projector.dispose()
      projectorRef.current = null
    }
  }, [])

  useEffect(() => {
    projectorRef.current?.setShape(shape)
  }, [shape])

  return (
    <div class="flex h-full flex-col">
      <div class="relative min-h-0 flex-1">
        <canvas ref={canvasRef} class="h-full w-full cursor-grab active:cursor-grabbing" />

        {/* Reticle overlay */}
        <div class="pointer-events-none absolute inset-0">
          <span class="absolute left-3 top-3 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-primary/50">
            lattice projector
          </span>
          <span class="absolute bottom-3 right-3 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-primary/40">
            drag to rotate
          </span>
          <span class="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-primary/25" />
          <span class="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-primary/25" />
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-1.5 border-t border-primary/20 px-2.5 py-2">
        {SHAPES.map((s) => (
          <button
            key={s.id}
            type="button"
            class="holo-btn"
            data-active={shape === s.id}
            onClick={() => {
              setShape(s.id)
              pulseLoad(1.2)
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
