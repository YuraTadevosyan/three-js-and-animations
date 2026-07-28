import type { DatasetMeta } from './types'

/**
 * The gallery index. Views are imported eagerly rather than lazily — the whole
 * app is a few hundred KB and a spinner between six local datasets would be
 * theatre.
 */
export const DATASETS: DatasetMeta[] = [
  {
    id: 'company',
    name: 'Company analytics',
    tagline: 'Three years of revenue across four product segments.',
    method:
      'Compounding trend × Q4 seasonality × an injected step change at the platform launch, plus fractal noise. The changepoint scan finds the step without being told where it is.',
    accent: 1,
    forms: ['Morphing chart', 'Stacked area', 'Ordinal funnel', 'Stat tiles'],
    live: false,
  },
  {
    id: 'stocks',
    name: 'Stock market',
    tagline: 'A full session of one-minute bars with volatility clustering.',
    method:
      'Geometric Brownian motion where sigma is itself mean-reverting, so calm stretches and violent ones alternate the way real tape does. Volume follows the U-shaped intraday curve.',
    accent: 2,
    forms: ['Candlesticks', 'Volume columns', 'Depth ladder', 'Live tape'],
    live: true,
  },
  {
    id: 'telemetry',
    name: 'Spacecraft telemetry',
    tagline: 'Eight subsystem channels streaming at 2 Hz.',
    method:
      'Each channel carries an orbital period, a slow drift term and sensor noise, plus real caution and limit thresholds — which is why these wear status colours, not series colours.',
    accent: 3,
    forms: ['Flowing strip chart', 'Meters', 'Orbit track', 'Status grid'],
    live: true,
  },
  {
    id: 'traffic',
    name: 'City traffic',
    tagline: 'A week of congestion across eight corridors.',
    method:
      'Twin commuter peaks on weekdays collapsing to one midday hump at the weekend, per-corridor commuter weighting, and a fixed ring-and-spoke road graph the vehicles animate along.',
    accent: 4,
    forms: ['Heatmap', 'Animated map', 'Emphasis bars', 'Incident log'],
    live: true,
  },
  {
    id: 'network',
    name: 'Network packets',
    tagline: 'A 38-node fabric with packets moving along the links.',
    method:
      'Core mesh, dual-homed edge gateways, client subnets, and one deliberately hot gateway. Positions come from a d3-force simulation; packets are integrated along each link per frame.',
    accent: 5,
    forms: ['Force graph', 'Flowing area', 'Stacked bar', 'Log-normal histogram'],
    live: true,
  },
  {
    id: 'climate',
    name: 'Climate',
    tagline: '126 years of temperature anomaly against a 1951–1980 baseline.',
    method:
      'Slow early warming, a mid-century aerosol plateau, then an accelerating modern trend, with ENSO-scale variability layered on top. The only dataset here that is genuinely diverging data.',
    accent: 8,
    forms: ['Diverging bars', 'Warming stripes', 'Radial cycle', 'Forecast band'],
    live: false,
  },
]

export function getDataset(id: string | undefined): DatasetMeta | undefined {
  return DATASETS.find((d) => d.id === id)
}
