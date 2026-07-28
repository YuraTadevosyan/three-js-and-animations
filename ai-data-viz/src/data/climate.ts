import { Rng, fbm1d } from '@/lib/rng'
import { dec, signed } from '@/lib/format'
import { changepoint, fitQuality, forecast, linearRegression, summarize, type Insight } from '@/lib/stats'

/**
 * Climate — 126 years of annual temperature anomaly against a 1951–1980 baseline.
 *
 * An anomaly is polarity data: the question is which side of the baseline a year
 * falls on. That makes it the one dataset here that takes the **diverging**
 * palette — two hues that read as opposite, with a neutral gray at zero, and
 * never a hue at the midpoint.
 */

export interface ClimateYear {
  year: number
  /** Temperature anomaly in °C vs the 1951–1980 mean. */
  anomaly: number
  co2: number
  seaLevelMm: number
}

export interface ClimateData {
  years: ClimateYear[]
  /** Mean monthly anomaly for the most recent decade, Jan → Dec. */
  seasonal: number[]
  /** Decadal means, for the small-multiple strip. */
  decades: { decade: number; mean: number }[]
  baselineStart: number
  baselineEnd: number
  insights: Insight[]
}

const START_YEAR = 1900
const END_YEAR = 2025

export function generateClimate(seed = 'climate'): ClimateData {
  const rng = new Rng(seed)
  const wave = fbm1d(`${seed}:variability`, 4)
  const enso = fbm1d(`${seed}:enso`, 2)

  const raw: { year: number; value: number; co2: number; sea: number }[] = []
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const t = year - START_YEAR
    // Slow early warming, a mid-century plateau from aerosol loading, then an
    // accelerating modern trend — the shape the real record actually has.
    const early = 0.0032 * t
    const modern = t > 75 ? 0.0138 * (t - 75) : 0
    const plateau = t > 40 && t < 78 ? -0.11 * Math.sin(((t - 40) / 38) * Math.PI) : 0
    const variability = (wave(t * 0.28) - 0.5) * 0.24
    const elNino = (enso(t * 0.9) - 0.5) * 0.16
    const value = early + modern + plateau + variability + elNino + rng.normal(0, 0.045)

    const co2 = 295 + 0.32 * t + 0.0125 * Math.max(0, t - 55) ** 1.62
    const sea = 0.9 * t + 0.011 * Math.max(0, t - 60) ** 2
    raw.push({ year, value, co2, sea })
  }

  // Re-centre on the 1951–1980 baseline, the way the published series is.
  const baselineStart = 1951
  const baselineEnd = 1980
  const baseline =
    summarize(raw.filter((r) => r.year >= baselineStart && r.year <= baselineEnd).map((r) => r.value)).mean

  const years: ClimateYear[] = raw.map((r) => ({
    year: r.year,
    anomaly: r.value - baseline,
    co2: r.co2,
    seaLevelMm: r.sea,
  }))

  const seasonRng = new Rng(`${seed}:seasonal`)
  const recentMean = summarize(years.slice(-10).map((y) => y.anomaly)).mean
  // Northern-hemisphere land warms fastest in winter — the cycle is not flat.
  const seasonal = Array.from({ length: 12 }, (_, m) => {
    const winterBias = Math.cos((m / 12) * Math.PI * 2) * 0.34
    return recentMean + winterBias + seasonRng.normal(0, 0.05)
  })

  const decades: { decade: number; mean: number }[] = []
  for (let d = 1900; d <= 2020; d += 10) {
    const slice = years.filter((y) => y.year >= d && y.year < d + 10)
    if (slice.length) decades.push({ decade: d, mean: summarize(slice.map((y) => y.anomaly)).mean })
  }

  return {
    years,
    seasonal,
    decades,
    baselineStart,
    baselineEnd,
    insights: analyse(years, decades),
  }
}

function analyse(years: ClimateYear[], decades: { decade: number; mean: number }[]): Insight[] {
  const out: Insight[] = []
  const anomalies = years.map((y) => y.anomaly)
  const last = years[years.length - 1]

  out.push({
    id: 'current',
    kind: 'summary',
    severity: last.anomaly > 1 ? 'critical' : last.anomaly > 0.5 ? 'serious' : 'warning',
    text: `${last.year} closes at ${signed(last.anomaly, 2)} °C against the 1951–1980 baseline.`,
    evidence: `CO₂ ${Math.round(last.co2)} ppm`,
  })

  const recent = anomalies.slice(-50)
  const fit = linearRegression(recent)
  out.push({
    id: 'trend',
    kind: 'trend',
    severity: 'serious',
    text: `The last fifty years warm at ${dec(fit.slope * 10, 2)} °C per decade — ${fitQuality(fit.r2)}.`,
    evidence: `R² ${fit.r2.toFixed(2)}`,
  })

  const cp = changepoint(anomalies, 20)
  if (cp) {
    out.push({
      id: 'changepoint',
      kind: 'changepoint',
      severity: 'warning',
      text: `The record changes regime around ${years[cp.index].year} — the mean anomaly steps from ${signed(cp.before, 2)} °C to ${signed(cp.after, 2)} °C.`,
      evidence: `CUSUM · Δ ${signed(cp.shift, 2)} °C`,
    })
  }

  const proj = forecast(recent, 25)
  const end = proj[proj.length - 1]
  out.push({
    id: 'forecast',
    kind: 'forecast',
    severity: 'critical',
    text: `Extending the fifty-year fit to 2050 gives ${signed(end.value, 2)} °C, with a 95% band of ${signed(end.lower, 2)} to ${signed(end.upper, 2)} °C.`,
    evidence: `linear extrapolation only`,
  })

  const warmest = [...years].sort((a, b) => b.anomaly - a.anomaly).slice(0, 10)
  const since2000 = warmest.filter((y) => y.year >= 2000).length
  out.push({
    id: 'ranking',
    kind: 'summary',
    severity: 'critical',
    text:
      since2000 === warmest.length
        ? `Every one of the ten warmest years in the ${years.length}-year record falls after 2000.`
        : `${since2000} of the ten warmest years in the ${years.length}-year record fall after 2000.`,
    evidence: `warmest ${warmest[0].year} at ${signed(warmest[0].anomaly, 2)} °C`,
  })

  const firstDecade = decades[0]
  const lastDecade = decades[decades.length - 1]
  out.push({
    id: 'decades',
    kind: 'trend',
    severity: 'serious',
    text: `Decadal means run from ${signed(firstDecade.mean, 2)} °C in the ${firstDecade.decade}s to ${signed(lastDecade.mean, 2)} °C in the ${lastDecade.decade}s.`,
    evidence: `${decades.length} decades`,
  })

  const negativeYears = years.filter((y) => y.anomaly < 0)
  const lastNegative = negativeYears[negativeYears.length - 1]
  if (lastNegative) {
    out.push({
      id: 'crossing',
      kind: 'changepoint',
      severity: 'warning',
      text: `The last year below the baseline was ${lastNegative.year}; every year since has sat on the warm side of zero.`,
      evidence: `${last.year - lastNegative.year} consecutive years`,
    })
  }

  return out
}
