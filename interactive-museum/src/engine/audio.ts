import type { AmbienceDef, RoomDef, RoomId } from '@/data/museum'
import { ROOMS } from '@/data/museum'

/**
 * The museum's sound, synthesized on the fly.
 *
 * Every room gets a bed — filtered noise plus a detuned drone stack — parked on
 * a PannerNode at the room's centre. The Web Audio listener rides the camera, so
 * walking a corridor cross-fades the two rooms either side of you for free, and
 * you can hear the next room through the doorway before you reach it.
 *
 * Nothing here loads a file. The reverb is a generated impulse response.
 */

const semitone = (base: number, n: number) => base * Math.pow(2, n / 12)

interface RoomBed {
  id: RoomId
  gain: GainNode
  filter: BiquadFilterNode
  panner: PannerNode
  /** Drives the slow filter drift. */
  drift: number
  driftPhase: number
  baseCutoff: number
  /** Ambient one-shot scheduling. */
  nextBellAt: number
  tickAccumulator: number
  def: AmbienceDef
}

export class MuseumAudio {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private convolver!: ConvolverNode
  private wet!: GainNode
  private noiseBuffer!: AudioBuffer
  private beds = new Map<RoomId, RoomBed>()
  private currentRoom: RoomId = 'entrance'
  private started = false
  private muted = false
  private stepPhase = 0

  get isRunning() {
    return this.started && this.ctx?.state === 'running'
  }

  /** Must be called from a user gesture — browsers will not start audio otherwise. */
  async start() {
    if (this.started) {
      await this.ctx?.resume()
      return
    }

    const Ctor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return

    const ctx = new Ctor()
    this.ctx = ctx
    this.started = true

    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(ctx.destination)

    this.convolver = ctx.createConvolver()
    this.convolver.buffer = this.makeImpulseResponse(2.9, 2.4)
    this.wet = ctx.createGain()
    this.wet.gain.value = 0.32
    this.convolver.connect(this.wet)
    this.wet.connect(this.master)

    this.noiseBuffer = this.makeNoiseBuffer(4)

    for (const room of ROOMS) this.beds.set(room.id, this.buildBed(room))
    // Beds are built at a neutral level; open up whichever room we start in.
    this.applyRoomMix(this.currentRoom, 0)

    await ctx.resume()
    // Fade the museum up rather than slamming it on.
    this.master.gain.setValueAtTime(0, ctx.currentTime)
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 1, ctx.currentTime + 2.2)
  }

  /* ---------------------------------------------------------------- *
   * Buffers
   * ---------------------------------------------------------------- */

  /** Exponentially decaying noise — a serviceable large-room impulse response. */
  private makeImpulseResponse(seconds: number, decay: number): AudioBuffer {
    const ctx = this.ctx!
    const length = Math.floor(ctx.sampleRate * seconds)
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < length; i++) {
        const t = i / length
        // A touch of early-reflection sparseness before the tail smooths out.
        const sparse = t < 0.08 && Math.random() > 0.86 ? 3.2 : 1
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * sparse
      }
    }
    return buffer
  }

  private makeNoiseBuffer(seconds: number): AudioBuffer {
    const ctx = this.ctx!
    const length = Math.floor(ctx.sampleRate * seconds)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    // Brown-ish noise: gentler on the ear than white for a long ambient bed.
    let last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    return buffer
  }

  /* ---------------------------------------------------------------- *
   * Room beds
   * ---------------------------------------------------------------- */

  private buildBed(room: RoomDef): RoomBed {
    const ctx = this.ctx!
    const def = room.ambience

    const panner = ctx.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'linear'
    panner.refDistance = Math.max(room.size.w, room.size.d) * 0.4
    panner.maxDistance = Math.max(room.size.w, room.size.d) * 1.5
    panner.rolloffFactor = 1
    panner.positionX.value = room.center.x
    panner.positionY.value = room.height * 0.4
    panner.positionZ.value = room.center.z

    const gain = ctx.createGain()
    gain.gain.value = 0.28
    gain.connect(panner)
    panner.connect(this.master)
    panner.connect(this.convolver)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = def.noiseCutoffHz
    filter.Q.value = 0.9
    filter.connect(gain)

    // Filtered noise bed.
    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseBuffer
    noise.loop = true
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = def.noiseLevel
    noise.connect(noiseGain)
    noiseGain.connect(filter)
    noise.start()

    // Drone stack, slightly detuned so it never sits perfectly still.
    def.harmonics.forEach((offset, i) => {
      const osc = ctx.createOscillator()
      osc.type = i === 0 ? 'sine' : 'triangle'
      osc.frequency.value = semitone(def.droneHz, offset)
      osc.detune.value = (i - def.harmonics.length / 2) * 4
      const g = ctx.createGain()
      g.gain.value = def.droneLevel / (i + 1.4)
      osc.connect(g)
      g.connect(filter)
      osc.start()

      // Independent slow tremolo per partial.
      const lfo = ctx.createOscillator()
      lfo.frequency.value = def.driftHz * (1 + i * 0.37)
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = g.gain.value * 0.45
      lfo.connect(lfoGain)
      lfoGain.connect(g.gain)
      lfo.start()
    })

    return {
      id: room.id,
      gain,
      filter,
      panner,
      drift: def.driftHz,
      driftPhase: Math.random() * Math.PI * 2,
      baseCutoff: def.noiseCutoffHz,
      nextBellAt: 0,
      tickAccumulator: 0,
      def,
    }
  }

  /* ---------------------------------------------------------------- *
   * Per-frame
   * ---------------------------------------------------------------- */

  setListener(px: number, py: number, pz: number, fx: number, fy: number, fz: number) {
    const ctx = this.ctx
    if (!ctx) return
    const l = ctx.listener
    const t = ctx.currentTime

    if (l.positionX) {
      l.positionX.setTargetAtTime(px, t, 0.02)
      l.positionY.setTargetAtTime(py, t, 0.02)
      l.positionZ.setTargetAtTime(pz, t, 0.02)
      l.forwardX.setTargetAtTime(fx, t, 0.02)
      l.forwardY.setTargetAtTime(fy, t, 0.02)
      l.forwardZ.setTargetAtTime(fz, t, 0.02)
      l.upX.setTargetAtTime(0, t, 0.02)
      l.upY.setTargetAtTime(1, t, 0.02)
      l.upZ.setTargetAtTime(0, t, 0.02)
    } else {
      // Safari's older listener interface.
      const legacy = l as unknown as {
        setPosition: (x: number, y: number, z: number) => void
        setOrientation: (fx: number, fy: number, fz: number, ux: number, uy: number, uz: number) => void
      }
      legacy.setPosition?.(px, py, pz)
      legacy.setOrientation?.(fx, fy, fz, 0, 1, 0)
    }
  }

  setRoom(id: RoomId) {
    if (id === this.currentRoom) return
    this.currentRoom = id
    this.applyRoomMix(id, 0.9)
  }

  /**
   * The room you are in opens up; its neighbours stay audible but recede, so a
   * doorway still leaks the next room's bed rather than gating it shut.
   */
  private applyRoomMix(id: RoomId, timeConstant: number) {
    const ctx = this.ctx
    if (!ctx) return
    for (const bed of this.beds.values()) {
      const target = bed.id === id ? 0.32 : 0.12
      if (timeConstant > 0) bed.gain.gain.setTargetAtTime(target, ctx.currentTime, timeConstant)
      else bed.gain.gain.value = target
    }
  }

  update(dt: number) {
    const ctx = this.ctx
    if (!ctx || this.muted) return

    for (const bed of this.beds.values()) {
      bed.driftPhase += dt * bed.drift * Math.PI * 2
      const drifted = bed.baseCutoff * (1 + Math.sin(bed.driftPhase) * 0.45)
      bed.filter.frequency.setTargetAtTime(drifted, ctx.currentTime, 0.25)

      if (bed.id !== this.currentRoom) continue

      if (bed.def.tick) {
        bed.tickAccumulator += dt
        const period = 60 / bed.def.tick.bpm
        if (bed.tickAccumulator >= period) {
          bed.tickAccumulator -= period
          this.tick(bed)
        }
      }

      if (bed.def.bells) {
        const now = ctx.currentTime
        if (bed.nextBellAt === 0) bed.nextBellAt = now + 1.5
        if (now >= bed.nextBellAt) {
          const { scale, everyMs, level } = bed.def.bells
          const note = scale[Math.floor(Math.random() * scale.length)]
          this.bell(semitone(bed.def.droneHz * 8, note), level, 3.4)
          bed.nextBellAt = now + (everyMs[0] + Math.random() * (everyMs[1] - everyMs[0])) / 1000
        }
      }
    }
  }

  /* ---------------------------------------------------------------- *
   * One-shots
   * ---------------------------------------------------------------- */

  /** A struck partial stack — used for the skills room and the discovery sting. */
  bell(freq: number, level = 0.1, decay = 2.6) {
    const ctx = this.ctx
    if (!ctx || this.muted) return
    const t = ctx.currentTime
    const out = ctx.createGain()
    out.gain.value = 1
    out.connect(this.master)
    out.connect(this.convolver)

    // Inharmonic partials are what make it read as struck metal rather than a sine.
    ;[1, 2.01, 3.03, 4.72].forEach((ratio, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq * ratio
      const g = ctx.createGain()
      const amp = (level / (i + 1)) * (i === 0 ? 1 : 0.55)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(amp, t + 0.004)
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay / (i * 0.6 + 1))
      osc.connect(g)
      g.connect(out)
      osc.start(t)
      osc.stop(t + decay + 0.1)
    })

    setTimeout(() => out.disconnect(), (decay + 0.3) * 1000)
  }

  /** Dry wooden tick for the timeline hall. */
  private tick(bed: RoomBed) {
    const ctx = this.ctx!
    const t = ctx.currentTime
    const level = bed.def.tick?.level ?? 0.05

    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.loop = true
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1800
    bp.Q.value = 7
    const g = ctx.createGain()
    g.gain.setValueAtTime(level, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)

    src.connect(bp)
    bp.connect(g)
    g.connect(this.master)
    g.connect(this.convolver)
    src.start(t, Math.random() * 3)
    src.stop(t + 0.12)
  }

  /** Footfall — pitch alternates so it reads as two feet, not one. */
  footstep(speed: number) {
    const ctx = this.ctx
    if (!ctx || this.muted) return
    const t = ctx.currentTime
    this.stepPhase = 1 - this.stepPhase

    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.loop = true
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 240 + this.stepPhase * 90
    bp.Q.value = 1.6
    const g = ctx.createGain()
    const level = 0.05 + speed * 0.03
    g.gain.setValueAtTime(level, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)

    src.connect(bp)
    bp.connect(g)
    g.connect(this.master)
    g.connect(this.convolver)
    src.start(t, Math.random() * 3)
    src.stop(t + 0.2)
  }

  /** Rising two-note figure when a secret is found. */
  discoverySting() {
    const ctx = this.ctx
    if (!ctx || this.muted) return
    this.bell(523.25, 0.13, 3.2)
    setTimeout(() => this.bell(783.99, 0.11, 4.4), 190)
    setTimeout(() => this.bell(1046.5, 0.08, 5.2), 420)
  }

  /** The bell in Room VI — deep, long, and it wakes the whole building. */
  ringBell() {
    const ctx = this.ctx
    if (!ctx || this.muted) return
    this.bell(174.61, 0.22, 7.5)
    setTimeout(() => this.bell(261.63, 0.12, 6.5), 60)
    setTimeout(() => this.bell(349.23, 0.07, 5.5), 140)
  }

  /** Soft confirmation when an exhibit takes focus. */
  chime(freq = 880) {
    this.bell(freq, 0.05, 1.9)
  }

  setMuted(muted: boolean) {
    this.muted = muted
    const ctx = this.ctx
    if (!ctx) return
    this.master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.25)
  }

  /** Room V's payoff: open the reverb right up for a moment. */
  swell() {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    this.wet.gain.cancelScheduledValues(t)
    this.wet.gain.setValueAtTime(this.wet.gain.value, t)
    this.wet.gain.linearRampToValueAtTime(0.85, t + 0.4)
    this.wet.gain.linearRampToValueAtTime(0.32, t + 5)
  }

  dispose() {
    this.ctx?.close()
    this.ctx = null
    this.started = false
  }
}
