/**
 * An 80×25 text-mode machine and the handful of DOS commands it knows.
 *
 * Pure logic, no DOM: it runs during static generation to produce the boot
 * screen that ships in the HTML, and again in the browser once the era is
 * near, starting from exactly the same state so nothing visibly jumps.
 */

import { PALETTE_16, ditherToPalette } from '@/lib/landscape'
import { dosDate, dosFileDate, dosTime } from '@/lib/clock'
import { SONG_ARTIST, SONG_TITLE, toMML } from '@/lib/song'

export * from './screen'
import { COLS, DIM, GRAY, HALF_BLOCK, Screen, WHITE, YELLOW } from './screen'
import { Editor } from './editor'
import { Snake } from './snake'

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
  /** Small game sounds, if sound is on. */
  blip(kind: 'eat' | 'die'): void
  /** Start or stop SONG.MUS. */
  song(on: boolean): void
  songPlaying(): boolean
}

/** 'prompt' is C:\>; the others are full-screen programs that own the keyboard. */
export type Mode = 'prompt' | 'edit' | 'snake'

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
  '  SONG.MUS    one tune, six decades     PLAY SONG.MUS',
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
  mode: Mode = 'prompt'
  /** Called whenever a command has finished and the prompt is back. */
  onOutput: (() => void) | null = null

  private saved: Screen | null = null
  private editor: Editor | null = null
  private snake: Snake | null = null
  private best = 0

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

  /**
   * Non-printing keys. Returns true if the key was consumed, so the caller
   * knows whether to let the browser have it.
   */
  key(name: string, ctrl = false): boolean {
    if (this.mode === 'edit') return this.editKey(name)
    if (this.mode === 'snake') return this.snakeKey(name)
    switch (name) {
      case 'Enter':
        void this.enter()
        return true
      case 'Backspace':
        this.backspace()
        return true
      case 'Escape':
        this.clearLine()
        return true
      case 'ArrowUp':
        this.historyStep(-1)
        return true
      case 'ArrowDown':
        this.historyStep(1)
        return true
      case 'c':
      case 'C':
        if (!ctrl) return false
        this.interrupt()
        return true
    }
    return false
  }

  type(text: string): void {
    if (this.busy) return
    if (this.mode === 'edit' && this.editor) {
      for (const c of text) if (c >= ' ' && !this.editor.insert(c)) this.host?.beep()
      this.syncEditor()
      return
    }
    if (this.mode === 'snake') {
      // WASD steers too, for keyboards without arrows.
      const turn = { w: 'ArrowUp', a: 'ArrowLeft', s: 'ArrowDown', d: 'ArrowRight' }[text.slice(-1).toLowerCase()]
      if (turn) this.snakeKey(turn)
      return
    }
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
    // A full-screen program is running now; the prompt returns when it exits.
    if (this.mode !== 'prompt') {
      this.version++
      return
    }
    this.finish()
  }

  private finish(): void {
    if (this.screen.cx !== 0) this.screen.newline()
    this.screen.newline()
    this.prompt()
    this.version++
    this.onOutput?.()
  }

  // ── full-screen programs ─────────────────────────────────────────────

  private enterMode(mode: Exclude<Mode, 'prompt'>): void {
    this.saved = this.screen.clone()
    this.mode = mode
  }

  /** Leave EDIT or SNAKE: put the screen back exactly as it was, then prompt. */
  exitMode(): void {
    if (this.mode === 'prompt') return
    if (this.editor && this.host) this.host.setNote(this.editor.text())
    if (this.snake) this.best = this.snake.best
    if (this.saved) this.screen.copyFrom(this.saved)
    this.saved = null
    this.editor = null
    this.snake = null
    this.mode = 'prompt'
    this.finish()
  }

  private syncEditor(): void {
    if (!this.editor) return
    // Saved on every keystroke, so the note is already in 2025 as you type.
    this.host?.setNote(this.editor.text())
    this.editor.draw(this.screen)
    this.version++
  }

  private editKey(name: string): boolean {
    const e = this.editor
    if (!e) return false
    switch (name) {
      case 'Escape':
        this.exitMode()
        return true
      case 'Enter':
        if (!e.newline()) this.host?.beep()
        break
      case 'Backspace':
        e.backspace()
        break
      case 'Delete':
        e.del()
        break
      case 'ArrowLeft':
        e.move(-1, 0)
        break
      case 'ArrowRight':
        e.move(1, 0)
        break
      case 'ArrowUp':
        e.move(0, -1)
        break
      case 'ArrowDown':
        e.move(0, 1)
        break
      case 'Home':
        e.home()
        break
      case 'End':
        e.end()
        break
      default:
        return false
    }
    this.syncEditor()
    return true
  }

  private snakeKey(name: string): boolean {
    const g = this.snake
    if (!g) return false
    switch (name) {
      case 'Escape':
        this.exitMode()
        return true
      case 'Enter':
        if (g.dead) g.reset()
        break
      case 'ArrowLeft':
        g.turn(-1, 0)
        break
      case 'ArrowRight':
        g.turn(1, 0)
        break
      case 'ArrowUp':
        g.turn(0, -1)
        break
      case 'ArrowDown':
        g.turn(0, 1)
        break
      default:
        return false
    }
    g.draw(this.screen)
    this.version++
    return true
  }

  /** Advance SNAKE by one step. The host calls this on a timer. */
  tick(): void {
    const g = this.snake
    if (this.mode !== 'snake' || !g) return
    const ev = g.tick()
    if (ev === 'idle') return
    if (ev === 'ate') this.host?.blip('eat')
    if (ev === 'died') this.host?.blip('die')
    g.draw(this.screen)
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
        if (argU && !/^NOTES(\.TXT)?$/.test(argU)) {
          s.writeln('Access denied - only NOTES.TXT is yours to edit.')
          return
        }
        if (!this.host) return
        this.enterMode('edit')
        this.editor = new Editor(this.host.note())
        this.editor.draw(s)
        return
      case 'EDLIN':
        s.writeln('EDLIN is not installed. Nobody misses it. Try EDIT.')
        return
      case 'SNAKE':
      case 'NIBBLES':
      case 'QBASIC':
        this.enterMode('snake')
        this.snake = new Snake(Math.random, this.best)
        this.snake.draw(s)
        return
      case 'PLAY':
        if (argU && !/^SONG(\.MUS)?$/.test(argU)) {
          s.writeln('File not found')
          return
        }
        this.host?.song(true)
        s.write('Playing SONG.MUS on the PC speaker: ')
        s.writeln(`"${SONG_TITLE}" by ${SONG_ARTIST}`, WHITE)
        s.writeln('Type STOP to stop it, or scroll on and hear every decade re-record it.', DIM)
        return
      case 'STOP':
        if (this.host?.songPlaying()) this.host.song(false)
        else s.writeln('Nothing is playing.')
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
      ['EDIT', 'Opens the full-screen editor on NOTES.TXT.'],
      ['MAIL', 'Lists your mail.  MAIL 1 reads the first message.'],
      ['MEM', 'Displays the amount of used and free memory.'],
      ['PLAY', 'Plays a tune on the PC speaker:  PLAY SONG.MUS  (STOP stops it)'],
      ['SNAKE', 'A game. Arrow keys. You know the one.'],
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
      ['README', 'TXT', '344', '09-27-86', ' 6:04p'],
      ['NOTES', 'TXT', String(this.noteBytes()), today, ' 9:04p'],
      ['LAKE', 'PCX', '38912', '07-14-86', ' 8:47p'],
      ['SONG', 'MUS', String(toMML().length + 8), '05-02-86', ' 7:00p'],
      ['SNAKE', 'BAS', '4187', '11-30-86', ' 2:13a'],
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
      case 'SONG.MUS':
      case 'SONG':
        // What the file would really have held: a GW-BASIC PLAY string.
        for (const row of wrap(`PLAY "${toMML()}"`, COLS - 1)) s.writeln(row)
        return
      case 'SNAKE.BAS':
        s.writeln('10 REM You are not going to read 4187 bytes of BASIC.')
        s.writeln('20 REM Type SNAKE.')
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
