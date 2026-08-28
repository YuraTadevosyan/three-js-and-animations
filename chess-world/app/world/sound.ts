/**
 * Synthesised audio. No files: every sound is oscillators and filtered noise
 * built at the moment it plays, which keeps the app asset-free and lets the
 * two armies have different voices — the cyan side a fifth above the magenta.
 */
import type { SideKey } from './theme'

const SIDE_PITCH: Record<SideKey, number> = { white: 1.5, black: 1 }

export class Sound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  enabled = true
  volume = 0.55

  /** Browsers only allow audio after a gesture, so this is called on input. */
  resume(): void {
    if (!this.enabled) return
    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      this.context = new Ctor()
      this.master = this.context.createGain()
      this.master.gain.value = this.volume
      this.master.connect(this.context.destination)
      this.noise = this.makeNoise(this.context)
    }
    void this.context.resume()
  }

  setVolume(value: number): void {
    this.volume = value
    if (this.master) this.master.gain.value = value
  }

  private makeNoise(context: AudioContext): AudioBuffer {
    const buffer = context.createBuffer(1, context.sampleRate * 1.5, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  private get ready(): boolean {
    return this.enabled && this.context !== null && this.master !== null && this.context.state === 'running'
  }

  /** One enveloped oscillator. */
  private tone(
    frequency: number,
    options: {
      type?: OscillatorType
      duration?: number
      gain?: number
      attack?: number
      sweepTo?: number
      delay?: number
      detune?: number
    } = {},
  ): void {
    if (!this.ready) return
    const context = this.context!
    const start = context.currentTime + (options.delay ?? 0)
    const duration = options.duration ?? 0.25
    const attack = options.attack ?? 0.006

    const oscillator = context.createOscillator()
    oscillator.type = options.type ?? 'sine'
    oscillator.frequency.setValueAtTime(frequency, start)
    if (options.sweepTo) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.sweepTo), start + duration)
    if (options.detune) oscillator.detune.value = options.detune

    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, options.gain ?? 0.25), start + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscillator.connect(gain).connect(this.master!)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.05)
  }

  /** Filtered noise — impacts, dust, slides. */
  private hit(
    options: {
      duration?: number
      gain?: number
      frequency?: number
      sweepTo?: number
      q?: number
      type?: BiquadFilterType
      delay?: number
    } = {},
  ): void {
    if (!this.ready || !this.noise) return
    const context = this.context!
    const start = context.currentTime + (options.delay ?? 0)
    const duration = options.duration ?? 0.2

    const source = context.createBufferSource()
    source.buffer = this.noise
    source.playbackRate.value = 0.8 + Math.random() * 0.4

    const filter = context.createBiquadFilter()
    filter.type = options.type ?? 'lowpass'
    filter.frequency.setValueAtTime(options.frequency ?? 1200, start)
    if (options.sweepTo) filter.frequency.exponentialRampToValueAtTime(Math.max(60, options.sweepTo), start + duration)
    filter.Q.value = options.q ?? 1

    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, options.gain ?? 0.2), start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    source.connect(filter).connect(gain).connect(this.master!)
    source.start(start)
    source.stop(start + duration + 0.05)
  }

  step(side: SideKey): void {
    const pitch = SIDE_PITCH[side]
    this.tone(180 * pitch, { type: 'triangle', duration: 0.1, gain: 0.09, sweepTo: 120 * pitch })
    this.hit({ duration: 0.07, gain: 0.06, frequency: 2600, sweepTo: 700 })
  }

  slide(side: SideKey): void {
    const pitch = SIDE_PITCH[side]
    this.hit({ duration: 0.32, gain: 0.07, frequency: 500, sweepTo: 3200, type: 'bandpass', q: 3 })
    this.tone(320 * pitch, { type: 'sawtooth', duration: 0.3, gain: 0.035, sweepTo: 620 * pitch })
  }

  leap(side: SideKey): void {
    const pitch = SIDE_PITCH[side]
    this.tone(220 * pitch, { type: 'triangle', duration: 0.42, gain: 0.1, sweepTo: 760 * pitch })
    this.hit({ duration: 0.12, gain: 0.05, frequency: 900, sweepTo: 2400, type: 'bandpass', q: 2 })
  }

  impact(strength: number): void {
    const amount = Math.max(0.15, Math.min(1, strength))
    this.tone(78, { type: 'sine', duration: 0.26 + amount * 0.2, gain: 0.14 * amount, sweepTo: 38 })
    this.hit({ duration: 0.16 + amount * 0.14, gain: 0.13 * amount, frequency: 1800 * amount + 400, sweepTo: 180 })
  }

  teleport(side: SideKey): void {
    const pitch = SIDE_PITCH[side]
    this.tone(420 * pitch, { type: 'sine', duration: 0.34, gain: 0.07, sweepTo: 1500 * pitch })
    this.tone(423 * pitch, { type: 'sine', duration: 0.34, gain: 0.05, sweepTo: 1480 * pitch, detune: 12 })
    this.tone(1600 * pitch, { type: 'sine', duration: 0.45, gain: 0.05, sweepTo: 300 * pitch, delay: 0.34 })
    this.hit({ duration: 0.5, gain: 0.05, frequency: 3000, sweepTo: 600, type: 'bandpass', q: 6, delay: 0.2 })
  }

  capture(): void {
    this.tone(90, { type: 'square', duration: 0.34, gain: 0.1, sweepTo: 34 })
    this.hit({ duration: 0.45, gain: 0.2, frequency: 4200, sweepTo: 220 })
    this.hit({ duration: 0.2, gain: 0.09, frequency: 900, sweepTo: 2800, type: 'bandpass', q: 2, delay: 0.02 })
  }

  check(): void {
    this.tone(880, { type: 'square', duration: 0.13, gain: 0.07 })
    this.tone(932, { type: 'square', duration: 0.18, gain: 0.07, delay: 0.11 })
  }

  mate(): void {
    // A minor triad, falling.
    const root = 196
    this.tone(root * 2, { type: 'sawtooth', duration: 1.2, gain: 0.07, sweepTo: root })
    this.tone(root * 2 * 1.189, { type: 'triangle', duration: 1.3, gain: 0.05, delay: 0.08 })
    this.tone(root * 2 * 1.498, { type: 'triangle', duration: 1.4, gain: 0.05, delay: 0.16 })
    this.tone(root / 2, { type: 'sine', duration: 1.6, gain: 0.1, delay: 0.2 })
  }

  promote(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, index) => {
      this.tone(frequency, { type: 'triangle', duration: 0.35, gain: 0.06, delay: index * 0.07 })
    })
  }

  select(): void {
    this.tone(660, { type: 'sine', duration: 0.07, gain: 0.045 })
  }

  deny(): void {
    this.tone(150, { type: 'square', duration: 0.12, gain: 0.05, sweepTo: 90 })
  }

  destroy(): void {
    void this.context?.close()
    this.context = null
    this.master = null
  }
}
