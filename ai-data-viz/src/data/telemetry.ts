import { Rng, fbm1d } from '@/lib/rng'
import { elapsed, dec } from '@/lib/format'
import { linearRegression, severityForZ, topAnomaly, type Insight } from '@/lib/stats'

/**
 * Spacecraft telemetry — eight subsystem channels streaming at 2 Hz.
 *
 * Channels carry real thresholds (caution / limit), so their colour comes from
 * the status scale rather than the categorical slots: here the value genuinely
 * means good-to-critical, and a status colour must never stand in for "series 4".
 */

export type ChannelState = 'nominal' | 'caution' | 'limit'

export interface Channel {
  key: string
  label: string
  unit: string
  /** Ring buffer of samples, oldest first. */
  history: number[]
  min: number
  max: number
  /** Absolute deviation from `nominal` at which the channel goes to caution. */
  caution: number
  /** …and at which it breaches its limit. */
  limit: number
  nominal: number
}

export interface Vehicle {
  name: string
  designation: string
  /** Seconds since launch. */
  met: number
  altitudeKm: number
  velocityMs: number
  /** True anomaly along the orbit, in radians. */
  theta: number
  eccentricity: number
}

export interface TelemetryData {
  vehicle: Vehicle
  channels: Channel[]
  insights: Insight[]
}

export const HISTORY = 240

interface ChannelSpec {
  key: string
  label: string
  unit: string
  nominal: number
  swing: number
  caution: number
  limit: number
  period: number
  /**
   * A slow one-way bias, in multiples of `caution`, ramped in over the window
   * and then held. Two channels carry one deliberately: a console where every
   * light is green never shows what the status scale is *for*, and gives the
   * anomaly scan nothing to find.
   */
  bias?: number
}

const SPECS: ChannelSpec[] = [
  { key: 'bus', label: 'Main bus voltage', unit: 'V', nominal: 28.4, swing: 0.35, caution: 0.8, limit: 1.4, period: 41 },
  { key: 'array', label: 'Solar array current', unit: 'A', nominal: 18.2, swing: 2.4, caution: 4.5, limit: 7.0, period: 73 },
  { key: 'wheel', label: 'Reaction wheel', unit: 'krpm', nominal: 4.6, swing: 0.42, caution: 1.1, limit: 1.8, period: 29 },
  { key: 'thermal', label: 'Radiator temp', unit: '°C', nominal: -12.5, swing: 3.1, caution: 7.5, limit: 12.0, period: 97, bias: 1.22 },
  { key: 'prop', label: 'Propellant press.', unit: 'bar', nominal: 21.8, swing: 0.28, caution: 0.9, limit: 1.6, period: 137 },
  { key: 'snr', label: 'Downlink SNR', unit: 'dB', nominal: 14.7, swing: 1.9, caution: 3.6, limit: 5.4, period: 53 },
  { key: 'gyro', label: 'Gyro drift', unit: 'mdeg/s', nominal: 0.42, swing: 0.09, caution: 0.22, limit: 0.38, period: 61, bias: -1.06 },
  { key: 'cpu', label: 'Flight CPU load', unit: '%', nominal: 46, swing: 7.5, caution: 22, limit: 34, period: 47 },
]

export function generateTelemetry(seed = 'spacecraft-telemetry'): TelemetryData {
  const channels = SPECS.map((spec) => {
    const wave = fbm1d(`${seed}:${spec.key}`, 3)
    const rng = new Rng(`${seed}:${spec.key}:noise`)
    const history: number[] = []
    for (let i = 0; i < HISTORY; i++) {
      history.push(sample(spec, wave, rng, i))
    }
    return {
      key: spec.key,
      label: spec.label,
      unit: spec.unit,
      history,
      nominal: spec.nominal,
      caution: spec.caution,
      limit: spec.limit,
      min: spec.nominal - spec.limit * 1.35,
      max: spec.nominal + spec.limit * 1.35,
    } satisfies Channel
  })

  const vehicle: Vehicle = {
    name: 'Meridian',
    designation: 'MRD-7 · LEO insertion',
    met: 15_158,
    altitudeKm: 412.6,
    velocityMs: 7_664,
    theta: 0.9,
    eccentricity: 0.31,
  }

  return { vehicle, channels, insights: analyse(vehicle, channels) }
}

function sample(spec: ChannelSpec, wave: (x: number) => number, rng: Rng, i: number): number {
  const orbital = Math.sin((i / spec.period) * Math.PI * 2) * spec.swing
  const drift = (wave(i * 0.06) - 0.5) * spec.swing * 1.4
  // The bias ramps in across one window and then holds, so a live stream
  // settles into its excursion instead of running away.
  const bias = spec.bias ? spec.caution * spec.bias * Math.min(1, i / HISTORY) : 0
  return spec.nominal + orbital + drift + bias + rng.normal(0, spec.swing * 0.16)
}

/**
 * Noise fields for the live stream, built once per channel.
 *
 * `fbm1d` allocates three 512-entry tables per call, so building them inside the
 * step loop would mean thousands of table allocations a second at 10 Hz.
 */
const LIVE_WAVES = new Map<string, (x: number) => number>()
function liveWave(key: string): (x: number) => number {
  let wave = LIVE_WAVES.get(key)
  if (!wave) {
    wave = fbm1d(`live:${key}`, 3)
    LIVE_WAVES.set(key, wave)
  }
  return wave
}

const SPEC_BY_KEY = new Map(SPECS.map((s) => [s.key, s]))

/** Advances every channel by one sample and shifts the ring buffers. */
export function stepTelemetry(data: TelemetryData, rng: Rng, tick: number): void {
  data.vehicle.met += 0.5
  data.vehicle.theta = (data.vehicle.theta + 0.0042) % (Math.PI * 2)
  data.vehicle.altitudeKm = 412.6 + Math.sin(data.vehicle.theta) * 8.4
  data.vehicle.velocityMs = 7664 - Math.sin(data.vehicle.theta) * 46

  for (const ch of data.channels) {
    const spec = SPEC_BY_KEY.get(ch.key)!
    const prev = ch.history[ch.history.length - 1]
    const target = sample(spec, liveWave(ch.key), rng, tick)
    // Ease toward the target so the strip chart flows instead of jittering.
    const next = prev + (target - prev) * 0.18 + rng.normal(0, spec.swing * 0.05)
    ch.history.push(next)
    if (ch.history.length > HISTORY) ch.history.shift()
  }
}

export function channelState(ch: Channel, value = ch.history[ch.history.length - 1]): ChannelState {
  const dev = Math.abs(value - ch.nominal)
  if (dev >= ch.limit) return 'limit'
  if (dev >= ch.caution) return 'caution'
  return 'nominal'
}

function analyse(vehicle: Vehicle, channels: Channel[]): Insight[] {
  const out: Insight[] = []

  out.push({
    id: 'met',
    kind: 'summary',
    severity: 'info',
    text: `${vehicle.name} is ${elapsed(vehicle.met)} into the mission at ${dec(vehicle.altitudeKm, 1)} km, tracking ${Math.round(vehicle.velocityMs).toLocaleString('en-US')} m/s.`,
    evidence: vehicle.designation,
  })

  const breached = channels.filter((c) => channelState(c) !== 'nominal')
  out.push({
    id: 'health',
    kind: 'summary',
    severity: breached.length === 0 ? 'good' : breached.some((c) => channelState(c) === 'limit') ? 'critical' : 'warning',
    text:
      breached.length === 0
        ? `All ${channels.length} subsystem channels are inside their caution envelopes.`
        : `${breached.length} of ${channels.length} channels sit outside the caution envelope: ${breached.map((c) => c.label).join(', ')}.`,
    evidence: `${channels.length - breached.length}/${channels.length} nominal`,
  })

  for (const ch of channels) {
    const anomaly = topAnomaly(ch.history, 48, 2.8)
    if (!anomaly) continue
    out.push({
      id: `anom-${ch.key}`,
      kind: 'anomaly',
      severity: severityForZ(anomaly.z),
      text: `${ch.label} excursion detected — ${dec(anomaly.value, 2)} ${ch.unit} against a 48-sample rolling baseline.`,
      evidence: `z ${anomaly.z >= 0 ? '+' : '−'}${Math.abs(anomaly.z).toFixed(1)}σ`,
    })
    if (out.length > 5) break
  }

  // Which channel is closest to its limit, and how long until it gets there.
  const drifting = channels
    .map((ch) => {
      const fit = linearRegression(ch.history)
      const headroom = ch.limit - Math.abs(ch.history[ch.history.length - 1] - ch.nominal)
      const perSample = Math.abs(fit.slope)
      return { ch, fit, headroom, samples: perSample > 1e-6 ? headroom / perSample : Infinity }
    })
    .sort((a, b) => a.samples - b.samples)[0]

  if (drifting && Number.isFinite(drifting.samples) && drifting.samples < 4000) {
    const seconds = drifting.samples * 0.5
    out.push({
      id: 'projection',
      kind: 'forecast',
      severity: seconds < 300 ? 'serious' : 'warning',
      text: `${drifting.ch.label} is the nearest channel to its limit — at the current slope it reaches the envelope in about ${formatDuration(seconds)}.`,
      evidence: `R² ${drifting.fit.r2.toFixed(2)} · ${dec(drifting.headroom, 2)} ${drifting.ch.unit} headroom`,
    })
  }

  return out
}

function formatDuration(seconds: number): string {
  if (seconds < 90) return `${Math.round(seconds)} s`
  if (seconds < 5400) return `${Math.round(seconds / 60)} min`
  return `${(seconds / 3600).toFixed(1)} h`
}
