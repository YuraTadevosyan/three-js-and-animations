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
import { buildScene, TARGET, KIND, CAMERA, eyeFor, ART_SLOTS, photoToWorld, writeArt } from '@/eras/scifi/scene'
import { Snake, FIELD_W, FIELD_H } from '@/eras/dos/snake'
import { Editor, EDIT_COLS } from '@/eras/dos/editor'
import { BARS, CHORDS, CHORD_NOTES, LEAD, SONG_SECONDS, TOTAL_STEPS, barLengths, midiToHz, nameToMidi, toMML } from '@/lib/song'
import { eraAt, playSong, setSound, sfx, songPlaying, songPosition, stopSong, type Sfx } from '@/lib/audio'
import { respond } from '@/eras/scifi/assistant'
import { yearAt, yearCalc, ERAS, LIVE, T_MAX } from '@/timeline/eras'
import { eraDate, dosDate, formatClock } from '@/lib/clock'
import { lookAt, perspective, multiply, transform } from '@/lib/mat4'
import { LAKE_SVG, ridgeHeight, RIDGES, W, HORIZON, SUN } from '@/lib/landscape'
import { BOOT_SCRIPT } from '@/timeline/boot'
import { ERA_TECH, TECH } from '@/components/about-data'

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
const world = { note: 'call mom back\nwater the plant', wifi: true, read: new Set<string>(), went: 0, playing: false, beeps: 0, blips: [] as string[] }
const msgs = [
  { id: 'mom', from: 'Mom', subject: 'Did you eat?', body: 'Just checking. Did you eat something today? Call me when you can.', get read() { return world.read.has('mom') } },
  { id: 'alex', from: 'Alex', subject: 'Practice moved to 7', body: 'Garage.', get read() { return world.read.has('alex') } },
]
const host: DosHost = {
  note: () => world.note, setNote: (s) => { world.note = s }, messages: () => msgs, markRead: (id) => world.read.add(id),
  online: () => world.wifi, startWindows: () => { world.went++ }, beep: () => { world.beeps++ },
  blip: (k) => { world.blips.push(k) }, song: (on) => { world.playing = on }, songPlaying: () => world.playing,
  photo: async () => { const d = new Uint8ClampedArray(80 * 44 * 4); for (let i = 0; i < d.length; i += 4) { d[i] = (i / 4) % 80 * 3; d[i + 1] = 90; d[i + 2] = 200; d[i + 3] = 255 } return { width: 80, height: 44, data: d } as unknown as ImageData },
}
const run = async (t: Terminal, cmd: string) => { t.type(cmd); await t.enter(); return text(t) }

await ok('HELP, DIR, TYPE NOTES.TXT', async () => {
  const t = new Terminal(host).boot()
  assert.match(await run(t, 'help'), /VIEW\s+Displays a picture/)
  const dir = await run(t, 'DIR')
  assert.match(dir, new RegExp(`NOTES\\s+TXT\\s+${world.note.replace(/\n/g, '\r\n').length}`))
  assert.match(dir, /10 File\(s\)/)
  assert.match(dir, /SONG\s+MUS/)
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
  assert.equal(respond('play the song', ctx).action, 'play-song')
  assert.equal(respond('stop', { ...ctx, playing: true }).action, 'stop-song')
  assert.equal(respond('stop', ctx).action, undefined)
  assert.match(respond('show me the lake', { ...ctx, painted: true }).text, /what you painted on it in 1995/)
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
  assert.equal(s.color[(s.count - 1) * 4 + 3], KIND.paint)
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

await ok('boot screen still fits with the SONG.MUS line, prompt on screen', () => {
  const t = new Terminal().boot()
  assert.match(text(t), /SONG\.MUS\s+one tune, six decades\s+PLAY SONG\.MUS/)
  assert.ok(t.screen.cy < ROWS - 4, `prompt row ${t.screen.cy}`)
})

await ok('EDIT: full-screen editor saves live, Esc restores the screen exactly', async () => {
  world.note = 'call mom back\nwater the plant'
  const t = new Terminal(host).boot()
  const before = text(t)
  t.type('edit notes.txt')
  await t.enter()
  assert.equal(t.mode, 'edit')
  assert.match(text(t), /File {2}Edit {2}Search {2}Options/)
  assert.match(text(t), /NOTES\.TXT/)
  assert.match(text(t), /Ln 2, Col 16/) // cursor starts at the end
  assert.equal(t.key('Enter'), true)
  t.type('buy milk')
  assert.equal(world.note, 'call mom back\nwater the plant\nbuy milk') // already saved
  t.key('Backspace')
  assert.equal(world.note, 'call mom back\nwater the plant\nbuy mil')
  t.key('ArrowUp'); t.key('Home'); t.type('> ')
  assert.equal(world.note, 'call mom back\n> water the plant\nbuy mil')
  assert.equal(t.key('F5'), false) // unknown keys fall through to the browser
  let announced = 0
  t.onOutput = () => announced++
  assert.equal(t.key('Escape'), true)
  assert.equal(t.mode, 'prompt')
  assert.equal(announced, 1)
  assert.match(text(t), /C:\\>edit notes\.txt\n\nC:\\>$/)
  assert.ok(text(t).startsWith(before.split('\n')[0]))
  // and typing goes to the prompt again
  t.type('ver'); assert.equal(t.line, 'ver')
  // only the note is editable
  const t2 = new Terminal(host).boot()
  assert.match(await run(t2, 'EDIT CONFIG.SYS'), /Access denied/)
  assert.equal(t2.mode, 'prompt')
  world.note = 'call mom back\nwater the plant'
})

await ok('Editor: joins, splits and refuses overlong lines', () => {
  const e = new Editor('ab\ncd')
  e.move(0, -1); e.end(); e.del() // join "cd" up
  assert.equal(e.text(), 'abcd')
  e.home(); e.move(1, 0); e.newline()
  assert.equal(e.text(), 'a\nbcd')
  e.backspace()
  assert.equal(e.text(), 'abcd')
  const long = new Editor('x'.repeat(EDIT_COLS))
  assert.equal(long.insert('y'), false)
  assert.equal(long.text().length, EDIT_COLS)
})

await ok('SNAKE: moves, turns, eats, grows, dies on the wall, and quits cleanly', async () => {
  const g = new Snake(() => 0)
  const head0 = g.body[0]
  assert.equal(g.tick(), 'move'); assert.equal(g.body[0], head0 + 1); assert.equal(g.body.length, 4)
  g.turn(-1, 0) // reversing is ignored
  assert.equal(g.tick(), 'move'); assert.equal(g.body[0], head0 + 2)
  g.turn(0, 1); g.turn(1, 0) // two quick turns both count
  g.tick(); assert.equal(g.body[0], head0 + 2 + FIELD_W)
  g.tick(); assert.equal(g.body[0], head0 + 3 + FIELD_W)
  g.food = g.body[0] + 1
  assert.equal(g.tick(), 'ate'); assert.equal(g.score, 1); assert.equal(g.body.length, 5)
  assert.ok(!g.body.includes(g.food), 'new food is never under the snake')
  let ev = 'move'
  for (let k = 0; k < FIELD_W && ev !== 'died'; k++) { if (g.food === g.body[0] + 1) g.food = 0; ev = g.tick() }
  assert.equal(ev, 'died'); assert.ok(g.dead); assert.equal(g.best, 1)
  assert.equal(g.tick(), 'idle')
  assert.ok(FIELD_H > 10)

  const t = new Terminal(host).boot()
  const before = text(t)
  await run(t, 'snake')
  assert.equal(t.mode, 'snake')
  assert.match(text(t), /SNAKE\.BAS\s+Score 0/)
  const v = t.version
  t.tick(); assert.ok(t.version > v)
  t.type('s') // WASD steers
  assert.equal(t.key('ArrowDown'), true)
  t.key('Escape')
  assert.equal(t.mode, 'prompt')
  assert.ok(text(t).startsWith(before.split('\n')[0]))
  t.tick() // harmless outside the game
})

await ok('PLAY / STOP drive the host; TYPE SONG.MUS prints a PLAY string', async () => {
  const t = new Terminal(host).boot()
  assert.match(await run(t, 'play song.mus'), /Playing SONG\.MUS on the PC speaker: "Call Me Back" by The Good Cables/)
  assert.equal(world.playing, true)
  await run(t, 'STOP')
  assert.equal(world.playing, false)
  assert.match(await run(t, 'stop'), /Nothing is playing/)
  assert.match(await run(t, 'PLAY LAKE.PCX'), /File not found/)
  await run(t, 'cls')
  assert.match(await run(t, 'type song.mus'), /PLAY "T108 O5 E8 G8 E4 D8 C8 D4/)
})

await ok('the song: every bar is 8 eighths, notes are sane, chords are defined', () => {
  assert.deepEqual(barLengths(), new Array(BARS).fill(8))
  assert.equal(TOTAL_STEPS, 128)
  assert.ok(Math.abs(SONG_SECONDS - 128 * (60 / 108 / 2)) < 1e-9)
  assert.equal(nameToMidi('A4'), 69); assert.ok(Math.abs(midiToHz(69) - 440) < 1e-9)
  for (const n of LEAD) { assert.ok(n.midi >= 60 && n.midi <= 84, String(n.midi)); assert.ok(n.step + n.len <= TOTAL_STEPS) }
  for (let i = 1; i < LEAD.length; i++) assert.ok(LEAD[i].step >= LEAD[i - 1].step + LEAD[i - 1].len, 'melody is monophonic')
  for (const c of CHORDS) assert.ok(CHORD_NOTES[c])
  const mml = toMML()
  assert.ok(/^T108( (O\d|[A-G]#?\d\.?|P\d\.?))+$/.test(mml), mml)
  // one instrument set per era, switching inside each transition
  assert.deepEqual([0, 1, 2.3, 3.3, 4.3, 5.3, 6.3, 7].map(eraAt), ['dos', 'dos', 'win95', 'web2', 'material', 'glass', 'scifi', 'scifi'])
})

await ok('paint → hologram: pixels land on the surface they were painted on', () => {
  const s = buildScene()
  const first = s.count - ART_SLOTS
  for (let i = first; i < s.count; i++) assert.equal(s.base[i * 4 + 3], 0, 'paint slots start empty')
  // water: on the lake plane, nearer as you go down the photo
  const [, wy, wz1] = photoToWorld(160, 130)
  const [, , wz2] = photoToWorld(160, 190)
  assert.ok(wy < 0.01 && wz2 > wz1)
  // a pixel on the near range lies on that range's near slope, above the water
  const onNear = photoToWorld(30, 110)
  assert.ok(onNear[1] > 0.05 && onNear[2] > -0.85 && onNear[2] < -0.5, String(onNear))
  // sky: behind everything, and continuous with the far ridgeline below it
  const top = Math.ceil(122 - ridgeHeight(0, 100))
  const sky = photoToWorld(100, top - 1), ridge = photoToWorld(100, top + 0.5)
  assert.equal(sky[2], -2.5)
  assert.ok(Math.abs(sky[1] - ridge[1]) < 0.06, `${sky[1]} vs ${ridge[1]}`)
  assert.ok(photoToWorld(100, 0)[1] < 1.6, 'top of the photo stays in view')
  for (let py = 0; py < 200; py += 7) for (let px = 0; px < 320; px += 11) for (const v of photoToWorld(px, py)) assert.ok(Number.isFinite(v))

  // a red stroke of 50 pixels, then far too much paint, then none
  const img = { width: 160, height: 100, data: new Uint8ClampedArray(160 * 100 * 4) }
  for (let x = 40; x < 90; x++) img.data.set([255, 0, 0, 255], (70 * 160 + x) * 4)
  assert.equal(writeArt(s, img), 50)
  assert.equal(s.color[first * 4], 1); assert.equal(s.color[first * 4 + 3], KIND.paint); assert.ok(s.base[first * 4 + 3] > 0)
  for (let i = 0; i < 160 * 100; i++) img.data[i * 4 + 3] = 255
  const used = writeArt(s, img)
  assert.ok(used <= ART_SLOTS && used > ART_SLOTS * 0.6, String(used))
  assert.equal(writeArt(s, null), 0)
  for (let i = first; i < s.count; i++) assert.equal(s.base[i * 4 + 3], 0)
})

await ok('audio engine: all six arrangements, every sfx and sting run on a strict fake AudioContext', () => {
  // A Web Audio stand-in that records nothing but refuses anything a real
  // context would reject (or turn into silence): non-finite numbers,
  // non-positive exponential targets, negative times, unknown methods.
  let made = 0
  const bad = (what: string, v: unknown): never => { throw new Error(`audio: ${what} = ${String(v)}`) }
  const num = (what: string, v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : bad(what, v))
  const param = () => {
    const p = {
      _v: 0,
      get value() { return p._v },
      set value(v: number) { p._v = num('param.value', v) },
      setValueAtTime: (v: number, t: number) => { num('value', v); if (num('time', t) < 0) bad('time', t) },
      linearRampToValueAtTime: (v: number, t: number) => { num('value', v); num('time', t) },
      exponentialRampToValueAtTime: (v: number, t: number) => { if (num('value', v) <= 0) bad('exponential target', v); num('time', t) },
      setTargetAtTime: (v: number, t: number, c: number) => { num('value', v); num('time', t); if (num('timeConstant', c) <= 0) bad('timeConstant', c) },
    }
    return p
  }
  const node = (extra: Record<string, unknown> = {}) => {
    made++
    const n: Record<string, unknown> = {
      connect: (dest: unknown) => { if (dest == null) bad('connect target', dest); return dest },
      start: (t = 0, off = 0) => { num('start', t); if (num('offset', off) < 0) bad('offset', off) },
      stop: (t = 0) => num('stop', t),
      ...extra,
    }
    return n
  }
  class FakeContext {
    currentTime = 0
    sampleRate = 8000
    destination = node()
    resume = async () => {}
    createGain = () => node({ gain: param() })
    createOscillator = () => node({ frequency: param(), detune: param(), type: 'sine' })
    createBiquadFilter = () => node({ frequency: param(), Q: param(), type: 'lowpass' })
    createDynamicsCompressor = () => node({ threshold: param(), ratio: param() })
    createConvolver = () => node({ buffer: null })
    createDelay = () => node({ delayTime: param() })
    createBufferSource = () => node({ buffer: null })
    createBuffer = (ch: number, len: number) => ({ getChannelData: () => new Float32Array(num('buffer length', len) * (ch > 0 ? 1 : 0)) })
  }
  let ctx!: FakeContext
  const pumps: (() => void)[] = []
  const timeouts: (() => void)[] = []
  const subs: ((t: number) => void)[] = []
  const eou = { t: 1, native: true, go() {}, on(fn: (t: number) => void) { subs.push(fn); fn(eou.t); return () => {} } }
  ;(globalThis as any).window = {
    AudioContext: class extends FakeContext { constructor() { super(); ctx = this } },
    setInterval: (fn: () => void) => pumps.push(fn),
    clearInterval: () => {},
    setTimeout: (fn: () => void) => timeouts.push(fn),
    clearTimeout: () => {},
    __eou: eou,
  }
  try {
    sfx('dos-beep') // before sound is on: a no-op, not a crash
    setSound(true)
    const perEra: Record<string, number> = {}
    for (const t of [1, 2.3, 3.3, 4.3, 5.3, 6.3]) {
      eou.t = t
      const before = made
      playSong()
      assert.ok(songPlaying())
      // Walk the clock across the whole loop, pumping the scheduler as the interval would.
      for (let k = 0; k < Math.ceil(SONG_SECONDS / 0.03) + 10; k++) { ctx.currentTime += 0.03; pumps.at(-1)!() }
      assert.ok(songPosition() >= 0 && songPosition() < SONG_SECONDS)
      stopSong()
      perEra[eraAt(t)] = made - before
    }
    assert.equal(songPlaying(), false)
    // One square wave is the cheapest arrangement; a four-piece band the busiest.
    assert.ok(perEra.dos > 100 && perEra.dos < perEra.material && perEra.material < perEra.web2, JSON.stringify(perEra))
    for (const [era, v] of Object.entries(perEra)) assert.ok(v > (era === 'dos' ? 100 : 300), `${era}: ${v}`)

    const names: Sfx[] = ['dos-key', 'dos-beep', 'dos-eat', 'dos-die', 'w95-click', 'w95-ding', 'w95-chord', 'w95-boom', 'w95-tada', 'w95-shutdown', 'w2-pop', 'md-tap', 'md-snack', 'gl-tick', 'gl-chime', 'sf-blip', 'sf-reply']
    for (const n of names) { const before = made; sfx(n); assert.ok(made > before, n) }

    // Arriving in each era (and staying) plays its sting; 2040 also starts the drone.
    for (const t of [1, 2.3, 3.3, 4.3, 5.3, 6.3]) {
      eou.t = 0.1; subs.forEach((f) => f(0.1))
      eou.t = t; subs.forEach((f) => f(t))
      const before = made
      timeouts.splice(0).forEach((f) => f())
      assert.ok(made > before, `sting at t=${t}`)
    }
    // Scrolling straight through must not fire a sting for an era you've left.
    eou.t = 0.1; subs.forEach((f) => f(0.1))
    eou.t = 2.3; subs.forEach((f) => f(2.3))
    eou.t = 3.3; subs.forEach((f) => f(3.3))
    const before = made
    timeouts.splice(0, 1).forEach((f) => f()) // the stale Windows timer
    assert.equal(made, before)

    setSound(false)
    const quiet = made
    sfx('w95-ding')
    assert.equal(made, quiet, 'muted means no nodes at all')
  } finally {
    delete (globalThis as any).window
  }
})

await ok('About: every technology has a link, a role, and a version wherever it is an npm package', () => {
  const names = new Set<string>()
  for (const g of TECH) {
    assert.ok(g.items.length > 0, g.title)
    for (const t of g.items) {
      assert.match(t.href, /^https:\/\//, t.name)
      assert.ok(t.role.length > 20, t.name)
      assert.ok(!names.has(t.name), `duplicate ${t.name}`)
      names.add(t.name)
      if (t.version !== undefined) assert.match(t.version, /^\d+\.\d+$/, `${t.name}: ${t.version}`)
    }
  }
  const qwik = TECH.flatMap((g) => g.items).find((t) => t.name === 'Qwik')
  assert.equal(qwik?.version, '1.20')
  assert.deepEqual(ERA_TECH.map((e) => e.year), ERAS.map((e) => e.year))
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
