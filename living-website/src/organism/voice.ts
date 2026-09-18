import { clamp } from '@/lib/math'
import type { Bus } from './bus'
import type { OrganismState } from './state'

const STORAGE_KEY = 'living-website:voice'

/** How often audio parameters are retargeted. Far below frame rate on purpose. */
const UPDATE_HZ = 8

/** Seconds the master gain takes to fade in or out. */
const FADE = 1.4

interface Layers {
  wind: { filter: BiquadFilterNode; gain: GainNode }
  rain: { filter: BiquadFilterNode; gain: GainNode }
  rumble: { gain: GainNode }
  crickets: { osc: OscillatorNode; lfo: OscillatorNode; gate: GainNode; gain: GainNode }
  pulse: { osc: OscillatorNode; gain: GainNode }
}

/**
 * The organism's voice: wind, rain, thunder, dawn birds, night crickets and a
 * pulse under all of it. Everything is synthesized — no audio files ship, the
 * same as everywhere else here.
 *
 * It is opt-in and starts silent. Browsers require a user gesture before audio
 * can play at all, so the toggle doubles as the consent and the gesture.
 */
export class Voice {
  enabled = false
  /** True once the audio graph exists, whether or not it is currently audible. */
  built = false

  #ctx: AudioContext | null = null
  #master: GainNode | null = null
  #noise: AudioBuffer | null = null
  #layers: Layers | null = null
  #accum = 0
  #birdTimer = 0
  #armed = false

  constructor(private bus: Bus) {}

  /** Whether the visitor asked for sound on a previous visit. */
  static remembered(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'on'
    } catch {
      return false
    }
  }

  #remember(on: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
    } catch {
      /* blocked storage; the choice just doesn't survive the session */
    }
  }

  /**
   * A visitor who turned sound on last time still needs a gesture before the
   * browser will allow it. Rather than nagging, arm the next interaction.
   */
  armFromMemory() {
    if (this.#armed || !Voice.remembered()) return
    this.#armed = true

    const go = () => {
      window.removeEventListener('pointerdown', go)
      window.removeEventListener('keydown', go)
      void this.enable()
    }
    window.addEventListener('pointerdown', go, { once: true, passive: true })
    window.addEventListener('keydown', go, { once: true, passive: true })
  }

  async enable(): Promise<boolean> {
    if (typeof AudioContext === 'undefined') return false

    try {
      if (!this.#ctx) this.#build()
      const ctx = this.#ctx
      const master = this.#master
      if (!ctx || !master) return false

      await ctx.resume()
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + FADE)

      this.enabled = true
      this.#remember(true)
      this.bus.emit('voice', { enabled: true })
      return true
    } catch (err) {
      console.warn('[voice] could not start audio', err)
      return false
    }
  }

  disable() {
    this.enabled = false
    this.#remember(false)
    this.bus.emit('voice', { enabled: false })

    const ctx = this.#ctx
    const master = this.#master
    if (!ctx || !master) return

    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE * 0.5)
    // Suspend once silent, so an idle tab isn't running an audio graph.
    window.setTimeout(() => {
      if (!this.enabled) void ctx.suspend()
    }, FADE * 500 + 120)
  }

  toggle(): void | Promise<boolean> {
    return this.enabled ? this.disable() : this.enable()
  }

  #build() {
    const ctx = new AudioContext()
    this.#ctx = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    this.#master = master

    // Two seconds of white noise, looped. One source feeds every noise layer;
    // the filters are what make it wind rather than rain.
    const length = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    this.#noise = buffer

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 340
    windFilter.Q.value = 0.7
    const windGain = ctx.createGain()
    windGain.gain.value = 0
    source.connect(windFilter).connect(windGain).connect(master)

    const rainFilter = ctx.createBiquadFilter()
    rainFilter.type = 'highpass'
    rainFilter.frequency.value = 1100
    rainFilter.Q.value = 0.6
    const rainGain = ctx.createGain()
    rainGain.gain.value = 0
    source.connect(rainFilter).connect(rainGain).connect(master)

    const rumbleFilter = ctx.createBiquadFilter()
    rumbleFilter.type = 'lowpass'
    rumbleFilter.frequency.value = 110
    const rumbleGain = ctx.createGain()
    rumbleGain.gain.value = 0
    source.connect(rumbleFilter).connect(rumbleGain).connect(master)

    // Crickets: a tone gated by a square LFO. The LFO's rate is the chirp
    // rate, which is a real function of temperature (see #tick).
    const cricketOsc = ctx.createOscillator()
    cricketOsc.type = 'triangle'
    cricketOsc.frequency.value = 4600
    const gate = ctx.createGain()
    gate.gain.value = 0.5
    const lfo = ctx.createOscillator()
    lfo.type = 'square'
    lfo.frequency.value = 2
    const lfoDepth = ctx.createGain()
    lfoDepth.gain.value = 0.5
    lfo.connect(lfoDepth).connect(gate.gain)
    const cricketGain = ctx.createGain()
    cricketGain.gain.value = 0
    cricketOsc.connect(gate).connect(cricketGain).connect(master)

    // The pulse: a sub-bass swell on the breath. Felt more than heard.
    const pulseOsc = ctx.createOscillator()
    pulseOsc.type = 'sine'
    pulseOsc.frequency.value = 52
    const pulseGain = ctx.createGain()
    pulseGain.gain.value = 0
    pulseOsc.connect(pulseGain).connect(master)

    source.start()
    cricketOsc.start()
    lfo.start()
    pulseOsc.start()

    this.#layers = {
      wind: { filter: windFilter, gain: windGain },
      rain: { filter: rainFilter, gain: rainGain },
      rumble: { gain: rumbleGain },
      crickets: { osc: cricketOsc, lfo, gate, gain: cricketGain },
      pulse: { osc: pulseOsc, gain: pulseGain },
    }

    this.built = true
    this.bus.on('thunder', ({ strength }) => this.#crack(strength))
  }

  /** A thunder crack: a filtered noise burst with a long tail. */
  #crack(strength: number) {
    const ctx = this.#ctx
    const master = this.#master
    const buffer = this.#noise
    if (!ctx || !master || !buffer || !this.enabled) return

    const now = ctx.currentTime
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    // The sweep down is what turns a hiss into a rolling crack.
    filter.frequency.setValueAtTime(1800 * strength, now)
    filter.frequency.exponentialRampToValueAtTime(90, now + 2.4)

    const gain = ctx.createGain()
    const peak = 0.22 * strength
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6)

    source.connect(filter).connect(gain).connect(master)
    source.start(now)
    source.stop(now + 2.8)
    source.onended = () => {
      source.disconnect()
      filter.disconnect()
      gain.disconnect()
    }
  }

  /** A single bird call: a short frequency sweep. A few make a dawn chorus. */
  #chirp(delay: number) {
    const ctx = this.#ctx
    const master = this.#master
    if (!ctx || !master) return

    const at = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    const base = 2100 + Math.random() * 1400

    osc.frequency.setValueAtTime(base, at)
    osc.frequency.exponentialRampToValueAtTime(base * 1.45, at + 0.05)
    osc.frequency.exponentialRampToValueAtTime(base * 0.92, at + 0.12)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.05, at + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16)

    osc.connect(gain).connect(master)
    osc.start(at)
    osc.stop(at + 0.2)
    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
    }
  }

  tick(dt: number, state: OrganismState) {
    if (!this.enabled || !this.#ctx || !this.#layers) return

    this.#accum += dt
    if (this.#accum < 1 / UPDATE_HZ) return
    const step = this.#accum
    this.#accum = 0

    const ctx = this.#ctx
    const L = this.#layers
    const now = ctx.currentTime
    const w = state.weather
    const wind = Math.abs(w.wind)

    // setTargetAtTime rather than direct assignment: stepping a gain eight
    // times a second is audible as zipper noise, an exponential approach is not.
    const to = (param: AudioParam, value: number, tc = 0.3) =>
      param.setTargetAtTime(value, now, tc)

    to(L.wind.filter.frequency, 220 + wind * 760, 0.5)
    to(L.wind.gain.gain, clamp(wind * 0.14, 0, 0.16) + w.params.cloud * 0.006)

    const rain = w.params.precip * (1 - w.params.snowiness)
    to(L.rain.gain.gain, rain * 0.15)
    to(L.rain.filter.frequency, 900 + rain * 900, 0.5)

    to(L.rumble.gain.gain, w.params.thunder * 0.07 + w.params.gloom * 0.012)

    // Dolbear's law: cricket chirp rate really is a thermometer. Chirps per
    // minute ≈ 4 × (°F − 40) + 40, which at 20°C is a little under 2Hz.
    const fahrenheit = w.temperature * 1.8 + 32
    const chirpsPerMinute = Math.max(20, (fahrenheit - 40) * 4 + 40)
    to(L.crickets.lfo.frequency, chirpsPerMinute / 60, 1.2)

    const night = clamp(1 - state.circadian.daylight * 2.6)
    const warmEnough = clamp((w.temperature - 7) / 10)
    const dry = clamp(1 - w.params.precip * 2)
    to(L.crickets.gain.gain, night * warmEnough * dry * 0.02)

    // The pulse rides the breath directly, so the page audibly inhales.
    const swell = (state.breath.value * 0.5 + 0.5) * (state.prefs.reducedMotion ? 0.4 : 1)
    to(L.pulse.gain.gain, swell * 0.035, 0.12)

    // Dawn chorus: the hour either side of sunrise, loudest right at it.
    const { hour, sunrise } = state.circadian
    const fromSunrise = Math.abs(hour - sunrise)
    const dawn = clamp(1 - fromSunrise / 1.5) * clamp(1 - w.params.precip * 1.5)
    this.#birdTimer -= step
    if (dawn > 0.08 && this.#birdTimer <= 0) {
      const calls = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < calls; i++) this.#chirp(i * (0.1 + Math.random() * 0.22))
      this.#birdTimer = (0.6 + Math.random() * 3.4) / Math.max(dawn, 0.1)
    }
  }

  /** What a listener would currently be able to pick out. For the readout. */
  audible(state: OrganismState): string[] {
    const out: string[] = []
    const w = state.weather
    if (Math.abs(w.wind) > 0.18) out.push('wind')
    if (w.params.precip * (1 - w.params.snowiness) > 0.12) out.push('rain')
    if (w.params.thunder > 0.3) out.push('thunder')
    const night = clamp(1 - state.circadian.daylight * 2.6)
    if (night * clamp((w.temperature - 7) / 10) * clamp(1 - w.params.precip * 2) > 0.15) {
      out.push('crickets')
    }
    if (Math.abs(state.circadian.hour - state.circadian.sunrise) < 1.5) out.push('birds')
    out.push('its pulse')
    return out
  }
}
