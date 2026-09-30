import { component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik'
import { WIN_PALETTE_16, ditherToPalette, rasterLake } from '@/lib/landscape'
import { LIVE } from '@/timeline/eras'
import { whenNear } from '@/timeline/progress'
import { useWorld } from '@/state/world'

type Tool = 'select' | 'eraser' | 'fill' | 'picker' | 'zoom' | 'pencil' | 'brush' | 'spray'

/** Paint's default 28-colour palette, in its on-screen order. */
const COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040',
]

const TOOLS: { id: Tool; label: string; path: string }[] = [
  { id: 'select', label: 'Select', path: 'M2 2h12v12H2z' },
  { id: 'eraser', label: 'Eraser', path: 'M3 9l6-6 5 5-6 6H5zM6 12l-3-3' },
  { id: 'fill', label: 'Fill With Color', path: 'M3 8l5-5 5 5-5 5zM13 8c1 2 1 4 0 5' },
  { id: 'picker', label: 'Pick Color', path: 'M2 14l7-7M8 4l4 4M10 2l4 4-2 2-4-4z' },
  { id: 'zoom', label: 'Magnifier', path: 'M9 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 10l6 5' },
  { id: 'pencil', label: 'Pencil', path: 'M2 14l2-5 7-7 3 3-7 7zM4 9l3 3' },
  { id: 'brush', label: 'Brush', path: 'M2 14c0-3 2-4 4-4l1 1c0 2-2 3-5 3zM7 10l7-8' },
  { id: 'spray', label: 'Airbrush', path: 'M5 6h5v9H5zM6 3h3v3H6zM11 3h1M13 2h1M12 5h1M14 4h1' },
]

const rgb = (hex: string): [number, number, number] => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]

export const Paint = component$(() => {
  const world = useWorld()
  const ui = useStore({ tool: 'brush' as Tool, color: 16 })
  const canvas = useSignal<HTMLCanvasElement>()

  useVisibleTask$(
    ({ cleanup }) => {
      let detach = () => {}
      const stop = whenNear(LIVE.win95, 0.5, () => {
        void setup().then((d) => (detach = d))
      })
      cleanup(() => {
        stop()
        detach()
      })

      async function setup(): Promise<() => void> {
        const cv = canvas.value
        const ctx = cv?.getContext('2d', { willReadFrequently: true })
        if (!cv || !ctx) return () => {}
        const W = cv.width
        const H = cv.height

        // Two surfaces. `ctx` is what you see: the photo plus your strokes.
        // `layer` holds only the strokes, transparent elsewhere. It is what
        // gets saved to the world, so every later era can lay it over its
        // own rendering of the photo.
        const layerCanvas = document.createElement('canvas')
        layerCanvas.width = W
        layerCanvas.height = H
        const layer = layerCanvas.getContext('2d', { willReadFrequently: true })!
        const both = (draw: (c: CanvasRenderingContext2D) => void) => {
          draw(ctx)
          draw(layer)
        }

        // The lake, dithered down to the 16 colours a 1995 VGA card gave you.
        const base = ctx.createImageData(W, H)
        const img = await rasterLake(W, H)
        if (img) {
          const idx = ditherToPalette(img, WIN_PALETTE_16, 44)
          for (let i = 0; i < idx.length; i++) {
            const c = WIN_PALETTE_16[idx[i]]
            base.data[i * 4] = c[0]
            base.data[i * 4 + 1] = c[1]
            base.data[i * 4 + 2] = c[2]
            base.data[i * 4 + 3] = 255
          }
        } else base.data.fill(255)
        ctx.putImageData(base, 0, 0)

        // Whatever was painted on a previous visit.
        if (world.art) {
          try {
            const saved = new Image()
            saved.src = world.art
            await saved.decode()
            both((c) => c.drawImage(saved, 0, 0, W, H))
          } catch {
            /* a corrupt save just means a clean photo */
          }
        }

        const commit = () => {
          world.art = layerCanvas.toDataURL('image/png')
        }

        let down = false
        let lx = 0
        let ly = 0
        let spray = 0

        const at = (e: PointerEvent): [number, number] => {
          const r = cv.getBoundingClientRect()
          return [Math.floor(((e.clientX - r.left) / r.width) * W), Math.floor(((e.clientY - r.top) / r.height) * H)]
        }
        const ink = () => (ui.tool === 'eraser' ? '#ffffff' : COLORS[ui.color])
        const stamp = (x: number, y: number) => {
          const size = ui.tool === 'pencil' ? 1 : ui.tool === 'brush' ? 3 : 8
          const o = Math.floor(size / 2)
          both((c) => {
            c.fillStyle = ink()
            c.fillRect(x - o, y - o, size, size)
          })
        }
        const line = (x0: number, y0: number, x1: number, y1: number) => {
          const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1)
          for (let k = 0; k <= n; k++) stamp(Math.round(x0 + ((x1 - x0) * k) / n), Math.round(y0 + ((y1 - y0) * k) / n))
        }
        const sprayAt = () => {
          both((c) => (c.fillStyle = COLORS[ui.color]))
          for (let k = 0; k < 10; k++) {
            const a = Math.random() * Math.PI * 2
            const r = Math.sqrt(Math.random()) * 7
            const x = Math.round(lx + Math.cos(a) * r)
            const y = Math.round(ly + Math.sin(a) * r)
            both((c) => c.fillRect(x, y, 1, 1))
          }
        }
        const flood = (x: number, y: number) => {
          const seen = ctx.getImageData(0, 0, W, H)
          const strokes = layer.getImageData(0, 0, W, H)
          const px = new Uint32Array(seen.data.buffer)
          const lp = new Uint32Array(strokes.data.buffer)
          const target = px[y * W + x]
          const [r, g, b] = rgb(COLORS[ui.color])
          const fill = ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0 // little-endian RGBA
          if (target === fill) return
          const stack = [y * W + x]
          while (stack.length) {
            const i = stack.pop()!
            if (px[i] !== target) continue
            px[i] = fill
            lp[i] = fill
            const cx = i % W
            if (cx > 0) stack.push(i - 1)
            if (cx < W - 1) stack.push(i + 1)
            if (i >= W) stack.push(i - W)
            if (i < px.length - W) stack.push(i + W)
          }
          ctx.putImageData(seen, 0, 0)
          layer.putImageData(strokes, 0, 0)
          commit()
        }
        const pick = (x: number, y: number) => {
          const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
          let best = 0
          let bestD = Infinity
          COLORS.forEach((hex, k) => {
            const [cr, cg, cb] = rgb(hex)
            const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
            if (d < bestD) {
              bestD = d
              best = k
            }
          })
          ui.color = best
          ui.tool = 'brush'
        }

        const onDown = (e: PointerEvent) => {
          if (e.button !== 0) return
          e.preventDefault()
          const [x, y] = at(e)
          if (x < 0 || y < 0 || x >= W || y >= H) return
          if (ui.tool === 'fill') return flood(x, y)
          if (ui.tool === 'picker') return pick(x, y)
          if (ui.tool === 'select' || ui.tool === 'zoom') return
          cv.setPointerCapture(e.pointerId)
          down = true
          lx = x
          ly = y
          if (ui.tool === 'spray') {
            sprayAt()
            spray = window.setInterval(sprayAt, 40)
          } else stamp(x, y)
        }
        const onMove = (e: PointerEvent) => {
          if (!down) return
          const [x, y] = at(e)
          if (ui.tool !== 'spray') line(lx, ly, x, y)
          lx = x
          ly = y
        }
        const onUp = () => {
          if (!down) return
          down = false
          window.clearInterval(spray)
          commit()
        }
        // The Clear button (a Qwik handler) reaches in with an event.
        const onClear = () => {
          ctx.putImageData(base, 0, 0)
          layer.clearRect(0, 0, W, H)
          world.art = ''
        }
        cv.addEventListener('pointerdown', onDown)
        cv.addEventListener('pointermove', onMove)
        cv.addEventListener('pointerup', onUp)
        cv.addEventListener('pointercancel', onUp)
        cv.addEventListener('paint-clear', onClear)
        return () => {
          cv.removeEventListener('pointerdown', onDown)
          cv.removeEventListener('pointermove', onMove)
          cv.removeEventListener('pointerup', onUp)
          cv.removeEventListener('pointercancel', onUp)
          cv.removeEventListener('paint-clear', onClear)
          window.clearInterval(spray)
        }
      }
    },
    { strategy: 'document-ready' },
  )

  return (
    <div class="pt">
      <div class="w95-menubar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Image</span>
        <span>Options</span>
        <span>Help</span>
      </div>
      <div class="pt-main">
        <div class="pt-tools" role="toolbar" aria-label="Tools">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              class={['pt-tool', ui.tool === t.id && 'on']}
              title={t.label}
              aria-label={t.label}
              aria-pressed={ui.tool === t.id}
              onClick$={() => (ui.tool = t.id)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d={t.path} fill="none" stroke="#000" stroke-width="1.2" stroke-linejoin="round" />
              </svg>
            </button>
          ))}
          <button
            type="button"
            class="w95-btn pt-clear"
            disabled={!world.art}
            title="Clear Image"
            onClick$={() => canvas.value?.dispatchEvent(new CustomEvent('paint-clear'))}
          >
            Clear
          </button>
        </div>
        <div class="pt-canvas-wrap">
          <canvas ref={canvas} class="pt-canvas" width={320} height={200} aria-label="lake.bmp. Draw on it." />
        </div>
      </div>
      <div class="pt-palette">
        <div class="pt-current" aria-hidden="true">
          <span class="bg" />
          <span class="fg" style={{ background: COLORS[ui.color] }} />
        </div>
        <div class="pt-swatches" role="radiogroup" aria-label="Colors">
          {COLORS.map((c, k) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={ui.color === k}
              aria-label={c}
              class="pt-swatch"
              style={{ background: c }}
              onClick$={() => (ui.color = k)}
            />
          ))}
        </div>
      </div>
      <div class="w95-status">
        <span class="w95-field grow">{world.art ? 'Painted. It stays painted in every decade after this one.' : 'Paint on the lake. Every later decade will show it.'}</span>
      </div>
    </div>
  )
})
