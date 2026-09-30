/**
 * The 80×25 text-mode screen: a grid of character codes and attribute bytes,
 * a cursor, and nothing else. Split from terminal.ts so the full-screen
 * programs (editor.ts, snake.ts) can share it without an import cycle.
 */

export const COLS = 80
export const ROWS = 25

/** Attribute byte: low nibble foreground, high nibble background. */
export const GRAY = 0x07
export const WHITE = 0x0f
export const DIM = 0x08
export const CYAN = 0x0b
export const YELLOW = 0x0e
export const RED = 0x0c

export const HALF_BLOCK = 0x2580 // ▀ — foreground on top, background below

export class Screen {
  readonly ch = new Uint16Array(COLS * ROWS)
  readonly at = new Uint8Array(COLS * ROWS)
  cx = 0
  cy = 0
  /** While non-null, everything written is also appended here as text. */
  record: string | null = null

  constructor() {
    this.clear()
  }

  clear(): void {
    this.ch.fill(32)
    this.at.fill(GRAY)
    this.cx = 0
    this.cy = 0
  }

  private scroll(): void {
    this.ch.copyWithin(0, COLS)
    this.at.copyWithin(0, COLS)
    this.ch.fill(32, (ROWS - 1) * COLS)
    this.at.fill(GRAY, (ROWS - 1) * COLS)
  }

  newline(): void {
    if (this.record !== null) this.record += '\n'
    this.cx = 0
    if (++this.cy >= ROWS) {
      this.scroll()
      this.cy = ROWS - 1
    }
  }

  putCode(code: number, attr: number): void {
    if (this.cx >= COLS) this.newline()
    const i = this.cy * COLS + this.cx
    this.ch[i] = code
    this.at[i] = attr
    this.cx++
  }

  write(text: string, attr = GRAY): void {
    if (this.record !== null) this.record += text.replace(/\n/g, '')
    for (const c of text) {
      if (c === '\n') this.newline()
      else this.putCode(c.codePointAt(0) ?? 32, attr)
    }
  }

  writeln(text = '', attr = GRAY): void {
    this.write(text, attr)
    this.newline()
  }

  /** Erase from (x, y) to the end of the screen, leaving the cursor there. */
  eraseFrom(x: number, y: number): void {
    const i = y * COLS + x
    this.ch.fill(32, i)
    this.at.fill(GRAY, i)
    this.cx = x
    this.cy = y
  }

  clone(): Screen {
    const s = new Screen()
    s.ch.set(this.ch)
    s.at.set(this.at)
    s.cx = this.cx
    s.cy = this.cy
    return s
  }

  /** Write one cell at an absolute position, without moving the cursor. */
  set(x: number, y: number, code: number, attr: number): void {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return
    this.ch[y * COLS + x] = code
    this.at[y * COLS + x] = attr
  }

  /** Write text at an absolute position (clipped to the row), without moving the cursor. */
  putAt(x: number, y: number, text: string, attr: number): void {
    let i = 0
    for (const c of text) this.set(x + i++, y, c.codePointAt(0) ?? 32, attr)
  }

  /** Blank the whole screen to one attribute. */
  fill(attr: number): void {
    this.ch.fill(32)
    this.at.fill(attr)
  }

  fillRow(y: number, attr: number): void {
    this.ch.fill(32, y * COLS, (y + 1) * COLS)
    this.at.fill(attr, y * COLS, (y + 1) * COLS)
  }

  /** Become a copy of another screen (full-screen programs restore with this). */
  copyFrom(o: Screen): void {
    this.ch.set(o.ch)
    this.at.set(o.at)
    this.cx = o.cx
    this.cy = o.cy
  }

  /** Plain text of the screen, for screen readers. */
  text(fromRow = 0): string {
    const rows: string[] = []
    for (let y = fromRow; y < ROWS; y++) {
      let row = ''
      for (let x = 0; x < COLS; x++) {
        const c = this.ch[y * COLS + x]
        row += c === HALF_BLOCK ? ' ' : String.fromCharCode(c)
      }
      rows.push(row.trimEnd())
    }
    return rows.join('\n').trim()
  }
}
