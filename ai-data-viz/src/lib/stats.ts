import { deviation, max, mean, min, quantile } from 'd3-array'

/**
 * The statistics behind the "AI analyst".
 *
 * Nothing here calls a model. Every line the analyst panel prints is derived
 * from one of these functions running over the generated series — ordinary
 * least squares, rolling z-scores, a CUSUM changepoint scan, autocorrelation.
 * The framing is the fiction; the numbers are real, which is why they hold up
 * when you cross-check them against the chart.
 */

export interface Regression {
  slope: number
  intercept: number
  r2: number
  /** Standard error of the residuals — the half-width unit for a forecast band. */
  se: number
  predict: (x: number) => number
}

export function linearRegression(ys: readonly number[], xs?: readonly number[]): Regression {
  const n = ys.length
  if (n < 2) {
    const c = ys[0] ?? 0
    return { slope: 0, intercept: c, r2: 0, se: 0, predict: () => c }
  }
  const x = xs ?? ys.map((_, i) => i)
  const mx = mean(x) as number
  const my = mean(ys) as number
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (ys[i] - my)
    sxx += (x[i] - mx) ** 2
  }
  const slope = sxx === 0 ? 0 : sxy / sxx
  const intercept = my - slope * mx
  const predict = (v: number) => intercept + slope * v

  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i++) {
    ssRes += (ys[i] - predict(x[i])) ** 2
    ssTot += (ys[i] - my) ** 2
  }
  return {
    slope,
    intercept,
    r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot,
    se: Math.sqrt(ssRes / Math.max(1, n - 2)),
    predict,
  }
}

export interface ForecastPoint {
  x: number
  value: number
  lower: number
  upper: number
}

/**
 * Projects the fitted line forward. The band widens with distance from the last
 * observation — a flat band would claim a confidence the fit doesn't have.
 */
export function forecast(ys: readonly number[], horizon: number, z = 1.96): ForecastPoint[] {
  const fit = linearRegression(ys)
  const n = ys.length
  const out: ForecastPoint[] = []
  for (let h = 1; h <= horizon; h++) {
    const x = n - 1 + h
    const value = fit.predict(x)
    const widen = fit.se * z * Math.sqrt(1 + h / Math.max(1, n))
    out.push({ x, value, lower: value - widen, upper: value + widen })
  }
  return out
}

export function movingAverage(ys: readonly number[], window: number): (number | null)[] {
  const out: (number | null)[] = []
  let sum = 0
  for (let i = 0; i < ys.length; i++) {
    sum += ys[i]
    if (i >= window) sum -= ys[i - window]
    out.push(i >= window - 1 ? sum / window : null)
  }
  return out
}

export interface Anomaly {
  index: number
  value: number
  z: number
}

/**
 * Rolling z-score outlier scan. The baseline is the trailing window only, so a
 * spike never gets to inflate the sigma it is being judged against.
 */
export function anomalies(ys: readonly number[], window = 24, threshold = 3): Anomaly[] {
  const out: Anomaly[] = []
  for (let i = window; i < ys.length; i++) {
    const slice = ys.slice(i - window, i)
    const mu = mean(slice) as number
    const sd = (deviation(slice) as number) || 0
    if (sd < 1e-9) continue
    const z = (ys[i] - mu) / sd
    if (Math.abs(z) >= threshold) out.push({ index: i, value: ys[i], z })
  }
  return out
}

/** The single strongest outlier, or null when the series behaves itself. */
export function topAnomaly(ys: readonly number[], window = 24, threshold = 3): Anomaly | null {
  const found = anomalies(ys, window, threshold)
  if (!found.length) return null
  return found.reduce((a, b) => (Math.abs(b.z) > Math.abs(a.z) ? b : a))
}

export interface Changepoint {
  index: number
  before: number
  after: number
  shift: number
}

/**
 * CUSUM changepoint: the index where the running deviation from the global mean
 * peaks is the most likely place the series changed regime.
 */
export function changepoint(ys: readonly number[], edge = 4): Changepoint | null {
  const n = ys.length
  if (n < edge * 2 + 1) return null
  const mu = mean(ys) as number
  let running = 0
  let bestIdx = -1
  let bestAbs = 0
  for (let i = 0; i < n; i++) {
    running += ys[i] - mu
    if (i >= edge && i < n - edge && Math.abs(running) > bestAbs) {
      bestAbs = Math.abs(running)
      bestIdx = i
    }
  }
  if (bestIdx < 0) return null
  const before = mean(ys.slice(0, bestIdx)) as number
  const after = mean(ys.slice(bestIdx)) as number
  return { index: bestIdx, before, after, shift: after - before }
}

/** Autocorrelation at a given lag — how strongly the series repeats itself. */
export function autocorrelation(ys: readonly number[], lag: number): number {
  const n = ys.length
  if (lag >= n) return 0
  const mu = mean(ys) as number
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    den += (ys[i] - mu) ** 2
    if (i + lag < n) num += (ys[i] - mu) * (ys[i + lag] - mu)
  }
  return den === 0 ? 0 : num / den
}

/** Scans candidate lags and returns the period that repeats most strongly. */
export function dominantPeriod(ys: readonly number[], candidates: number[]): { lag: number; strength: number } | null {
  let best: { lag: number; strength: number } | null = null
  for (const lag of candidates) {
    if (lag >= ys.length) continue
    const strength = autocorrelation(ys, lag)
    if (!best || strength > best.strength) best = { lag, strength }
  }
  return best && best.strength > 0.25 ? best : null
}

export function correlation(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 2) return 0
  const ma = mean(a.slice(0, n)) as number
  const mb = mean(b.slice(0, n)) as number
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb)
    da += (a[i] - ma) ** 2
    db += (b[i] - mb) ** 2
  }
  const den = Math.sqrt(da * db)
  return den === 0 ? 0 : num / den
}

/** Annualised volatility of log returns — the standard finance definition. */
export function volatility(closes: readonly number[], periodsPerYear = 252): number {
  if (closes.length < 3) return 0
  const returns: number[] = []
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) returns.push(Math.log(closes[i] / closes[i - 1]))
  }
  const sd = (deviation(returns) as number) || 0
  return sd * Math.sqrt(periodsPerYear)
}

export interface Summary {
  min: number
  max: number
  mean: number
  p50: number
  p95: number
  sd: number
}

export function summarize(ys: readonly number[]): Summary {
  const arr = [...ys]
  return {
    min: (min(arr) as number) ?? 0,
    max: (max(arr) as number) ?? 0,
    mean: (mean(arr) as number) ?? 0,
    p50: quantile(arr, 0.5) ?? 0,
    p95: quantile(arr, 0.95) ?? 0,
    sd: (deviation(arr) as number) ?? 0,
  }
}

/** Percentage change between two values, guarding the divide-by-zero case. */
export function pctChange(from: number, to: number): number {
  if (from === 0) return 0
  return (to - from) / Math.abs(from)
}

/** Compound growth rate per step across a series. */
export function cagr(first: number, last: number, steps: number): number {
  if (first <= 0 || steps <= 0) return 0
  return (last / first) ** (1 / steps) - 1
}

// ---------------------------------------------------------------------------
// Insights — the shape the analyst panel renders
// ---------------------------------------------------------------------------

export type InsightSeverity = 'info' | 'good' | 'warning' | 'serious' | 'critical'

export type InsightKind =
  | 'trend'
  | 'anomaly'
  | 'forecast'
  | 'changepoint'
  | 'seasonality'
  | 'correlation'
  | 'summary'

export interface Insight {
  id: string
  kind: InsightKind
  severity: InsightSeverity
  /** One sentence. The panel types it out character by character. */
  text: string
  /** The number that backs the claim, shown in mono beside the sentence. */
  evidence?: string
}

/** Confidence phrasing keyed to R² so the analyst never oversells a weak fit. */
export function fitQuality(r2: number): string {
  if (r2 >= 0.9) return 'very high confidence'
  if (r2 >= 0.75) return 'high confidence'
  if (r2 >= 0.5) return 'moderate confidence'
  if (r2 >= 0.25) return 'low confidence'
  return 'no meaningful fit'
}

export function severityForZ(z: number): InsightSeverity {
  const a = Math.abs(z)
  if (a >= 5) return 'critical'
  if (a >= 4) return 'serious'
  if (a >= 3) return 'warning'
  return 'info'
}
