/**
 * EDIT: a full-screen text editor in the manner of the MS-DOS Editor. Blue
 * screen, menu bar you can't open, a box, a status line. Pure logic over a
 * Screen, like everything else in this folder.
 */

import { COLS, ROWS, type Screen } from './screen'

const MENU = 0x70 // black on grey
const FRAME = 0x17 // grey on blue
const TEXT = 0x1f // white on blue
const STATUS = 0x30 // black on cyan

export const EDIT_COLS = COLS - 2
export const EDIT_ROWS = ROWS - 4
const MAX_LINES = 200

export class Editor {
  lines: string[]
  cx = 0
  cy = 0
  private top = 0

  constructor(
    text: string,
    readonly filename = 'NOTES.TXT',
  ) {
    this.lines = text.split('\n').map((l) => l.slice(0, EDIT_COLS))
    if (!this.lines.length) this.lines = ['']
    // Start at the end, where you'd want to add a line.
    this.cy = this.lines.length - 1
    this.cx = this.lines[this.cy].length
    this.scroll()
  }

  text(): string {
    return this.lines.join('\n')
  }

  /** Returns false when the character didn't fit (the caller beeps). */
  insert(ch: string): boolean {
    const line = this.lines[this.cy]
    if (line.length >= EDIT_COLS) return false
    this.lines[this.cy] = line.slice(0, this.cx) + ch + line.slice(this.cx)
    this.cx++
    return true
  }

  newline(): boolean {
    if (this.lines.length >= MAX_LINES) return false
    const line = this.lines[this.cy]
    this.lines[this.cy] = line.slice(0, this.cx)
    this.lines.splice(this.cy + 1, 0, line.slice(this.cx))
    this.cy++
    this.cx = 0
    this.scroll()
    return true
  }

  backspace(): void {
    if (this.cx > 0) {
      const line = this.lines[this.cy]
      this.lines[this.cy] = line.slice(0, this.cx - 1) + line.slice(this.cx)
      this.cx--
    } else if (this.cy > 0) {
      // Join with the line above, if the result fits.
      const prev = this.lines[this.cy - 1]
      if (prev.length + this.lines[this.cy].length > EDIT_COLS) return
      this.cx = prev.length
      this.lines[this.cy - 1] = prev + this.lines[this.cy]
      this.lines.splice(this.cy, 1)
      this.cy--
    }
    this.scroll()
  }

  del(): void {
    const line = this.lines[this.cy]
    if (this.cx < line.length) this.lines[this.cy] = line.slice(0, this.cx) + line.slice(this.cx + 1)
    else if (this.cy < this.lines.length - 1 && line.length + this.lines[this.cy + 1].length <= EDIT_COLS) {
      this.lines[this.cy] = line + this.lines[this.cy + 1]
      this.lines.splice(this.cy + 1, 1)
    }
  }

  move(dx: number, dy: number): void {
    if (dy) {
      this.cy = Math.max(0, Math.min(this.lines.length - 1, this.cy + dy))
      this.cx = Math.min(this.cx, this.lines[this.cy].length)
    }
    if (dx < 0) {
      if (this.cx > 0) this.cx--
      else if (this.cy > 0) {
        this.cy--
        this.cx = this.lines[this.cy].length
      }
    } else if (dx > 0) {
      if (this.cx < this.lines[this.cy].length) this.cx++
      else if (this.cy < this.lines.length - 1) {
        this.cy++
        this.cx = 0
      }
    }
    this.scroll()
  }

  home(): void {
    this.cx = 0
  }

  end(): void {
    this.cx = this.lines[this.cy].length
  }

  private scroll(): void {
    if (this.cy < this.top) this.top = this.cy
    if (this.cy >= this.top + EDIT_ROWS) this.top = this.cy - EDIT_ROWS + 1
  }

  draw(s: Screen): void {
    s.fill(TEXT)
    s.fillRow(0, MENU)
    s.putAt(3, 0, 'File  Edit  Search  Options', MENU)
    s.putAt(COLS - 7, 0, 'Help', MENU)

    const title = ` ${this.filename} `
    const left = Math.floor((COLS - 2 - title.length) / 2)
    s.putAt(0, 1, `┌${'─'.repeat(left)}${title}${'─'.repeat(COLS - 2 - left - title.length)}┐`, FRAME)
    for (let r = 0; r < EDIT_ROWS; r++) {
      const y = 2 + r
      s.putAt(0, y, '│', FRAME)
      s.putAt(COLS - 1, y, '│', FRAME)
      const line = this.lines[this.top + r]
      if (line) s.putAt(1, y, line, TEXT)
    }
    s.putAt(0, ROWS - 2, `└${'─'.repeat(COLS - 2)}┘`, FRAME)

    s.fillRow(ROWS - 1, STATUS)
    s.putAt(1, ROWS - 1, 'MS-DOS Editor  <Esc=Save and exit>  <Arrows=Move>', STATUS)
    const pos = `Ln ${this.cy + 1}, Col ${this.cx + 1}`
    s.putAt(COLS - 1 - pos.length, ROWS - 1, pos, STATUS)

    s.cx = 1 + this.cx
    s.cy = 2 + this.cy - this.top
  }
}
