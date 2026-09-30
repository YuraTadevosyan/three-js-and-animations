/**
 * Every sound on the page, synthesised. No samples, no files.
 *
 * Three jobs:
 *  - the song (./song.ts), performed by whichever decade the scrollbar is in.
 *    Each note picks its instrument at the moment it's scheduled, so scrolling
 *    while it plays re-orchestrates it mid-phrase: PC speaker → FM chip →
 *    a 2005 indie band → a marimba → glass bells → something from 2040;
 *  - small interface sounds, in each era's idiom;
 *  - a sting when you arrive in an era, and a low drone for 2040.
 *
 * Sound is off until asked for, and this module is only ever reached through
 * a dynamic import (src/state/sound.ts), so none of it runs for a visitor
 * who never turns it on.
 */

import { ERAS, type EraId } from '@/timeline/eras'
import { currentT, onProgress } from '@/timeline/progress'
import { CHORDS, CHORD_NOTES, LEAD, SONG_SECONDS, STEPS_PER_BAR, STEP_SECONDS, TOTAL_STEPS, midiToHz, type Note } from './song'

export type Sfx =
  | 'dos-key'
  | 'dos-beep'
  | 'dos-eat'
  | 'dos-die'
  | 'w95-click'
  | 'w95-ding'
  | 'w95-chord'
  | 'w95-boom'
  | 'w95-tada'
  | 'w95-shutdown'
  | 'w2-pop'
  | 'md-tap'
  | 'md-snack'
  | 'gl-tick'
  | 'gl-chime'
  | 'sf-blip'
  | 'sf-reply'

let ctx: AudioContext | null = null
let master: GainNode
let reverb: GainNode
let echo: GainNode
let noise: AudioBuffer
let on = false

/** Which decade's instruments a given scroll position hears. */
export function eraAt(t: number): EraId {
  if (t < 1.6) return 'dos'
  if (t < 2.8) return 'win95'
  if (t < 3.78) return 'web2'
  if (t < 4.8) return 'material'
  if (t < 5.8) return 'glass'
  return 'scifi'
}

function init(): AudioContext | null {
  if (ctx) return ctx
  try {
    const AC: typeof AudioContext = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const c = new AC()
    const comp = c.createDynamicsCompressor()
    comp.threshold.value = -16
    comp.ratio.value = 4
    master = c.createGain()
    master.gain.value = 0
    master.connect(comp).connect(c.destination)

    // A room: decaying noise as an impulse response.
    const len = Math.floor(c.sampleRate * 2.4)
    const ir = c.createBuffer(2, len, c.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6
    }
    const conv = c.createConvolver()
    conv.buffer = ir
    const wet = c.createGain()
    wet.gain.value = 0.55
    reverb = c.createGain()
    reverb.connect(conv).connect(wet).connect(master)

    // A dotted-eighth echo that feeds the room, for 2040.
    const delay = c.createDelay(1)
    delay.delayTime.value = STEP_SECONDS * 1.5
    const feedback = c.createGain()
    feedback.gain.value = 0.36
    echo = c.createGain()
    echo.connect(delay)
    delay.connect(feedback).connect(delay)
    delay.connect(master)
    delay.connect(reverb)

    noise = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const nd = noise.getChannelData(0)
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
    ctx = c
  } catch {
    ctx = null
  }
  return ctx
}

// ── voices ───────────────────────────────────────────────────────────────

interface Tone {
  type?: OscillatorType
  /** Hz. */
  f: number
  /** Start time and length, in seconds. */
  t: number
  d: number
  /** Peak gain. */
  g: number
  attack?: number
  release?: number
  /** Decay to silence across `d` instead of sustaining. */
  perc?: boolean
  detune?: number
  /** Glide to this frequency across `d`. */
  glide?: number
  /** Low-pass cutoff, optionally sweeping to `lpTo`. */
  lp?: number
  lpTo?: number
  /** Two-operator FM: modulator at f × ratio, index decaying over `decay` s. */
  fm?: { ratio: number; index: number; decay: number }
  /** Reverb and echo sends, 0…1. */
  verb?: number
  echo?: number
}

function tone(o: Tone): void {
  const c = ctx
  if (!c) return
  const a = o.attack ?? 0.004
  const r = o.release ?? 0.05
  const end = o.t + o.d + r
  const osc = c.createOscillator()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.f, o.t)
  if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, o.t + o.d)
  if (o.detune) osc.detune.value = o.detune

  if (o.fm) {
    const mod = c.createOscillator()
    mod.frequency.value = o.f * o.fm.ratio
    const depth = c.createGain()
    const peak = o.f * o.fm.index
    depth.gain.setValueAtTime(peak, o.t)
    depth.gain.exponentialRampToValueAtTime(Math.max(0.01, peak * 0.03), o.t + o.fm.decay)
    mod.connect(depth).connect(osc.frequency)
    mod.start(o.t)
    mod.stop(end + 0.05)
  }

  const env = c.createGain()
  env.gain.setValueAtTime(0, o.t)
  env.gain.linearRampToValueAtTime(o.g, o.t + a)
  if (o.perc) env.gain.exponentialRampToValueAtTime(0.0001, end)
  else {
    env.gain.setValueAtTime(o.g, Math.max(o.t + a, o.t + o.d))
    env.gain.linearRampToValueAtTime(0, Math.max(o.t + a, o.t + o.d) + r)
  }

  let out: AudioNode = osc
  if (o.lp) {
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(o.lp, o.t)
    if (o.lpTo) filter.frequency.exponentialRampToValueAtTime(o.lpTo, o.t + o.d)
    osc.connect(filter)
    out = filter
  }
  out.connect(env)
  env.connect(master)
  send(env, reverb, o.verb)
  send(env, echo, o.echo)
  osc.start(o.t)
  osc.stop(end + 0.05)
}

function send(from: AudioNode, bus: AudioNode, amount?: number): void {
  if (!ctx || !amount) return
  const g = ctx.createGain()
  g.gain.value = amount
  from.connect(g).connect(bus)
}

/** A burst of filtered noise: hats, snares, clicks, explosions. */
function hit(t: number, d: number, g: number, type: BiquadFilterType, freq: number, verb = 0): void {
  const c = ctx
  if (!c) return
  const src = c.createBufferSource()
  src.buffer = noise
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  const env = c.createGain()
  env.gain.setValueAtTime(g, t)
  env.gain.exponentialRampToValueAtTime(0.0001, t + d)
  src.connect(filter).connect(env).connect(master)
  send(env, reverb, verb)
  src.start(t, Math.random() * 0.5)
  src.stop(t + d + 0.02)
}

const kick = (t: number, g: number) => tone({ f: 150, glide: 44, t, d: 0.13, g, perc: true, release: 0.02 })

// ── the song ─────────────────────────────────────────────────────────────

const leadAt = new Map<number, Note>(LEAD.map((n) => [n.step, n]))
/** Steps during which a melody note is sounding (not just starting). */
const covered = new Set<number>(LEAD.flatMap((n) => Array.from({ length: n.len }, (_, k) => n.step + k)))

/** Play whatever happens on one eighth-note step, the way `era` would. */
function perform(era: EraId, step: number, t: number): void {
  const S = STEP_SECONDS
  const pos = step % STEPS_PER_BAR
  const chord = CHORD_NOTES[CHORDS[Math.floor(step / STEPS_PER_BAR)]]
  const lead = leadAt.get(step)
  const hz = midiToHz

  switch (era) {
    case 'dos':
      // One voice, one square wave. Where the tune rests the speaker
      // arpeggiates the chord: the classic trick for faking harmony.
      if (lead) tone({ type: 'square', f: hz(lead.midi), t, d: lead.len * S * 0.88, g: 0.05, attack: 0.002, release: 0.004 })
      else if (!covered.has(step)) tone({ type: 'square', f: hz(chord.triad[pos % 3] + 12), t, d: S * 0.4, g: 0.032, attack: 0.002, release: 0.004 })
      break

    case 'win95':
      // A sound card's FM chip playing a General MIDI file.
      if (lead) tone({ f: hz(lead.midi), t, d: lead.len * S * 0.95, g: 0.11, fm: { ratio: 2, index: 1.7, decay: 0.3 }, release: 0.14, verb: 0.1 })
      if (pos === 0) for (const n of chord.triad) tone({ type: 'triangle', f: hz(n + 12), t, d: S * 7.6, g: 0.028, attack: 0.04, release: 0.2 })
      if (pos % 4 === 0) {
        tone({ f: hz(chord.bass + 12), t, d: S * 1.5, g: 0.14, fm: { ratio: 1, index: 2.2, decay: 0.14 }, perc: true })
        kick(t, 0.2)
      }
      if (pos === 2 || pos === 6) hit(t, 0.12, 0.09, 'bandpass', 1900, 0.1)
      if (pos % 2 === 1) hit(t, 0.03, 0.035, 'highpass', 7000)
      break

    case 'web2': {
      // Four people in a garage, as heard through a 128 kbps MP3.
      if (lead)
        for (const detune of [-8, 8])
          tone({ type: 'sawtooth', f: hz(lead.midi), t, d: lead.len * S * 0.92, g: 0.042, detune, lp: 4200, lpTo: 1000, release: 0.08, verb: 0.08 })
      tone({ type: 'square', f: hz(chord.bass + 12), t, d: S * 0.8, g: 0.06, lp: 520, release: 0.03 })
      if (pos === 0 || pos === 3 || pos === 6)
        chord.triad.forEach((n, k) => tone({ type: 'sawtooth', f: hz(n + 12), t: t + k * 0.012, d: S * 1.1, g: 0.022, lp: 2600, lpTo: 600, perc: true }))
      if (pos === 0 || pos === 4 || pos === 5) kick(t, 0.22)
      if (pos === 2 || pos === 6) hit(t, 0.16, 0.13, 'bandpass', 1700, 0.12)
      hit(t, 0.035, pos % 2 ? 0.02 : 0.04, 'highpass', 8000)
      break
    }

    case 'material':
      // A phone's marimba: clean, short, exactly on the grid.
      if (lead) {
        const f = hz(lead.midi)
        tone({ f, t, d: Math.max(0.2, lead.len * S * 0.8), g: 0.17, perc: true })
        tone({ f: f * 4, t, d: 0.07, g: 0.03, perc: true })
      }
      if (pos % 4 === 0) {
        tone({ f: hz(chord.bass + 12), t, d: S * 1.8, g: 0.15, perc: true })
        for (const n of chord.triad) tone({ type: 'triangle', f: hz(n + 12), t, d: S * 3.4, g: 0.02, attack: 0.02, release: 0.12 })
        kick(t, 0.12)
      }
      if (pos === 2 || pos === 6) hit(t, 0.025, 0.05, 'highpass', 3200)
      break

    case 'glass':
      // Bells in a bright room over a slow pad.
      if (lead) {
        const f = hz(lead.midi)
        tone({ f, t, d: lead.len * S + 0.7, g: 0.1, perc: true, verb: 0.5 })
        tone({ f: f * 2.01, t, d: lead.len * S + 0.4, g: 0.028, perc: true, verb: 0.5 })
      }
      if (pos === 0) {
        for (const n of chord.triad)
          for (const detune of [-9, 9])
            tone({ type: 'sawtooth', f: hz(n + 12), t, d: S * 7.4, g: 0.012, detune, lp: 950, attack: 0.3, release: 0.7, verb: 0.4 })
        tone({ f: hz(chord.bass + 12), t, d: S * 7, g: 0.11, attack: 0.02, release: 0.35 })
      }
      if (pos === 4) hit(t, 0.06, 0.012, 'highpass', 9000, 0.4)
      break

    case 'scifi':
      // No drums, no edges: glass tones echoing over a pad that opens up.
      if (lead) {
        const f = hz(lead.midi)
        tone({ f, t, d: lead.len * S + 0.9, g: 0.07, fm: { ratio: 3.5, index: 1.1, decay: 0.5 }, perc: true, verb: 0.6, echo: 0.42 })
        tone({ f: f * 2, t, d: lead.len * S + 1.4, g: 0.016, attack: 0.2, perc: true, verb: 0.7 })
      }
      if (pos === 0) {
        for (const n of chord.triad)
          for (const detune of [-12, 12])
            tone({ type: 'sawtooth', f: hz(n + 12), t, d: S * 8, g: 0.011, detune, lp: 500, lpTo: 2200, attack: 0.6, release: 1.2, verb: 0.6 })
        tone({ f: hz(chord.bass), t, d: S * 8, g: 0.16, attack: 0.1, release: 0.5 })
      }
      break
  }
}

let playing = false
let timer = 0
let nextStep = 0
let nextTime = 0
let songStart = 0

/** Schedule every step that starts in the next 140 ms. */
function pump(): void {
  if (!ctx || !playing) return
  while (nextTime < ctx.currentTime + 0.14) {
    perform(eraAt(currentT()), nextStep, nextTime)
    nextStep = (nextStep + 1) % TOTAL_STEPS
    nextTime += STEP_SECONDS
  }
}

export function playSong(): void {
  setSound(true)
  if (playing || !ctx) return
  playing = true
  nextStep = 0
  nextTime = songStart = ctx.currentTime + 0.08
  timer = window.setInterval(pump, 30)
  pump()
  scape(currentT())
}

export function stopSong(): void {
  if (!playing) return
  playing = false
  window.clearInterval(timer)
  scape(currentT())
}

export const songPlaying = (): boolean => playing

/** Seconds into the loop. */
export const songPosition = (): number => (playing && ctx ? Math.max(0, ctx.currentTime - songStart) % SONG_SECONDS : 0)

// ── interface sounds ─────────────────────────────────────────────────────

export function sfx(name: Sfx): void {
  if (!on || !ctx) return
  const t = ctx.currentTime + 0.005
  switch (name) {
    case 'dos-key':
      hit(t, 0.012, 0.05, 'bandpass', 2600)
      break
    case 'dos-beep':
      tone({ type: 'square', f: 880, t, d: 0.11, g: 0.05, release: 0.004 })
      break
    case 'dos-eat':
      tone({ type: 'square', f: 1320, t, d: 0.04, g: 0.04, release: 0.004 })
      break
    case 'dos-die':
      tone({ type: 'square', f: 220, glide: 70, t, d: 0.4, g: 0.05, release: 0.004 })
      break
    case 'w95-click':
      hit(t, 0.015, 0.08, 'bandpass', 1800)
      break
    case 'w95-ding':
      tone({ f: 1318.5, t, d: 0.7, g: 0.1, fm: { ratio: 3, index: 0.6, decay: 0.2 }, perc: true, verb: 0.2 })
      tone({ f: 1975.5, t, d: 0.5, g: 0.04, perc: true, verb: 0.2 })
      break
    case 'w95-chord':
      for (const f of [311.1, 392, 466.2]) tone({ type: 'triangle', f, t, d: 0.22, g: 0.07, release: 0.12, verb: 0.15 })
      break
    case 'w95-boom':
      hit(t, 0.6, 0.35, 'lowpass', 500, 0.2)
      tone({ f: 90, glide: 28, t, d: 0.5, g: 0.3, perc: true })
      break
    case 'w95-tada':
      ;[523.3, 659.3, 784, 1046.5].forEach((f, k) =>
        tone({ f, t: t + (k < 3 ? k * 0.07 : 0.28), d: k < 3 ? 0.12 : 0.7, g: 0.09, fm: { ratio: 2, index: 1.2, decay: 0.3 }, release: 0.2, verb: 0.25 }),
      )
      break
    case 'w95-shutdown':
      ;[784, 659.3, 523.3, 392].forEach((f, k) => tone({ f, t: t + k * 0.16, d: 0.5, g: 0.07, fm: { ratio: 2, index: 1.3, decay: 0.4 }, release: 0.4, verb: 0.3 }))
      break
    case 'w2-pop':
      tone({ f: 520, glide: 1100, t, d: 0.08, g: 0.12, perc: true })
      break
    case 'md-tap':
      tone({ f: 1700, t, d: 0.025, g: 0.035, perc: true })
      break
    case 'md-snack':
      tone({ f: 660, t, d: 0.09, g: 0.06, perc: true })
      break
    case 'gl-tick':
      tone({ f: 2300, t, d: 0.06, g: 0.04, perc: true, verb: 0.35 })
      break
    case 'gl-chime':
      ;[1046.5, 1318.5, 1568].forEach((f, k) => tone({ f, t: t + k * 0.09, d: 0.9, g: 0.06, perc: true, verb: 0.6 }))
      break
    case 'sf-blip':
      tone({ f: 880, t, d: 0.08, g: 0.05, fm: { ratio: 3.5, index: 1, decay: 0.08 }, perc: true, echo: 0.3, verb: 0.3 })
      break
    case 'sf-reply':
      ;[659.3, 987.8].forEach((f, k) => tone({ f, t: t + k * 0.1, d: 0.35, g: 0.05, fm: { ratio: 2, index: 0.8, decay: 0.2 }, perc: true, verb: 0.5, echo: 0.25 }))
      break
  }
}

/** The sound of arriving somewhere. */
function sting(era: EraId): void {
  if (!ctx) return
  const t = ctx.currentTime + 0.02
  switch (era) {
    case 'dos': // power-on self-test: one beep means everything is fine
      tone({ type: 'square', f: 1000, t, d: 0.17, g: 0.05, release: 0.004 })
      break
    case 'win95': // a warm chord swelling open (nobody's startup sound in particular)
      ;[51, 58, 63, 67, 70, 74].forEach((m, k) =>
        tone({ f: midiToHz(m), t: t + k * 0.1, d: 2.2 - k * 0.1, g: 0.05, fm: { ratio: 2, index: 1.4, decay: 0.8 }, attack: 0.06, release: 0.9, verb: 0.5 }),
      )
      break
    case 'web2':
      tone({ f: 480, glide: 960, t, d: 0.08, g: 0.1, perc: true })
      tone({ f: 640, glide: 1280, t: t + 0.11, d: 0.08, g: 0.1, perc: true })
      break
    case 'material':
      tone({ f: 880, t, d: 0.12, g: 0.1, perc: true })
      tone({ f: 1318.5, t: t + 0.13, d: 0.2, g: 0.1, perc: true })
      break
    case 'glass':
      ;[784, 1046.5, 1318.5, 1568].forEach((f, k) => tone({ f, t: t + k * 0.08, d: 1.2, g: 0.055, perc: true, verb: 0.65 }))
      break
    case 'scifi':
      for (const [f, detune] of [[110, -10], [110, 10], [165, 0]] as const)
        tone({ type: 'sawtooth', f, t, d: 2.4, g: 0.022, detune, lp: 180, lpTo: 2600, attack: 1.1, release: 1.4, verb: 0.6 })
      tone({ f: 55, t, d: 2.6, g: 0.16, attack: 0.6, release: 1 })
      break
  }
}

// ── the soundscape: stings on arrival, and 2040's hum ────────────────────

let droneGain: GainNode | null = null
let pending: EraId | null = null
let stung: EraId | null = null
let stingTimer = 0
let watching = false

function drone(level: number): void {
  const c = ctx
  if (!c) return
  if (!droneGain) {
    if (!level) return
    droneGain = c.createGain()
    droneGain.gain.value = 0
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 260
    const lfo = c.createOscillator()
    lfo.frequency.value = 0.07
    const depth = c.createGain()
    depth.gain.value = 120
    lfo.connect(depth).connect(filter.frequency)
    lfo.start()
    for (const [type, f] of [['sine', 55], ['sine', 82.4], ['sawtooth', 110.3]] as const) {
      const osc = c.createOscillator()
      osc.type = type
      osc.frequency.value = f
      osc.connect(filter)
      osc.start()
    }
    filter.connect(droneGain)
    droneGain.connect(master)
    send(droneGain, reverb, 0.5)
  }
  // Retargeted, never assigned: a stepped gain is audible as a click.
  droneGain.gain.setTargetAtTime(level, c.currentTime, 0.9)
}

function scape(t: number): void {
  const era = ERAS.find((e) => t >= e.dwell[0] && t <= e.dwell[1])?.id ?? null
  drone(on && !playing && era === 'scifi' ? 0.09 : 0)
  if (era === pending) return
  pending = era
  window.clearTimeout(stingTimer)
  if (!era) {
    stung = null
    return
  }
  if (era === stung) return
  // Only if they actually stop here. Scrolling straight through six eras
  // shouldn't set off six fanfares.
  stingTimer = window.setTimeout(() => {
    if (!on || playing || pending !== era) return
    stung = era
    sting(era)
  }, 320)
}

export const soundOn = (): boolean => on

export function setSound(value: boolean): void {
  const c = init()
  if (!c) return
  if (value) void c.resume()
  on = value
  master.gain.setTargetAtTime(value ? 0.9 : 0, c.currentTime, 0.03)
  if (!value) {
    stopSong()
    drone(0)
    return
  }
  if (!watching) {
    watching = true
    onProgress(scape)
  } else {
    pending = null
    stung = null
    scape(currentT())
  }
}
