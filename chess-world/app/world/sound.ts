/**
 * Synthesised audio — no files.
 *
 * The brief is "chess", so the whole set is built from one sound: a piece being
 * set down on a wooden board. That is a very short broadband contact tick,
 * followed by the piece's own body ringing — a handful of inharmonic partials
 * decaying fast — over a low thump from the board underneath.
 *
 * Everything else is that same strike, re-voiced: a capture is wood knocking
 * wood before the piece lands, castling is two placements a beat apart, a
 * toppling king is a run of strikes falling in pitch as it rolls over.
 *
 * Heavier pieces ring lower and longer, and every strike is nudged a few
 * percent in pitch and level, because no two pieces ever sound identical.
 */
import type { SideKey } from './theme'

/**
 * Per-piece voicing. `fundamental` is the first mode of the piece body,
 * `body` the board resonance it excites, `weight` scales the whole strike.
 */
interface Voice {
  fundamental: number
  decay: number
  body: number
  weight: number
}

const PIECE_VOICE: Record<number, Voice> = {
  1: { fundamental: 545, decay: 0.085, body: 152, weight: 0.55 }, // pawn
  2: { fundamental: 452, decay: 0.10, body: 138, weight: 0.7 }, // knight
  3: { fundamental: 415, decay: 0.11, body: 131, weight: 0.72 }, // bishop
  4: { fundamental: 352, decay: 0.13, body: 121, weight: 0.86 }, // rook
  5: { fundamental: 306, decay: 0.15, body: 113, weight: 0.95 }, // queen
  6: { fundamental: 274, decay: 0.17, body: 105, weight: 1 }, // king
}

const DEFAULT_VOICE: Voice = PIECE_VOICE[1]!

/**
 * Mode ratios of a struck wooden block — deliberately inharmonic, which is
 * what stops this sounding like a bell or a marimba.
 */
const MODES = [1, 1.58, 2.24, 3.02, 4.15]
const MODE_GAINS = [1, 0.5, 0.29, 0.17, 0.1]

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
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
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

  private voice(type: number): Voice {
    return PIECE_VOICE[type] ?? DEFAULT_VOICE
  }

  /** ±6% pitch, ±12% level: the same piece never lands twice the same way. */
  private vary(): { pitch: number; level: number } {
    return { pitch: 0.94 + Math.random() * 0.12, level: 0.88 + Math.random() * 0.24 }
  }

  /* ------------------------------------------------------------ atoms --- */

  /** One decaying sine partial. */
  private partial(frequency: number, gain: number, decay: number, delay: number, type: OscillatorType = 'sine'): void {
    if (!this.ready) return
    const context = this.context!
    const start = context.currentTime + delay

    const oscillator = context.createOscillator()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, start)

    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0.0001, start)
    // Sub-millisecond attack — a struck object has no fade-in.
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.0008)
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + decay)

    oscillator.connect(envelope).connect(this.master!)
    oscillator.start(start)
    oscillator.stop(start + decay + 0.02)
  }

  /** A burst of filtered noise — contact, scrape, felt. */
  private burst(options: {
    duration: number
    gain: number
    frequency: number
    sweepTo?: number
    q?: number
    type?: BiquadFilterType
    delay?: number
    attack?: number
  }): void {
    if (!this.ready || !this.noise) return
    const context = this.context!
    const start = context.currentTime + (options.delay ?? 0)
    const duration = options.duration

    const source = context.createBufferSource()
    source.buffer = this.noise
    source.playbackRate.value = 0.85 + Math.random() * 0.3
    // Start somewhere random in the buffer so repeats never phase-match.
    const offset = Math.random() * 1.2

    const filter = context.createBiquadFilter()
    filter.type = options.type ?? 'bandpass'
    filter.frequency.setValueAtTime(options.frequency, start)
    if (options.sweepTo) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(60, options.sweepTo), start + duration)
    }
    filter.Q.value = options.q ?? 1

    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0.0001, start)
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, options.gain), start + (options.attack ?? 0.001))
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    source.connect(filter).connect(envelope).connect(this.master!)
    source.start(start, offset, duration + 0.05)
    source.stop(start + duration + 0.05)
  }

  /**
   * The core sound: a piece meeting the board. Contact tick, the piece body
   * ringing in inharmonic modes, and the board answering underneath.
   */
  private strike(type: number, strength = 1, delay = 0, brightness = 1): void {
    if (!this.ready) return
    const voice = this.voice(type)
    const { pitch, level } = this.vary()
    const force = Math.max(0.2, Math.min(1.4, strength)) * voice.weight * level

    // Contact: the click of the felt-and-wood base touching the square.
    this.burst({
      duration: 0.012 + 0.006 * force,
      gain: 0.16 * force * brightness,
      frequency: 2600 * brightness,
      sweepTo: 900,
      q: 0.7,
      type: 'highpass',
      delay,
    })

    // The piece itself.
    for (let i = 0; i < MODES.length; i++) {
      this.partial(
        voice.fundamental * MODES[i]! * pitch,
        0.12 * MODE_GAINS[i]! * force,
        // Higher modes die away first, which is what makes it wood.
        voice.decay / (1 + i * 0.55),
        delay,
      )
    }

    // The board: a short low thump, louder the heavier the piece.
    this.partial(voice.body * pitch, 0.1 * force, 0.11 + 0.05 * force, delay)
  }

  /* ----------------------------------------------------------- moves --- */

  /** Lifting a piece off its square: a small tick of fingers and felt. */
  step(_side: SideKey, type = 1): void {
    const voice = this.voice(type)
    this.burst({ duration: 0.02, gain: 0.05, frequency: 3200, sweepTo: 1400, q: 0.8, type: 'highpass' })
    this.partial(voice.fundamental * 1.6, 0.02, 0.03, 0)
  }

  /** A piece dragged across the board rather than lifted. */
  slide(_side: SideKey, type = 1): void {
    const voice = this.voice(type)
    this.burst({
      duration: 0.26,
      gain: 0.055 * voice.weight,
      frequency: 900,
      sweepTo: 1700,
      q: 1.4,
      attack: 0.05,
    })
    // A faint rumble of the board as it travels.
    this.partial(voice.body * 1.4, 0.018, 0.22, 0)
  }

  /** The knight leaving the board: felt lifting, then air. */
  leap(_side: SideKey, type = 2): void {
    this.step('white', type)
    this.burst({ duration: 0.3, gain: 0.035, frequency: 520, sweepTo: 1500, q: 1.1, attack: 0.09, delay: 0.05 })
  }

  /** A piece arriving on its square. */
  impact(strength: number, type = 1): void {
    this.strike(type, 0.7 + strength * 0.8)
  }

  /**
   * Wood knocking wood, then the survivor settling. Two objects meeting is a
   * brighter, shorter sound than either of them landing alone.
   */
  capture(victim = 1, attacker = 1): void {
    const knock = this.voice(victim)
    this.burst({ duration: 0.026, gain: 0.2, frequency: 3400, sweepTo: 1100, q: 0.6, type: 'highpass' })
    this.partial(knock.fundamental * 1.22, 0.11, 0.055, 0)
    this.partial(knock.fundamental * 2.1, 0.06, 0.035, 0)
    // The captured piece tumbling out of the way.
    this.strike(victim, 0.5, 0.055, 1.15)
    // The attacker taking the square.
    this.strike(attacker, 1.05, 0.14)
  }

  /**
   * The queen's move is the one thing here that is not literal chess, so it
   * keeps a breath of air and shimmer — but built on the same wooden body, so
   * it still belongs on the board.
   */
  teleport(_side: SideKey): void {
    const voice = this.voice(5)
    this.step('white', 5)
    this.burst({ duration: 0.34, gain: 0.045, frequency: 1200, sweepTo: 3600, q: 2.4, attack: 0.16, delay: 0.04 })
    this.partial(voice.fundamental * 2, 0.03, 0.4, 0.06)
    this.partial(voice.fundamental * 3.02, 0.02, 0.34, 0.1)
  }

  /* --------------------------------------------------------- moments --- */

  /** Two firm knuckles on the board. */
  check(): void {
    this.knock(0)
    this.knock(0.11)
  }

  private knock(delay: number): void {
    this.burst({ duration: 0.02, gain: 0.13, frequency: 1800, sweepTo: 600, q: 0.7, type: 'highpass', delay })
    this.partial(196, 0.09, 0.1, delay)
    this.partial(196 * 1.61, 0.045, 0.06, delay)
  }

  /**
   * The clock, under the last ten seconds. Deliberately thin and dry: it has
   * to sit under everything else without ever being mistaken for a piece.
   */
  tick(): void {
    this.burst({ duration: 0.008, gain: 0.03, frequency: 5200, sweepTo: 2600, q: 1.2, type: 'highpass' })
    this.partial(1240, 0.016, 0.022, 0)
  }

  /** The flag falling: the lever lets go, then the weight of it lands. */
  flag(): void {
    this.burst({ duration: 0.012, gain: 0.06, frequency: 4200, sweepTo: 1200, q: 1, type: 'highpass' })
    this.partial(880, 0.035, 0.05, 0)
    this.strike(6, 0.8, 0.07, 0.75)
    this.partial(88, 0.07, 0.4, 0.09)
  }

  /** The king toppling: a run of strikes rolling over, then settling. */
  mate(): void {
    const rolls = 5
    let delay = 0
    for (let i = 0; i < rolls; i++) {
      // Each contact is closer and lower than the last, the way a falling
      // piece rocks to a stop.
      this.strike(6, 0.75 - i * 0.11, delay, 1 - i * 0.1)
      delay += 0.14 - i * 0.02
    }
    this.partial(96, 0.09, 0.5, delay)
    this.burst({ duration: 0.4, gain: 0.03, frequency: 320, sweepTo: 120, q: 0.9, delay })
  }

  /** A new piece taking the square: three rising taps and a soft ring. */
  promote(): void {
    this.strike(1, 0.5, 0, 1.1)
    this.strike(3, 0.6, 0.09, 1.05)
    this.strike(5, 0.95, 0.19)
    this.partial(523.25, 0.045, 0.5, 0.2)
    this.partial(783.99, 0.03, 0.42, 0.24)
  }

  /** Fingertip on a piece before lifting it. */
  select(): void {
    this.burst({ duration: 0.014, gain: 0.05, frequency: 3600, sweepTo: 1600, q: 0.9, type: 'highpass' })
    this.partial(640, 0.025, 0.035, 0)
  }

  /** A piece put back down where it came from. */
  deny(): void {
    this.burst({ duration: 0.03, gain: 0.06, frequency: 700, sweepTo: 240, q: 0.8, type: 'lowpass' })
    this.partial(150, 0.06, 0.09, 0)
  }

  destroy(): void {
    void this.context?.close()
    this.context = null
    this.master = null
  }
}
