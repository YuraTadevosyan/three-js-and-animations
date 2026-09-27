/**
 * Logic tests for everything that can be checked without a browser:
 * the DOS terminal, Minesweeper, the timeline maths, era dates, NEXUS, the
 * lake generator, the hologram's framing, and the inline boot script.
 *
 * Run with `npm test` (scripts/run-tests.mjs bundles this with esbuild).
 */
import assert from 'node:assert/strict'
import { Terminal, COLS, ROWS, HALF_BLOCK, type DosHost } from '@/eras/dos/terminal'
import { screenToHtml } from '@/eras/dos/render'
import * as MS from '@/eras/win95/mines'
import { buildScene, TARGET, KIND, CAMERA, eyeFor } from '@/eras/scifi/scene'
import { respond } from '@/eras/scifi/assistant'
import { yearAt, yearCalc, ERAS, LIVE, T_MAX } from '@/timeline/eras'
import { eraDate, dosDate, formatClock } from '@/lib/clock'
import { lookAt, perspective, multiply, transform } from '@/lib/mat4'
import { LAKE_SVG, ridgeHeight, RIDGES, W, HORIZON, SUN } from '@/lib/landscape'
import { BOOT_SCRIPT } from '@/timeline/boot'

let pass = 0
const ok = (name: string, fn: () => void | Promise<void>) => Promise.resolve().then(fn).then(() => { pass++; }, (e) => { console.log('FAIL', name, '\n ', e.message); process.exitCode = 1 })
const text = (t: Terminal) => t.screen.text()

await ok('boot screen is deterministic and fits 25 rows', () => {
  const a = new Terminal().boot(), b = new Terminal().boot()
  assert.equal(text(a), text(b))
  assert.match(text(a), /MS-DOS\(R\) Version 3\.30/)
  assert.match(text(a), /C:\\>$/)
  assert.equal(screenToHtml(a.screen), screenToHtml(b.screen))
})

// A host with a real note and messages, and a fake photo.
const world = { note: 'call mom back\nwater the plant', wifi: true, read: new Set<string>(), went: 0 }
const msgs = [
  { id: 'mom', from: 'Mom', subject: 'Did you eat?', body: 'Just checking. Did you eat something today? Call me when you can.', get read() { return world.read.has('mom') } },
  { id: 'alex', from: 'Alex', subject: 'Practice moved to 7', body: 'Garage.', get read() { return world.read.has('alex') } },
]
const host: DosHost = {
  note: () => world.note, setNote: (s) => { world.note = s }, messages: () => msgs, markRead: (id) => world.read.add(id),
  online: () => world.wifi, startWindows: () => { world.went++ }, beep: () => {},
  photo: async () => { const d = new Uint8ClampedArray(80 * 44 * 4); for (let i = 0; i < d.length; i += 4) { d[i] = (i / 4) % 80 * 3; d[i + 1] = 90; d[i + 2] = 200; d[i + 3] = 255 } return { width: 80, height: 44, data: d } as unknown as ImageData },
}
const run = async (t: Terminal, cmd: string) => { t.type(cmd); await t.enter(); return text(t) }

await ok('HELP, DIR, TYPE NOTES.TXT', async () => {
  const t = new Terminal(host).boot()
  assert.match(await run(t, 'help'), /VIEW\s+Displays a picture/)
  const dir = await run(t, 'DIR')
  assert.match(dir, new RegExp(`NOTES\\s+TXT\\s+${world.note.replace(/\n/g, '\r\n').length}`))
  assert.match(dir, /8 File\(s\)/)
  const t2 = new Terminal(host).boot()
  assert.match(await run(t2, 'type notes.txt'), /call mom back\nwater the plant\n\nC:\\>$/)
})

await ok('ECHO >> appends, > replaces, prompt follows directly', async () => {
  const t = new Terminal(host).boot()
  const out = await run(t, 'ECHO buy milk >> NOTES.TXT')
  assert.equal(world.note, 'call mom back\nwater the plant\nbuy milk')
  assert.match(out, /ECHO buy milk >> NOTES\.TXT\nC:\\>$/)
  await run(t, 'echo only this > notes.txt')
  assert.equal(world.note, 'only this')
  world.note = 'call mom back\nwater the plant'
  assert.match(await run(t, 'echo hello'), /echo hello\nhello\n\nC:\\>$/)
  assert.match(await run(t, 'echo x > AUTOEXEC.BAT'), /Access denied/)
})

await ok('bare Enter, unknown command, CLS', async () => {
  const t = new Terminal(host).boot()
  assert.match(await run(t, ''), /C:\\>\nC:\\>$/)
  assert.match(await run(t, 'frobnicate'), /Bad command or file name\n\nC:\\>$/)
  await run(t, 'cls')
  assert.equal(text(t), 'C:\\>')
  assert.equal(t.screen.cy, 0)
})

await ok('MAIL lists, MAIL 1 reads and marks read, offline says NO CARRIER', async () => {
  const t = new Terminal(host).boot()
  const list = await run(t, 'mail')
  assert.match(list, /1\s+Mom\s+\*Did you eat\?/)
  assert.match(await run(t, 'mail 1'), /Subject: Did you eat\?/)
  assert.ok(world.read.has('mom'))
  world.wifi = false
  assert.match(await run(t, 'MAIL'), /NO CARRIER/)
  world.wifi = true
})

await ok('VIEW LAKE.PCX draws 22 rows of half-blocks and keeps the prompt on screen', async () => {
  const t = new Terminal(host).boot()
  await run(t, 'VIEW LAKE.PCX')
  let rows = 0
  for (let y = 0; y < ROWS; y++) if (t.screen.ch[y * COLS] === HALF_BLOCK) rows++
  assert.equal(rows, 22)
  assert.match(text(t), /LAKE\.PCX {2}320x200, 16 colours\.  Sunset, July 1986\.\n\nC:\\>$/)
  assert.ok(t.lastOutput.includes('LAKE.PCX'))
})

await ok('WIN asks the host to scroll; scripted() never mutates the real screen', async () => {
  const t = new Terminal(host).boot()
  const before = text(t)
  const a = t.scripted(0.35).text(), b = t.scripted(0.72).text(), c = t.scripted(0.9).text()
  assert.match(a, /C:\\>WI$/); assert.match(b, /C:\\>WIN\nStarting Windows\.\.\.$/); assert.equal(c, '')
  assert.equal(text(t), before)
  await run(t, 'win')
  assert.equal(world.went, 1)
})

await ok('history and line limit', async () => {
  const t = new Terminal(host).boot()
  await run(t, 'ver')
  t.historyStep(-1)
  assert.equal(t.line, 'ver')
  t.clearLine()
  t.type('x'.repeat(200))
  assert.equal(t.line.length, COLS - 5)
})

await ok('minesweeper: first click safe, 10 mines, flood fill, win detection (2000 games)', () => {
  let rnd = 1
  const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647)
  for (let g = 0; g < 2000; g++) {
    const b = MS.newBoard()
    const first = Math.floor(rand() * 81)
    MS.plant(b, first, rand)
    assert.equal(b.filter(MS.isMine).length, MS.MINES)
    for (const n of [first, ...MS.neighbours(first)]) assert.ok(!MS.isMine(b[n]))
    assert.equal(MS.reveal(b, first), false)
    assert.equal(MS.count(b[first]), 0)
    assert.ok(b.filter(MS.isOpen).length >= 1 + MS.neighbours(first).length)
    // counts are right
    for (let i = 0; i < 81; i++) assert.equal(MS.count(b[i]), MS.neighbours(i).filter((j) => MS.isMine(b[j])).length)
    // open every safe cell → won
    for (let i = 0; i < 81; i++) if (!MS.isMine(b[i])) assert.equal(MS.reveal(b, i), false)
    assert.ok(MS.hasWon(b))
  }
  // chord with correct flags opens neighbours; with a wrong flag it can detonate
  const b = MS.newBoard(); MS.plant(b, 40, () => 0.5); MS.reveal(b, 40)
  const num = b.findIndex((c) => MS.isOpen(c) && MS.count(c) > 0)
  for (const n of MS.neighbours(num)) if (MS.isMine(b[n])) MS.toggleFlag(b, n)
  assert.equal(MS.chord(b, num), false)
  for (const n of MS.neighbours(num)) assert.ok(MS.isOpen(b[n]) || MS.isFlag(b[n]))
})

await ok('year counter: holds on dwells, reaches each era, CSS twin is well-formed', () => {
  for (const e of ERAS) assert.equal(yearAt((e.dwell[0] + e.dwell[1]) / 2), e.year, e.id)
  assert.equal(yearAt(0), 1980); assert.equal(yearAt(T_MAX), 2040)
  const css = yearCalc()
  assert.equal((css.match(/\(/g) ?? []).length, (css.match(/\)/g) ?? []).length)
  assert.ok(!/NaN|undefined/.test(css))
  // Every dwell window sits inside its layer's live window.
  for (const e of ERAS) assert.ok(LIVE[e.id][0] < e.dwell[0] && LIVE[e.id][1] > e.dwell[1], e.id)
})

await ok('era dates carry the right weekday', () => {
  const now = new Date(2026, 8, 27, 21, 4, 5)
  assert.equal(eraDate(1980, now).getDay(), 6) // 27 Sep 1980: Saturday
  assert.equal(eraDate(1995, now).getDay(), 3) // Wednesday
  assert.equal(dosDate(now), 'Sat 09-27-1980')
  assert.equal(formatClock('win-date', now), 'Wednesday, September 27, 1995')
  assert.equal(formatClock('hud-date', now), '2040.09.27')
  assert.equal(eraDate(1981, new Date(2028, 1, 29)).getDate(), 28) // Feb 29 in a non-leap year
})

await ok('NEXUS intents', () => {
  const ctx = { note: 'call mom back\nwater the plant', messages: [{ from: 'Mom', subject: 'Did you eat?', read: false }], wifi: true, now: new Date(2026, 8, 27, 9, 5) }
  assert.equal(respond('remember to buy milk', ctx).action, 'append-note')
  assert.equal(respond('remember to buy milk', ctx).payload, 'buy milk')
  assert.match(respond('read my note', ctx).text, /2 items\. First: “call mom back”\. It has been at the top since 1980/)
  assert.equal(respond('call mom', ctx).action, 'open-call')
  assert.equal(respond('show me the lake', ctx).action, 'pulse')
  assert.equal(respond('go back to 1980', ctx).action, 'go-1980')
  assert.match(respond('what time is it?', ctx).text, /^09:05/)
  assert.match(respond('messages', { ...ctx, wifi: false }).text, /reconnect/)
  assert.equal(respond('reconnect', { ...ctx, wifi: false }).action, 'toggle-wifi')
  assert.match(respond('help', ctx).text, /remember buy milk/)
  assert.match(respond('xyzzy', ctx).text, /very small future/)
})

await ok('lake SVG: sun sits in the far range\'s valley, markup balanced', () => {
  const peakNearSun = ridgeHeight(0, SUN.x)
  const peakElsewhere = Math.max(...[40, 80, 120, 280].map((x) => ridgeHeight(0, x)))
  assert.ok(peakNearSun < peakElsewhere * 0.75, `${peakNearSun} vs ${peakElsewhere}`)
  assert.ok(HORIZON - peakNearSun < SUN.y + SUN.r, 'sun should be partly behind the ridge or just above it')
  for (let i = 0; i < RIDGES.length; i++) for (let x = 0; x <= W; x += 4) { const h = ridgeHeight(i, x); assert.ok(h >= 0 && h <= RIDGES[i].amp * (i === 2 ? 1.46 : 1.01), `ridge ${i} x ${x} h ${h}`) }
  const open = LAKE_SVG.match(/<(?!\/)[a-zA-Z]+[^>]*[^/]>/g)?.length ?? 0
  const close = LAKE_SVG.match(/<\/[a-zA-Z]+>/g)?.length ?? 0
  assert.equal(open, close, 'every non-self-closing tag is closed')
  assert.ok(!/NaN|undefined/.test(LAKE_SVG))
})

await ok('hologram scene: no NaN, sane bounds, framed by the camera at 16:9 and 9:16', () => {
  const s = buildScene()
  assert.ok(s.count > 30000 && s.count < 90000, String(s.count))
  for (const v of s.base) assert.ok(Number.isFinite(v))
  const kinds = new Map<number, number>()
  for (let i = 0; i < s.count; i++) kinds.set(s.color[i * 4 + 3], (kinds.get(s.color[i * 4 + 3]) ?? 0) + 1)
  const report: string[] = [`count ${s.count}`, `kinds ${[...kinds].map(([k, n]) => `${Object.keys(KIND)[k]}:${n}`).join(' ')}`]
  for (const aspect of [16 / 9, 9 / 16]) {
    const { view } = lookAt(eyeFor(aspect, 0), TARGET)
    const vp = multiply(perspective(CAMERA.fov, aspect, 0.05, 20), view)
    const c = transform(vp, ...TARGET)
    assert.ok(Math.abs(c[0] / c[3]) < 1e-5 && Math.abs(c[1] / c[3]) < 1e-5, 'target projects to centre')
    let inside = 0, solid = 0, minX = 9, maxX = -9, minY = 9, maxY = -9
    const out = new Float32Array(4)
    for (let i = 0; i < s.count; i++) {
      if (s.color[i * 4 + 3] !== KIND.solid) continue
      solid++
      transform(vp, s.base[i * 4], s.base[i * 4 + 1], s.base[i * 4 + 2], out)
      const x = out[0] / out[3], y = out[1] / out[3]
      if (out[3] > 0 && Math.abs(x) <= 1 && Math.abs(y) <= 1) inside++
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    }
    report.push(`aspect ${aspect.toFixed(2)}: ${((inside / solid) * 100).toFixed(1)}% of solid points on screen, ndc x ${minX.toFixed(2)}…${maxX.toFixed(2)} y ${minY.toFixed(2)}…${maxY.toFixed(2)}`)
    assert.ok(inside / solid > (aspect > 1 ? 0.9 : 0.6), report.at(-1))
  }
  console.log('  ' + report.join('\n  '))
})

await ok('boot script: data-live, --t fallback and go(), with and without native timelines', () => {
  for (const native of [false, true]) {
    const vh = 800
    const trackH = 7 * 1.2 * vh + vh
    const attrs: Record<string, string> = {}
    const props: Record<string, string> = {}
    const listeners: Record<string, () => void> = {}
    const raf: (() => void)[] = []
    const win: any = {
      scrollY: 0,
      innerHeight: vh,
      CSS: { supports: (p: string, v: string) => native && p === 'animation-timeline' && v === 'view()' },
      requestAnimationFrame: (f: () => void) => raf.push(f),
      addEventListener: (k: string, f: () => void) => (listeners[k] = f),
      scrollTo: ({ top }: { top: number }) => (win.scrollY = top),
    }
    const stage = { setAttribute: (k: string, v: string) => (attrs[k] = v), style: { setProperty: (k: string, v: string) => (props[k] = v) } }
    const track = { offsetHeight: trackH, getBoundingClientRect: () => ({ top: -win.scrollY }) }
    const doc = { getElementById: (id: string) => ({ track, stage })[id as 'track'], documentElement: { classList: { add: (c: string) => (attrs.html = c) } } }
    new Function('window', 'document', 'CSS', 'requestAnimationFrame', 'addEventListener', BOOT_SCRIPT)(win, doc, win.CSS, win.requestAnimationFrame, win.addEventListener)
    const flush = () => raf.splice(0).forEach((f) => f())
    const at = (t: number) => {
      win.scrollY = (t / T_MAX) * (trackH - vh)
      listeners.scroll()
      flush()
    }
    assert.equal(attrs.html, native ? 'sda' : 'no-sda')
    at(1); assert.equal(attrs['data-live'], 'dos')
    at(2.3); assert.equal(attrs['data-live'], 'win95')
    at(2.8); assert.equal(attrs['data-live'], 'win95 web2')
    at(5.3); assert.equal(attrs['data-live'], 'glass')
    at(6.95); assert.equal(attrs['data-live'], 'scifi outro')
    at(0); assert.equal(attrs['data-live'], 'intro')
    assert.equal(props['--t'], native ? undefined : '0.0000')
    win.__eou.go(4.3)
    listeners.scroll()
    flush()
    assert.ok(Math.abs(win.__eou.t - 4.3) < 1e-9)
    assert.equal(attrs['data-live'], 'material')
  }
})

console.log(`${pass} groups passed`)
