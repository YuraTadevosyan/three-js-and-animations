/**
 * Two ways to draw a Screen:
 *
 *  - screenToHtml(): a string of spans for the <pre>. Used for the static
 *    HTML, as the no-WebGPU fallback, and always kept current for screen
 *    readers and text selection.
 *  - TextCanvas: a 2D canvas the WebGPU CRT samples as a texture.
 */

import { PALETTE_16, rgbCss } from '@/lib/landscape'
import { COLS, HALF_BLOCK, ROWS, type Screen } from './terminal'

export const CSS_PALETTE = PALETTE_16.map(rgbCss)

const esc = (code: number): string => {
  if (code === 38) return '&amp;'
  if (code === 60) return '&lt;'
  if (code === 62) return '&gt;'
  return String.fromCharCode(code)
}

export function screenToHtml(s: Screen, cursorOn = true): string {
  let html = ''
  for (let y = 0; y < ROWS; y++) {
    let runAttr = -1
    let run = ''
    const flush = () => {
      if (!run) return
      const fg = runAttr & 15
      const bg = runAttr >> 4
      html += fg === 7 && bg === 0 ? run : `<span style="color:${CSS_PALETTE[fg]}${bg ? `;background:${CSS_PALETTE[bg]}` : ''}">${run}</span>`
      run = ''
    }
    for (let x = 0; x < COLS; x++) {
      const i = y * COLS + x
      const code = s.ch[i]
      const attr = s.at[i]
      const isCursor = cursorOn && x === s.cx && y === s.cy
      if (code === HALF_BLOCK) {
        flush()
        runAttr = -1
        html += `<span class="hb" style="--hf:${CSS_PALETTE[attr & 15]};--hb:${CSS_PALETTE[attr >> 4]}"> </span>`
        continue
      }
      if (isCursor) {
        flush()
        runAttr = -1
        html += `<span class="cur" style="color:${CSS_PALETTE[attr & 15]}">${esc(code)}</span>`
        continue
      }
      if (attr !== runAttr) {
        flush()
        runAttr = attr
      }
      run += esc(code)
    }
    flush()
    if (y < ROWS - 1) html += '\n'
  }
  return html
}

/** Block elements drawn as geometry, so they tile without font seams. */
const BLOCKS: Record<number, (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void> = {
  0x2588: (c, x, y, w, h) => c.fillRect(x, y, w, h), // █
  0x2580: (c, x, y, w, h) => c.fillRect(x, y, w, h / 2), // ▀
  0x2584: (c, x, y, w, h) => c.fillRect(x, y + h / 2, w, h / 2), // ▄
  0x258c: (c, x, y, w, h) => c.fillRect(x, y, w / 2, h), // ▌
  0x2590: (c, x, y, w, h) => c.fillRect(x + w / 2, y, w / 2, h), // ▐
}
/** Single-line box drawing, as strokes through the cell centre. */
const T = 2
const BOX: Record<number, [left: boolean, right: boolean, up: boolean, down: boolean]> = {
  0x2500: [true, true, false, false], // ─
  0x2502: [false, false, true, true], // │
  0x250c: [false, true, false, true], // ┌
  0x2510: [true, false, false, true], // ┐
  0x2514: [false, true, true, false], // └
  0x2518: [true, false, true, false], // ┘
}
for (const [code, [l, r, u, d]] of Object.entries(BOX)) {
  BLOCKS[Number(code)] = (c, x, y, w, h) => {
    const cx = x + w / 2 - T / 2
    const cy = y + h / 2 - T / 2
    if (l) c.fillRect(x, cy, w / 2 + T / 2, T)
    if (r) c.fillRect(cx, cy, w / 2 + T / 2, T)
    if (u) c.fillRect(cx, y, T, h / 2 + T / 2)
    if (d) c.fillRect(cx, cy, T, h / 2 + T / 2)
  }
}
const SHADES: Record<number, number> = { 0x2591: 0.25, 0x2592: 0.5, 0x2593: 0.75 } // ░ ▒ ▓

export class TextCanvas {
  readonly canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private fontPx = 26

  constructor(
    readonly cellW = 16,
    readonly cellH = 32,
  ) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = COLS * cellW
    this.canvas.height = ROWS * cellH
    this.ctx = this.canvas.getContext('2d', { alpha: false })!
  }

  /** Load VT323 and size it to the cell. Falls back to any monospace. */
  async ready(): Promise<void> {
    try {
      await document.fonts.load('32px VT323')
    } catch {
      /* fall back to monospace */
    }
    const ctx = this.ctx
    ctx.font = '32px VT323, monospace'
    const adv = ctx.measureText('M').width || 16
    this.fontPx = Math.min((32 * this.cellW) / adv, this.cellH * 1.02)
  }

  draw(s: Screen, cursorOn: boolean): void {
    const { ctx, cellW: cw, cellH: ch } = this
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Backgrounds, in runs.
    for (let y = 0; y < ROWS; y++) {
      let x0 = 0
      while (x0 < COLS) {
        const bg = s.at[y * COLS + x0] >> 4
        let x1 = x0 + 1
        while (x1 < COLS && s.at[y * COLS + x1] >> 4 === bg) x1++
        if (bg) {
          ctx.fillStyle = CSS_PALETTE[bg]
          ctx.fillRect(x0 * cw, y * ch, (x1 - x0) * cw, ch)
        }
        x0 = x1
      }
    }

    ctx.font = `${this.fontPx}px VT323, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let style = ''
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = y * COLS + x
        const code = s.ch[i]
        if (code === 32) continue
        const fg = CSS_PALETTE[s.at[i] & 15]
        if (fg !== style) {
          ctx.fillStyle = fg
          style = fg
        }
        const px = x * cw
        const py = y * ch
        const block = BLOCKS[code]
        if (block) {
          block(ctx, px, py, cw, ch)
          continue
        }
        const shade = SHADES[code]
        if (shade) {
          ctx.globalAlpha = shade
          ctx.fillRect(px, py, cw, ch)
          ctx.globalAlpha = 1
          continue
        }
        ctx.fillText(String.fromCharCode(code), px + cw / 2, py + ch / 2 + 1)
      }
    }

    if (cursorOn && s.cy >= 0 && s.cy < ROWS && s.cx < COLS) {
      ctx.fillStyle = CSS_PALETTE[s.at[s.cy * COLS + s.cx] & 15]
      ctx.fillRect(s.cx * cw, s.cy * ch + ch * 0.78, cw, ch * 0.13)
    }
  }
}
