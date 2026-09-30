/**
 * "Call Me Back" by The Good Cables (Alex's band; practice moved to 7).
 *
 * The fourth thing this computer has owned for sixty years, after the note,
 * the photo and the messages. It is data, not audio: sixteen bars of melody
 * and chords that every era performs on its own instrument (src/lib/audio.ts)
 * — a PC speaker in 1980, FM synthesis in 1995, and so on. Scroll while it
 * plays and the arrangement changes decade mid-phrase.
 */

export const SONG_TITLE = 'Call Me Back'
export const SONG_ARTIST = 'The Good Cables'

export const BPM = 108
/** The grid is eighth notes. */
export const STEPS_PER_BAR = 8
export const STEP_SECONDS = 60 / BPM / 2

/** One string per bar: `NOTE:eighths`, `-` for a rest. Each bar sums to 8. */
const MELODY = [
  'E5:1 G5:1 E5:2 D5:1 C5:1 D5:2',
  'D5:1 G5:1 D5:2 B4:2 -:2',
  'C5:1 E5:1 C5:2 B4:1 A4:1 B4:2',
  'A4:3 C5:1 A4:2 -:2',
  'E5:1 G5:1 E5:2 D5:1 C5:1 D5:2',
  'D5:1 G5:1 B5:2 A5:1 G5:1 D5:2',
  'C5:2 A4:2 F5:2 E5:2',
  'D5:4 -:2 G4:2',
  'A4:1 C5:1 E5:2 A5:2 G5:2',
  'F5:2 E5:1 D5:1 C5:2 A4:2',
  'G4:1 C5:1 E5:2 G5:2 E5:2',
  'D5:3 B4:1 G4:2 -:2',
  'A4:1 C5:1 E5:2 A5:2 G5:2',
  'F5:2 A5:2 G5:2 F5:2',
  'E5:1 D5:1 B4:2 D5:2 G5:2',
  'C5:6 -:2',
] as const

/** One chord per bar. */
export const CHORDS = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'C'] as const

/** Close voicings around middle C, and a bass root, as MIDI note numbers. */
export const CHORD_NOTES: Record<string, { triad: number[]; bass: number }> = {
  C: { triad: [48, 52, 55], bass: 36 },
  G: { triad: [47, 50, 55], bass: 31 },
  Am: { triad: [45, 48, 52], bass: 33 },
  F: { triad: [45, 48, 53], bass: 29 },
}

export const BARS = MELODY.length
export const TOTAL_STEPS = BARS * STEPS_PER_BAR
export const SONG_SECONDS = TOTAL_STEPS * STEP_SECONDS

export interface Note {
  /** Position in eighths from the top of the loop. */
  step: number
  /** Length in eighths. */
  len: number
  midi: number
}

const SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

export function nameToMidi(name: string): number {
  const m = name.match(/^([A-G])(#?)(\d)$/)
  if (!m) throw new Error(`Bad note name: ${name}`)
  return 12 * (Number(m[3]) + 1) + SEMITONE[m[1]] + (m[2] ? 1 : 0)
}

export const midiToHz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12)

/** The melody, flattened. Rests are simply absent. */
export const LEAD: readonly Note[] = MELODY.flatMap((bar, b) => {
  let step = b * STEPS_PER_BAR
  const notes: Note[] = []
  for (const token of bar.split(' ')) {
    const [name, len] = token.split(':')
    if (name !== '-') notes.push({ step, len: Number(len), midi: nameToMidi(name) })
    step += Number(len)
  }
  return notes
})

/** Length of each bar in eighths, for the tests. */
export const barLengths = (): number[] => MELODY.map((bar) => bar.split(' ').reduce((sum, tok) => sum + Number(tok.split(':')[1]), 0))

/** Eighths → the length suffix GW-BASIC's PLAY statement wants. */
const MML_LEN: Record<number, string> = { 1: '8', 2: '4', 3: '4.', 4: '2', 6: '2.', 8: '1' }

/**
 * The melody as a GW-BASIC `PLAY` string: what SONG.MUS would really have
 * contained in 1980, and what `TYPE SONG.MUS` prints.
 */
export function toMML(): string {
  let out = `T${BPM}`
  let octave = -1
  for (const bar of MELODY) {
    for (const token of bar.split(' ')) {
      const [name, len] = token.split(':')
      if (name === '-') {
        out += ` P${MML_LEN[Number(len)]}`
        continue
      }
      const oct = Number(name.at(-1))
      if (oct !== octave) {
        out += ` O${oct}`
        octave = oct
      }
      out += ` ${name.slice(0, -1)}${MML_LEN[Number(len)]}`
    }
  }
  return out
}
