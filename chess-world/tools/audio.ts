/**
 * Asserts the *shape* of the synthesised audio.
 *
 * The goal is a wooden chess board: every sound should be a percussive strike
 * that attacks in under a millisecond and rings briefly, heavier pieces should
 * speak lower and longer than lighter ones, and a capture should be two
 * separate contacts rather than one. None of that can be heard from here, but
 * all of it can be measured.
 *
 *     npm run check:audio
 */
import { Sound } from '../app/world/sound'
import { installFakeAudio, type Voice } from './fake-audio'

const recorder = installFakeAudio()
let failures = 0

function check(label: string, condition: boolean, detail = ''): void {
  if (!condition) failures++
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`)
}

const sound = new Sound()
sound.resume()

function record(play: () => void): Voice[] {
  recorder.reset()
  play()
  return recorder.voices
}

/** Time from the envelope's first point to its peak. */
function attackOf(voice: Voice): number {
  if (voice.envelope.length < 2) return 0
  let peak = voice.envelope[0]!
  for (const point of voice.envelope) if (point.value > peak.value) peak = point
  return peak.time - voice.envelope[0]!.time
}

/**
 * Audible length: where the envelope finishes, not where the node is stopped —
 * every voice is stopped a little after its envelope closes, and counting that
 * padding would make a 12ms tick look like a 60ms one.
 */
const durationOf = (voice: Voice): number => {
  const last = voice.envelope[voice.envelope.length - 1]
  return (last ? last.time : voice.stop) - voice.start
}
const tones = (voices: Voice[]): Voice[] => voices.filter((v) => v.kind === 'tone')
const lowest = (voices: Voice[]): number => Math.min(...tones(voices).map((v) => v.frequency))
const longest = (voices: Voice[]): number => Math.max(...voices.map(durationOf))

/* ---- a placement is a strike, not a tone ------------------------------- */

const pawn = record(() => sound.impact(1, 1))
check('placing a piece makes a sound at all', pawn.length > 0, `${pawn.length} voices`)
check('it has a contact noise transient', pawn.some((v) => v.kind === 'noise'))
check('it has a ringing body', tones(pawn).length >= 3, `${tones(pawn).length} partials`)
check(
  'every voice attacks in under 2ms',
  pawn.every((v) => attackOf(v) < 0.002),
  `slowest ${(Math.max(...pawn.map(attackOf)) * 1000).toFixed(2)}ms`,
)
check('nothing rings for more than 400ms', longest(pawn) < 0.4, `${(longest(pawn) * 1000).toFixed(0)}ms`)
check(
  'the contact tick is far shorter than the body',
  Math.max(...pawn.filter((v) => v.kind === 'noise').map(durationOf)) < 0.06,
)

/* ---- heavier pieces speak lower and longer ----------------------------- */

const byPiece = [1, 2, 3, 4, 5, 6].map((type) => ({ type, voices: record(() => sound.impact(1, type)) }))

// Each strike is deliberately detuned a few percent, so a single sample says
// nothing about the voicing. Averaging a couple of dozen cancels that out.
const fundamentals = [1, 2, 3, 4, 5, 6].map((type) => {
  let total = 0
  const runs = 24
  for (let i = 0; i < runs; i++) total += lowest(record(() => sound.impact(1, type)))
  return total / runs
})
let descending = true
for (let i = 1; i < fundamentals.length; i++) {
  if (fundamentals[i]! >= fundamentals[i - 1]!) descending = false
}
check(
  'pawn → king voices fall in pitch',
  descending,
  fundamentals.map((f) => `${Math.round(f)}Hz`).join(' > '),
)
check(
  'the king rings longer than the pawn',
  longest(byPiece[5]!.voices) > longest(byPiece[0]!.voices),
  `${(longest(byPiece[5]!.voices) * 1000).toFixed(0)}ms vs ${(longest(byPiece[0]!.voices) * 1000).toFixed(0)}ms`,
)
check(
  'every fundamental sits in a woody range',
  fundamentals.every((f) => f > 80 && f < 700),
  fundamentals.map((f) => Math.round(f)).join(', '),
)

/* ---- a capture is two objects meeting, then one landing ---------------- */

const capture = record(() => sound.capture(5, 2))
const captureClusters = recorder.clusters(0.03).length
check('a capture is more than one contact', captureClusters >= 3, `${captureClusters} contacts`)
const captureStarts = [...new Set(capture.map((v) => Number(v.start.toFixed(3))))].sort((a, b) => a - b)
check(
  'the contacts are spaced like a knock then a placement',
  captureStarts.length >= 3 && captureStarts[captureStarts.length - 1]! - captureStarts[0]! > 0.08,
  captureStarts.map((t) => `${Math.round(t * 1000)}ms`).join(' → '),
)

/* ---- check is a double knock ------------------------------------------- */

const check2 = record(() => sound.check())
const knockTimes = [...new Set(check2.map((v) => Number(v.start.toFixed(3))))].sort((a, b) => a - b)
check('check knocks twice', knockTimes.length === 2, knockTimes.map((t) => `${Math.round(t * 1000)}ms`).join(', '))
check(
  'the two knocks are 80–160ms apart',
  knockTimes.length === 2 && knockTimes[1]! - knockTimes[0]! > 0.08 && knockTimes[1]! - knockTimes[0]! < 0.16,
)

/* ---- mate is a king rolling over --------------------------------------- */

const mate = record(() => sound.mate())
const rollTimes = [...new Set(mate.filter((v) => v.kind === 'tone').map((v) => Number(v.start.toFixed(3))))].sort(
  (a, b) => a - b,
)
check('the king topples in several contacts', rollTimes.length >= 5, `${rollTimes.length} contacts`)
let closing = true
for (let i = 2; i < rollTimes.length - 1; i++) {
  if (rollTimes[i]! - rollTimes[i - 1]! > rollTimes[i - 1]! - rollTimes[i - 2]! + 1e-6) closing = false
}
check('the contacts get closer together as it settles', closing,
  rollTimes.map((t) => Math.round(t * 1000)).join(', '))

/* ---- nothing drones ----------------------------------------------------- */

const everything: { name: string; voices: Voice[] }[] = [
  { name: 'step', voices: record(() => sound.step('white', 1)) },
  { name: 'slide', voices: record(() => sound.slide('white', 4)) },
  { name: 'leap', voices: record(() => sound.leap('white', 2)) },
  { name: 'teleport', voices: record(() => sound.teleport('white')) },
  { name: 'promote', voices: record(() => sound.promote()) },
  { name: 'select', voices: record(() => sound.select()) },
  { name: 'deny', voices: record(() => sound.deny()) },
  { name: 'tick', voices: record(() => sound.tick()) },
  { name: 'flag', voices: record(() => sound.flag()) },
]
for (const entry of everything) {
  check(`${entry.name} is percussive`, entry.voices.length > 0 && longest(entry.voices) <= 0.6,
    `${(longest(entry.voices) * 1000).toFixed(0)}ms`)
}

/* ---- the clock ---------------------------------------------------------- */

// The tick has to sit under a game without ever being taken for a piece: it is
// higher than the lightest piece's voice, and an order of magnitude shorter.
const tick = record(() => sound.tick())
const pawnVoice = record(() => sound.impact(1, 1))
check('the clock tick is shorter than any piece', longest(tick) < 0.05,
  `${(longest(tick) * 1000).toFixed(0)}ms`)
check('the clock tick is pitched above the pieces', lowest(tick) > lowest(pawnVoice),
  `${lowest(tick).toFixed(0)}Hz vs ${lowest(pawnVoice).toFixed(0)}Hz`)

const flag = record(() => sound.flag())
check('the flag falls in two parts', flag.length >= 3, `${flag.length} voices`)
check('the flag ends lower than it starts', lowest(flag) < lowest(tick),
  `${lowest(flag).toFixed(0)}Hz vs ${lowest(tick).toFixed(0)}Hz`)

/* ---- no two strikes are identical -------------------------------------- */

const first = record(() => sound.impact(1, 4))
const second = record(() => sound.impact(1, 4))
check(
  'repeated placements vary',
  lowest(first) !== lowest(second),
  `${lowest(first).toFixed(1)}Hz vs ${lowest(second).toFixed(1)}Hz`,
)

if (failures) {
  console.error(`\n${failures} failure(s)`)
  process.exit(1)
}
console.log('\nthe audio has the shape of a wooden board')
