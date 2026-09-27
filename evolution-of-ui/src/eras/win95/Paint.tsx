import { component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik'
import { WIN_PALETTE_16, ditherToPalette, rasterLake } from '@/lib/landscape'
import { LIVE } from '@/timeline/eras'
import { whenNear } from '@/timeline/progress'

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

export const Paint = component$(() => {
  const ui = useStore({ tool: 'pencil' as Tool, color: 0 })
  const canvas = useSignal<HTMLCanvasElement>()

  useVisibleTask$(({ cleanup }) => {
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

      // The lake, dithered down to the 16 colours a 1995 VGA card gave you.
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, cv.width, cv.height)
      const img = await rasterLake(cv.width, cv.height)
      if (img) {
        const idx = ditherToPalette(img, WIN_PALETTE_16, 44)
        const out = ctx.createImageData(cv.width, cv.height)
        for (let i = 0; i < idx.length; i++) {
          const c = WIN_PALETTE_16[idx[i]]
          out.data[i * 4] = c[0]
          out.data[i * 4 + 1] = c[1]
          out.data[i * 4 + 2] = c[2]
          out.data[i * 4 + 3] = 255
        }
        ctx.putImageData(out, 0, 0)
      }

      let down = false
      let lx = 0
      let ly = 0
      let spray = 0

      const at = (e: PointerEvent): [number, number] => {
        const r = cv.getBoundingClientRect()
        return [Math.floor(((e.clientX - r.left) / r.width) * cv.width), Math.floor(((e.clientY - r.top) / r.height) * cv.height)]
      }
      const stamp = (x: number, y: number) => {
        switch (ui.tool) {
          case 'pencil':
            ctx.fillRect(x, y, 1, 1)
            break
          case 'brush':
            ctx.fillRect(x - 1, y - 1, 3, 3)
            break
          case 'eraser':
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(x - 4, y - 4, 8, 8)
            ctx.fillStyle = COLORS[ui.color]
            break
        }
      }
      const line = (x0: number, y0: number, x1: number, y1: number) => {
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1)
        for (let k = 0; k <= n; k++) stamp(Math.round(x0 + ((x1 - x0) * k) / n), Math.round(y0 + ((y1 - y0) * k) / n))
      }
      const sprayAt = () => {
        for (let k = 0; k < 10; k++) {
          const a = Math.random() * Math.PI * 2
          const r = Math.sqrt(Math.random()) * 7
          ctx.fillRect(Math.round(lx + Math.cos(a) * r), Math.round(ly + Math.sin(a) * r), 1, 1)
        }
      }
      const flood = (x: number, y: number) => {
        const data = ctx.getImageData(0, 0, cv.width, cv.height)
        const px = new Uint32Array(data.data.buffer)
        const target = px[y * cv.width + x]
        const hex = COLORS[ui.color]
        const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
        const fill = (255 << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0] // little-endian RGBA
        if (target === fill) return
        const stack = [y * cv.width + x]
        while (stack.length) {
          const i = stack.pop()!
          if (px[i] !== target) continue
          px[i] = fill
          const cx = i % cv.width
          if (cx > 0) stack.push(i - 1)
          if (cx < cv.width - 1) stack.push(i + 1)
          if (i >= cv.width) stack.push(i - cv.width)
          if (i < px.length - cv.width) stack.push(i + cv.width)
        }
        ctx.putImageData(data, 0, 0)
      }
      const pick = (x: number, y: number) => {
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
        let best = 0
        let bestD = Infinity
        COLORS.forEach((hex, k) => {
          const d = (r - parseInt(hex.slice(1, 3), 16)) ** 2 + (g - parseInt(hex.slice(3, 5), 16)) ** 2 + (b - parseInt(hex.slice(5, 7), 16)) ** 2
          if (d < bestD) {
            bestD = d
            best = k
          }
        })
        ui.color = best
        ui.tool = 'pencil'
      }

      const onDown = (e: PointerEvent) => {
        if (e.button !== 0) return
        e.preventDefault()
        const [x, y] = at(e)
        ctx.fillStyle = COLORS[ui.color]
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
        down = false
        window.clearInterval(spray)
      }
      cv.addEventListener('pointerdown', onDown)
      cv.addEventListener('pointermove', onMove)
      cv.addEventListener('pointerup', onUp)
      cv.addEventListener('pointercancel', onUp)
      return () => {
        cv.removeEventListener('pointerdown', onDown)
        cv.removeEventListener('pointermove', onMove)
        cv.removeEventListener('pointerup', onUp)
        cv.removeEventListener('pointercancel', onUp)
        window.clearInterval(spray)
      }
    }
  }, { strategy: 'document-ready' })

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
          <div class="pt-opts" />
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
        <span class="w95-field grow">For Help, click Help Topics on the Help Menu.</span>
      </div>
    </div>
  )
})
