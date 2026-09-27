/**
 * An 80×25 text-mode machine and the handful of DOS commands it knows.
 *
 * Pure logic, no DOM: it runs during static generation to produce the boot
 * screen that ships in the HTML, and again in the browser once the era is
 * near, starting from exactly the same state so nothing visibly jumps.
 */

import { PALETTE_16, ditherToPalette } from '@/lib/landscape'
import { dosDate, dosFileDate, dosTime } from '@/lib/clock'

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

export interface DosMessage {
  id: string
  from: string
  subject: string
  body: string
  read: boolean
}

/** Everything the terminal can touch outside itself. */
export interface DosHost {
  note(): string
  setNote(text: string): void
  messages(): readonly DosMessage[]
  markRead(id: string): void
  online(): boolean
  startWindows(): void
  /** The lake photo as 80×44 pixels (two per text cell, stacked). */
  photo(): Promise<ImageData | null>
  beep(): void
}

const MAX_LINE = COLS - 5

const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length))
const padL = (s: string, n: number) => (s.length >= n ? s : ' '.repeat(n - s.length) + s)

/** Greedy word wrap. */
export function wrap(text: string, width: number): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/)) {
      if (!word) continue
      if (!line) line = word
      else if (line.length + 1 + word.length <= width) line += ' ' + word
      else {
        out.push(line)
        line = word
      }
      while (line.length > width) {
        out.push(line.slice(0, width))
        line = line.slice(width)
      }
    }
    out.push(line)
  }
  return out
}

const GARBAGE = (seed: number, n: number): string => {
  // Deterministic "binary file" noise from the printable half of CP437.
  const glyphs = '☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■'
  let s = seed
  let out = ''
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    out += glyphs[s % glyphs.length]
  }
  return out
}

export const README = [
  'Welcome home. Everything you own is in this directory:',
  '',
  '  NOTES.TXT   your to-do list           TYPE NOTES.TXT',
  '  LAKE.PCX    a photo of the lake       VIEW LAKE.PCX',
  '  MAIL        three new messages        MAIL',
  '',
  'Type HELP for everything else.  Click the screen to start typing.',
]

export class Terminal {
  readonly screen = new Screen()
  /** What's been typed at the current prompt. */
  line = ''
  /** Bumped on every visible change; renderers compare it. */
  version = 0
  /** Plain text of the last command's output, for the aria-live region. */
  lastOutput = ''
  busy = false

  private history: string[] = []
  private hi = 0
  private promptX = 0
  private promptY = 0

  constructor(private host: DosHost | null = null) {}

  /** The boot screen. Deterministic, so SSR and the client agree. */
  boot(): this {
    const s = this.screen
    s.clear()
    s.writeln('Starting MS-DOS...')
    s.writeln()
    s.writeln('HIMEM is testing extended memory...done.')
    s.writeln()
    s.writeln('Microsoft(R) MS-DOS(R) Version 3.30')
    s.writeln('             (C)Copyright Microsoft Corp 1981-1987')
    s.writeln()
    s.writeln('C:\\>TYPE README.TXT')
    this.readme()
    s.writeln()
    this.prompt()
    this.version++
    return this
  }

  private readme(): void {
    const s = this.screen
    for (const row of README) {
      // Commands in bright white, so the eye finds them.
      const m = row.match(/^(\s{2}\S+\s+.+?\s{2,})(\S.*)$/)
      if (m) {
        s.write(m[1])
        s.writeln(m[2], WHITE)
      } else if (row.startsWith('Type HELP')) {
        s.write('Type ')
        s.write('HELP', WHITE)
        s.writeln(row.slice(9))
      } else s.writeln(row)
    }
  }

  private prompt(): void {
    this.screen.write('C:\\>')
    this.promptX = this.screen.cx
    this.promptY = this.screen.cy
    this.line = ''
  }

  // ── input ────────────────────────────────────────────────────────────

  type(text: string): void {
    if (this.busy) return
    for (const c of text) {
      if (c < ' ') continue
      if (this.line.length >= MAX_LINE) {
        this.host?.beep()
        break
      }
      this.line += c
      this.screen.write(c)
    }
    this.version++
  }

  backspace(): void {
    if (this.busy || !this.line) return
    this.line = this.line.slice(0, -1)
    this.redrawLine()
  }

  /** Esc: DOS prints a backslash and starts a fresh line; we just clear it. */
  clearLine(): void {
    if (this.busy) return
    this.line = ''
    this.redrawLine()
  }

  historyStep(dir: -1 | 1): void {
    if (this.busy || !this.history.length) return
    this.hi = Math.max(0, Math.min(this.history.length, this.hi + dir))
    this.line = this.history[this.hi] ?? ''
    this.redrawLine()
  }

  interrupt(): void {
    if (this.busy) return
    this.screen.writeln('^C')
    this.screen.newline()
    this.prompt()
    this.version++
  }

  private redrawLine(): void {
    this.screen.eraseFrom(this.promptX, this.promptY)
    this.screen.write(this.line)
    this.version++
  }

  async enter(): Promise<void> {
    if (this.busy) return
    const cmd = this.line
    this.screen.newline()
    if (cmd.trim()) {
      this.history.push(cmd)
      if (this.history.length > 40) this.history.shift()
    }
    this.hi = this.history.length
    this.busy = true
    this.screen.record = ''
    try {
      await this.run(cmd.trim())
    } finally {
      this.busy = false
      this.lastOutput = this.screen.record.trim()
      this.screen.record = null
    }
    if (this.screen.cx !== 0) this.screen.newline()
    this.screen.newline()
    this.prompt()
    this.version++
  }

  // ── commands ─────────────────────────────────────────────────────────

  async run(cmdline: string): Promise<void> {
    const s = this.screen
    if (!cmdline) {
      // A bare Enter just gets a new prompt, with no blank line between.
      s.cy = Math.max(0, s.cy - 1)
      return
    }
    const [head, ...rest] = cmdline.split(/\s+/)
    const cmd = head.toUpperCase().replace(/\.(COM|EXE|BAT)$/, '')
    const arg = rest.join(' ')
    const argU = arg.toUpperCase()

    if (/^ECHO[.]?$/i.test(head) || /^ECHO\b/i.test(cmdline)) return this.echo(cmdline)

    switch (cmd) {
      case 'HELP':
        return this.help()
      case 'CLS':
        s.clear()
        // enter() adds one newline before the prompt; start a row above the
        // top so it lands the prompt on row 0.
        s.cy = -1
        return
      case 'DIR':
        return this.dir()
      case 'TYPE':
        return this.typeFile(argU)
      case 'VIEW':
      case 'SHOW':
        return this.view(argU)
      case 'MAIL':
        return this.mail(argU)
      case 'VER':
        s.newline()
        s.writeln('MS-DOS Version 3.30')
        return
      case 'DATE':
        s.writeln(`Current date is ${dosDate()}`)
        return
      case 'TIME':
        s.writeln(`Current time is ${dosTime()}`)
        return
      case 'MEM':
        s.newline()
        s.writeln('    655360 bytes total conventional memory')
        s.writeln('    655360 bytes available to MS-DOS')
        s.writeln('    598784 largest executable program size')
        s.newline()
        s.writeln('   3145728 bytes total contiguous extended memory')
        s.writeln('         0 bytes available contiguous extended memory')
        return
      case 'CD':
      case 'CHDIR':
        if (!arg || arg === '.' || arg === '\\') s.writeln('C:\\')
        else if (argU === 'MAIL') s.writeln('No need - type MAIL and it reads the directory for you.')
        else s.writeln('Invalid directory')
        return
      case 'WIN':
        s.writeln('Starting Windows...')
        this.host?.startWindows()
        return
      case 'EXIT':
        s.writeln("There's nowhere to exit to. It's 1980. Scroll down instead.")
        return
      case 'EDIT':
      case 'EDLIN':
        s.writeln(`${cmd} is not installed. Try:  ECHO buy milk >> NOTES.TXT`)
        return
      case 'FORMAT':
        s.writeln('Nice try.')
        return
      case 'DEL':
      case 'ERASE':
        s.writeln('Access denied')
        return
      case 'CLAUDE':
      case 'CHATGPT':
      case 'AI':
        s.writeln('Bad command or file name')
        s.writeln('(Ask again in 2040.)', DIM)
        return
      default:
        s.writeln('Bad command or file name')
    }
  }

  private help(): void {
    const s = this.screen
    const rows: [string, string][] = [
      ['CLS', 'Clears the screen.'],
      ['DATE', 'Displays the date.'],
      ['DIR', 'Lists the files in the current directory.'],
      ['ECHO', 'Prints a message, or writes one:  ECHO buy milk >> NOTES.TXT'],
      ['MAIL', 'Lists your mail.  MAIL 1 reads the first message.'],
      ['MEM', 'Displays the amount of used and free memory.'],
      ['TIME', 'Displays the time.'],
      ['TYPE', 'Displays a text file:  TYPE NOTES.TXT'],
      ['VER', 'Displays the MS-DOS version.'],
      ['VIEW', 'Displays a picture:  VIEW LAKE.PCX'],
      ['WIN', 'Starts Windows.  (Or just keep scrolling.)'],
    ]
    s.writeln('For more information on a specific command, you are on your own.')
    s.newline()
    for (const [c, d] of rows) {
      s.write(pad(c, 9), WHITE)
      s.writeln(d)
    }
  }

  private noteBytes(): number {
    return this.host ? this.host.note().replace(/\n/g, '\r\n').length : 0
  }

  private dir(): void {
    const s = this.screen
    const today = dosFileDate()
    const files: [string, string, string, string, string][] = [
      ['COMMAND', 'COM', '25307', '03-17-87', '12:00p'],
      ['AUTOEXEC', 'BAT', '79', '09-27-86', ' 6:02p'],
      ['CONFIG', 'SYS', '52', '09-27-86', ' 6:02p'],
      ['README', 'TXT', '288', '09-27-86', ' 6:04p'],
      ['NOTES', 'TXT', String(this.noteBytes()), today, ' 9:04p'],
      ['LAKE', 'PCX', '38912', '07-14-86', ' 8:47p'],
      ['MAIL', '', '<DIR>', '09-27-86', ' 6:05p'],
      ['WIN', 'COM', '22016', '06-01-87', '12:00a'],
    ]
    s.newline()
    s.writeln(' Volume in drive C is HOME')
    s.writeln(' Directory of  C:\\')
    s.newline()
    for (const [name, ext, size, date, time] of files) {
      const sizeCol = size === '<DIR>' ? pad('<DIR>', 9) : padL(size, 9)
      s.writeln(`${pad(name, 8)} ${pad(ext, 3)} ${sizeCol}  ${date}  ${time}`, name === 'NOTES' ? WHITE : GRAY)
    }
    s.writeln(`        ${files.length} File(s)   1200128 bytes free`)
  }

  private typeFile(name: string): void {
    const s = this.screen
    switch (name) {
      case '':
        s.writeln('Required parameter missing')
        return
      case 'NOTES.TXT':
      case 'NOTES': {
        const note = this.host?.note() ?? ''
        if (!note.trim()) s.writeln('(empty)', DIM)
        for (const row of note.split('\n')) s.writeln(row)
        return
      }
      case 'README.TXT':
      case 'README':
        this.readme()
        return
      case 'AUTOEXEC.BAT':
        s.writeln('@ECHO OFF')
        s.writeln('PROMPT $P$G')
        s.writeln('PATH C:\\DOS;C:\\WINDOWS')
        s.writeln('SET TEMP=C:\\TEMP')
        return
      case 'CONFIG.SYS':
        s.writeln('FILES=30')
        s.writeln('BUFFERS=20')
        s.writeln('DEVICE=C:\\DOS\\HIMEM.SYS')
        return
      case 'LAKE.PCX':
      case 'COMMAND.COM':
      case 'WIN.COM':
        s.writeln(GARBAGE(name.length * 7919, 150))
        this.host?.beep()
        if (name === 'LAKE.PCX') s.writeln('That is a picture. Try VIEW LAKE.PCX', DIM)
        return
      case 'MAIL':
        s.writeln('Access denied - MAIL is a directory. Type MAIL.')
        return
      default:
        s.writeln('File not found')
    }
  }

  private async view(name: string): Promise<void> {
    const s = this.screen
    if (!name) {
      s.writeln('Required parameter missing')
      return
    }
    if (name !== 'LAKE.PCX' && name !== 'LAKE') {
      s.writeln(name.endsWith('.TXT') ? 'Not a picture. Try TYPE instead.' : 'File not found')
      return
    }
    const img = this.host ? await this.host.photo() : null
    if (!img) {
      s.writeln('Error reading drive C')
      return
    }
    // Two pixels per cell, stacked: the top one in the foreground colour of
    // an upper half-block, the bottom one in the background. 80×44 → 80×22,
    // which leaves exactly room for the caption, a gap and the prompt.
    const idx = ditherToPalette(img, PALETTE_16, 28)
    for (let row = 0; row < img.height / 2; row++) {
      for (let x = 0; x < COLS; x++) {
        const top = idx[row * 2 * img.width + x]
        const bot = idx[(row * 2 + 1) * img.width + x]
        s.putCode(HALF_BLOCK, top | (bot << 4))
      }
      // No newline: a full row leaves cx at COLS, and the next write wraps.
    }
    s.write('LAKE.PCX', WHITE)
    s.write('  320x200, 16 colours.  Sunset, July 1986.')
  }

  private mail(arg: string): void {
    const s = this.screen
    if (!this.host?.online()) {
      s.writeln('ATDT 555-0199')
      s.writeln('NO CARRIER', WHITE)
      s.writeln('(The modem is off. Somebody turned the Wi-Fi off in 2025.)', DIM)
      return
    }
    const msgs = this.host.messages()
    if (!arg) {
      const unread = msgs.filter((m) => !m.read).length
      s.newline()
      s.writeln(` Mail for HOME${padL(`${msgs.length} message${msgs.length === 1 ? '' : 's'}, ${unread} unread`, 60)}`)
      s.newline()
      if (!msgs.length) {
        s.writeln('  No messages. (You archived them all in 2015.)', DIM)
        return
      }
      s.writeln('  #  From       Subject', DIM)
      msgs.forEach((m, i) => {
        s.write(`  ${i + 1}  `)
        s.write(pad(m.from, 10), m.read ? GRAY : WHITE)
        s.write(m.read ? ' ' : '*', YELLOW)
        s.writeln(m.subject, m.read ? GRAY : WHITE)
      })
      s.newline()
      s.writeln(`  * unread.  Type MAIL 1 to read the first one.`, DIM)
      return
    }
    const n = parseInt(arg, 10)
    const m = msgs[n - 1]
    if (!m) {
      s.writeln(`No message ${arg}. There ${msgs.length === 1 ? 'is' : 'are'} ${msgs.length}.`)
      return
    }
    s.newline()
    s.write(' From:    ', DIM)
    s.writeln(m.from, WHITE)
    s.write(' Subject: ', DIM)
    s.writeln(m.subject, WHITE)
    s.newline()
    for (const row of wrap(m.body, COLS - 2)) s.writeln(` ${row}`)
    this.host.markRead(m.id)
  }

  private echo(cmdline: string): void {
    const s = this.screen
    const body = cmdline.replace(/^echo\.?/i, '')
    if (/^echo\.$/i.test(cmdline.trim())) {
      s.newline()
      return
    }
    const redirect = body.match(/^\s*(.*?)\s*(>>?)\s*(\S+)\s*$/)
    if (redirect) {
      const [, text, op, target] = redirect
      if (!/^NOTES(\.TXT)?$/i.test(target)) {
        s.writeln('Access denied - only NOTES.TXT is yours to write.')
        return
      }
      if (!this.host) return
      const clean = text.slice(0, 200)
      const prev = this.host.note()
      this.host.setNote(op === '>' ? clean : prev.trim() ? `${prev.replace(/\n+$/, '')}\n${clean}` : clean)
      // DOS prints nothing on a redirect. Rewind the newline enter() added so
      // the next prompt follows directly, the way it did.
      s.cy = Math.max(0, s.cy - 1)
      return
    }
    const text = body.trim()
    if (!text) s.writeln('ECHO is on.')
    else s.writeln(text)
  }

  // ── the scroll-scripted transition into Windows ─────────────────────

  /**
   * What the screen should show at timeline position `k` ∈ [0, 1] of the
   * DOS → Windows transition: the letters W, I, N typed at the prompt, then
   * Enter, then the blank screen of a video-mode switch. Pure — the real
   * screen is never touched, so scrolling back up restores it exactly.
   */
  scripted(k: number): Screen {
    const s = this.screen.clone()
    if (k >= 0.78) {
      s.clear()
      return s
    }
    const n = Math.min(3, Math.floor((k / 0.7) * 4))
    s.eraseFrom(this.promptX, this.promptY)
    s.write('WIN'.slice(0, n))
    if (k >= 0.7) {
      s.newline()
      s.write('Starting Windows...')
      s.newline()
    }
    return s
  }
}
