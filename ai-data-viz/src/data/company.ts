import { Rng, fbm1d } from '@/lib/rng'
import {
  cagr,
  changepoint,
  fitQuality,
  forecast,
  linearRegression,
  pctChange,
  topAnomaly,
  type Insight,
} from '@/lib/stats'
import { compact, fmtMonth, money, signedPct } from '@/lib/format'

/**
 * Company analytics — 36 months of revenue across four product segments.
 *
 * The generator layers a compounding trend, a Q4 seasonal bump, a step change
 * at a "platform launch" month, and noise. The step is deliberate: it gives the
 * CUSUM changepoint scan something real to find.
 */

export const SEGMENTS = ['Cloud', 'Devices', 'Services', 'Licensing'] as const
export type Segment = (typeof SEGMENTS)[number]

export interface CompanyMonth {
  date: Date
  /** Revenue per segment, index-aligned with SEGMENTS. */
  segments: number[]
  total: number
  accounts: number
  /** Net revenue churn as a fraction, e.g. 0.021. */
  churn: number
  nps: number
}

export interface FunnelStage {
  stage: string
  count: number
}

export interface CompanyData {
  months: CompanyMonth[]
  funnel: FunnelStage[]
  /** The month index where the launch step was injected — for the analyst to find. */
  launchIndex: number
  insights: Insight[]
}

const MONTH_COUNT = 36
/** Anchored so the demo is reproducible: the series always ends June 2026. */
const END = Date.UTC(2026, 5, 1)

/** Per-segment base revenue, monthly growth rate, and seasonal amplitude. */
const SEGMENT_MODEL = [
  { base: 4_200_000, growth: 0.028, seasonal: 0.06, noise: 0.05 },
  { base: 2_600_000, growth: 0.009, seasonal: 0.22, noise: 0.09 },
  { base: 1_800_000, growth: 0.019, seasonal: 0.04, noise: 0.06 },
  { base: 1_150_000, growth: 0.004, seasonal: 0.03, noise: 0.04 },
]

export function generateCompany(seed = 'company-analytics'): CompanyData {
  const rng = new Rng(seed)
  const wobble = fbm1d(`${seed}:wobble`, 4)
  const launchIndex = 22

  const months: CompanyMonth[] = []
  for (let i = 0; i < MONTH_COUNT; i++) {
    const date = new Date(END)
    date.setUTCMonth(date.getUTCMonth() - (MONTH_COUNT - 1 - i))
    const month = date.getUTCMonth()

    const segments = SEGMENT_MODEL.map((m, s) => {
      const trend = m.base * (1 + m.growth) ** i
      // Q4 is the enterprise buying season; Devices feels it hardest.
      const season = 1 + m.seasonal * Math.sin(((month - 8) / 12) * Math.PI * 2)
      const organic = 1 + (wobble(i * 0.7 + s * 13) - 0.5) * m.noise * 2
      // Cloud steps up when the platform ships; the rest are unaffected.
      const step = s === 0 && i >= launchIndex ? 1.19 : 1
      return trend * season * organic * step
    })

    const total = segments.reduce((a, b) => a + b, 0)
    months.push({
      date,
      segments,
      total,
      accounts: Math.round(1180 * 1.021 ** i + rng.normal(0, 22)),
      churn: Math.max(0.004, 0.026 - i * 0.00035 + rng.normal(0, 0.0022)),
      nps: Math.round(Math.min(72, 38 + i * 0.55 + rng.normal(0, 3))),
    })
  }

  // A funnel is ordinal — the stages have an order — so the view gives it the
  // one-hue ordinal ramp rather than four categorical identities.
  const visitors = 184_000
  const funnel: FunnelStage[] = [
    { stage: 'Visited', count: visitors },
    { stage: 'Signed up', count: Math.round(visitors * 0.213) },
    { stage: 'Activated', count: Math.round(visitors * 0.118) },
    { stage: 'Subscribed', count: Math.round(visitors * 0.041) },
    { stage: 'Expanded', count: Math.round(visitors * 0.014) },
  ]

  return { months, funnel, launchIndex, insights: analyse(months, launchIndex) }
}

function analyse(months: CompanyMonth[], launchIndex: number): Insight[] {
  const totals = months.map((m) => m.total)
  const cloud = months.map((m) => m.segments[0])
  const devices = months.map((m) => m.segments[1])
  const out: Insight[] = []

  const fit = linearRegression(totals)
  const growth = cagr(totals[0], totals[totals.length - 1], totals.length - 1)
  out.push({
    id: 'trend',
    kind: 'trend',
    severity: growth > 0 ? 'good' : 'warning',
    text: `Total revenue is compounding at ${signedPct(growth)} per month across the 36-month window — ${fitQuality(fit.r2)}.`,
    evidence: `R² ${fit.r2.toFixed(2)}`,
  })

  const cp = changepoint(cloud)
  if (cp) {
    out.push({
      id: 'changepoint',
      kind: 'changepoint',
      severity: cp.shift > 0 ? 'good' : 'serious',
      text: `Cloud revenue changes regime at ${fmtMonth(months[cp.index].date)} — the mean steps from ${money(cp.before)} to ${money(cp.after)} per month.`,
      evidence: `CUSUM · idx ${cp.index}${cp.index === launchIndex ? ' (launch)' : ''}`,
    })
  }

  const anomaly = topAnomaly(devices, 12, 2.2)
  if (anomaly) {
    out.push({
      id: 'anomaly',
      kind: 'anomaly',
      severity: anomaly.z > 0 ? 'info' : 'warning',
      text: `Devices deviates from its trailing baseline in ${fmtMonth(months[anomaly.index].date)}, ${anomaly.z > 0 ? 'above' : 'below'} the 12-month mean.`,
      evidence: `z ${anomaly.z >= 0 ? '+' : '−'}${Math.abs(anomaly.z).toFixed(1)}σ`,
    })
  }

  const proj = forecast(totals, 6)
  const last = proj[proj.length - 1]
  out.push({
    id: 'forecast',
    kind: 'forecast',
    severity: 'info',
    text: `Six-month projection lands at ${money(last.value)} per month, with a 95% band of ${money(last.lower)} to ${money(last.upper)}.`,
    evidence: `OLS + widening band`,
  })

  const churnNow = months[months.length - 1].churn
  const churnThen = months[0].churn
  out.push({
    id: 'churn',
    kind: 'summary',
    severity: churnNow < churnThen ? 'good' : 'serious',
    text: `Net revenue churn moved from ${(churnThen * 100).toFixed(1)}% to ${(churnNow * 100).toFixed(1)}% over the window.`,
    evidence: `${signedPct(pctChange(churnThen, churnNow))} relative`,
  })

  const share = cloud[cloud.length - 1] / totals[totals.length - 1]
  out.push({
    id: 'mix',
    kind: 'summary',
    severity: share > 0.5 ? 'warning' : 'info',
    text: `Cloud now carries ${(share * 100).toFixed(0)}% of the revenue mix — ${share > 0.5 ? 'concentration risk worth watching' : 'the mix stays diversified'}.`,
    evidence: `${compact(cloud[cloud.length - 1])} of ${compact(totals[totals.length - 1])}`,
  })

  return out
}
