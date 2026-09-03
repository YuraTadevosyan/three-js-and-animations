/**
 * A Web Audio API that records instead of playing.
 *
 * Sound cannot be reviewed by reading the code, but its *shape* can be
 * measured: how fast each strike attacks, how long it rings, how many separate
 * contacts a capture makes, whether a king really is voiced lower than a pawn.
 * This captures every oscillator and noise burst the synth schedules so those
 * properties can be asserted.
 */
export interface Point {
  time: number
  value: number
}

export interface Voice {
  kind: 'tone' | 'noise'
  /** Hz at the moment it starts. */
  frequency: number
  /** Filter target for noise sweeps. */
  sweepTo: number | null
  start: number
  stop: number
  envelope: Point[]
}

class Param {
  points: Point[] = []
  private current = 0

  constructor(initial = 0) {
    this.current = initial
  }

  get value(): number {
    return this.current
  }

  set value(next: number) {
    this.current = next
  }

  setValueAtTime(value: number, time: number): this {
    this.points.push({ time, value })
    this.current = value
    return this
  }

  exponentialRampToValueAtTime(value: number, time: number): this {
    this.points.push({ time, value })
    this.current = value
    return this
  }

  linearRampToValueAtTime(value: number, time: number): this {
    return this.exponentialRampToValueAtTime(value, time)
  }
}

class Node {
  out: Node | null = null
  gain = new Param(1)
  frequency = new Param(0)
  Q = new Param(1)
  detune = new Param(0)
  playbackRate = new Param(1)
  type = ''
  buffer: unknown = null

  connect(target: Node): Node {
    this.out = target
    return target
  }

  disconnect(): void {
    this.out = null
  }

  /** First gain envelope downstream — the amplitude this voice is played at. */
  envelope(): Point[] {
    let node: Node | null = this.out
    while (node) {
      if (node.gain.points.length) return node.gain.points
      node = node.out
    }
    return []
  }

  /** First filter downstream, for noise bursts. */
  filter(): Node | null {
    let node: Node | null = this.out
    while (node) {
      if (node.frequency.points.length) return node
      node = node.out
    }
    return null
  }
}

export class Recorder {
  voices: Voice[] = []

  reset(): void {
    this.voices = []
  }

  /** Voices grouped into clusters that start within `gap` seconds. */
  clusters(gap = 0.035): Voice[][] {
    const sorted = [...this.voices].sort((a, b) => a.start - b.start)
    const out: Voice[][] = []
    for (const voice of sorted) {
      const last = out[out.length - 1]
      if (last && voice.start - last[0]!.start <= gap) last.push(voice)
      else out.push([voice])
    }
    return out
  }
}

export function installFakeAudio(): Recorder {
  const recorder = new Recorder()

  class FakeContext {
    currentTime = 0
    sampleRate = 48000
    state = 'running'
    destination = new Node()

    createGain(): Node {
      return new Node()
    }

    createBiquadFilter(): Node {
      return new Node()
    }

    createBuffer(_channels: number, length: number): { getChannelData: () => Float32Array } {
      const data = new Float32Array(length)
      return { getChannelData: () => data }
    }

    createOscillator(): Node & { start(t: number): void; stop(t: number): void } {
      const node = new Node() as Node & { start(t: number): void; stop(t: number): void; _voice?: Voice }
      node.start = (time: number) => {
        const voice: Voice = {
          kind: 'tone',
          frequency: node.frequency.points[0]?.value ?? node.frequency.value,
          sweepTo: null,
          start: time,
          stop: time,
          envelope: node.envelope(),
        }
        node._voice = voice
        recorder.voices.push(voice)
      }
      node.stop = (time: number) => {
        if (node._voice) node._voice.stop = time
      }
      return node
    }

    createBufferSource(): Node & { start(t: number, offset?: number, duration?: number): void; stop(t: number): void } {
      const node = new Node() as Node & {
        start(t: number, offset?: number, duration?: number): void
        stop(t: number): void
        _voice?: Voice
      }
      node.start = (time: number) => {
        const filter = node.filter()
        const voice: Voice = {
          kind: 'noise',
          frequency: filter?.frequency.points[0]?.value ?? 0,
          sweepTo: filter && filter.frequency.points.length > 1 ? filter.frequency.points[1]!.value : null,
          start: time,
          stop: time,
          envelope: node.envelope(),
        }
        node._voice = voice
        recorder.voices.push(voice)
      }
      node.stop = (time: number) => {
        if (node._voice) node._voice.stop = time
      }
      return node
    }

    resume(): Promise<void> {
      return Promise.resolve()
    }

    close(): Promise<void> {
      return Promise.resolve()
    }
  }

  const globals = globalThis as Record<string, unknown>
  const existing = (globals.window as Record<string, unknown> | undefined) ?? {}
  globals.window = { ...existing, AudioContext: FakeContext }
  return recorder
}
