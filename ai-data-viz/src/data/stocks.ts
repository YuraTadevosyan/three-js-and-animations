import { Rng } from '@/lib/rng'
import {
  fitQuality,
  linearRegression,
  movingAverage,
  pctChange,
  summarize,
  volatility,
  type Insight,
} from '@/lib/stats'
import { compact, dec, fmtTime, signedPct } from '@/lib/format'

/**
 * Stock market — intraday OHLC bars with volatility clustering.
 *
 * Prices follow geometric Brownian motion, but the per-step sigma is itself a
 * mean-reverting process. That is what produces the calm-then-violent texture
 * real tape has, and it is why the analyst's "volatility regime" call has
 * something to detect instead of a constant.
 */

export interface Candle {
  t: Date
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface BookLevel {
  price: number
  size: number
}

export interface Instrument {
  ticker: string
  name: string
  candles: Candle[]
  /** Cumulative depth on each side, nearest the mid first. */
  bids: BookLevel[]
  asks: BookLevel[]
}

export interface StockData {
  instruments: Instrument[]
  insights: Record<string, Insight[]>
}

/**
 * `vol` and `drift` are **per one-minute bar**, not per session.
 *
 * Getting this scale wrong is the easy mistake: a 1% per-bar sigma compounds to
 * roughly 20% over 390 bars, which would print a market crash every session. A
 * per-bar sigma near 0.001 lands at ~2% daily and ~25% annualised, which is
 * where real equities actually sit.
 */
const INSTRUMENTS = [
  { ticker: 'NVDX', name: 'Nevadex Compute', start: 412.5, drift: 0.000011, vol: 0.00085 },
  { ticker: 'ORBT', name: 'Orbital Systems', start: 88.2, drift: 0.000006, vol: 0.00105 },
  { ticker: 'HELX', name: 'Helix Bio', start: 143.9, drift: -0.000004, vol: 0.0012 },
  { ticker: 'ATLS', name: 'Atlas Freight', start: 61.4, drift: 0.000004, vol: 0.00062 },
  { ticker: 'VRDN', name: 'Verdant Energy', start: 27.85, drift: 0.000014, vol: 0.00098 },
  { ticker: 'QNTL', name: 'Quantil Labs', start: 219.6, drift: 0.000008, vol: 0.00145 },
] as const

/** One trading session of 1-minute bars, 09:30 → 16:00. */
const BAR_COUNT = 390
const SESSION_OPEN = Date.UTC(2026, 6, 24, 13, 30)
const BAR_MS = 60_000

export function generateStocks(seed = 'stock-market'): StockData {
  const instruments = INSTRUMENTS.map((spec) => buildInstrument(spec, `${seed}:${spec.ticker}`))
  const insights: Record<string, Insight[]> = {}
  for (const inst of instruments) insights[inst.ticker] = analyse(inst)
  return { instruments, insights }
}

function buildInstrument(
  spec: (typeof INSTRUMENTS)[number],
  seed: string,
): Instrument {
  const rng = new Rng(seed)
  const candles: Candle[] = []
  let price: number = spec.start
  // sigma mean-reverts toward the instrument's baseline vol.
  let sigma: number = spec.vol

  for (let i = 0; i < BAR_COUNT; i++) {
    sigma += (spec.vol - sigma) * 0.04 + rng.normal(0, spec.vol * 0.12)
    sigma = Math.max(spec.vol * 0.35, Math.min(spec.vol * 3.2, sigma))

    const o = price
    const shock = rng.normal(spec.drift, sigma)
    const c = Math.max(0.5, o * (1 + shock))
    // Wicks scale with the bar's own realised move, so quiet bars stay quiet.
    const spread = Math.abs(c - o) + o * sigma * rng.range(0.2, 0.9)
    const h = Math.max(o, c) + spread * rng.range(0.1, 0.6)
    const l = Math.min(o, c) - spread * rng.range(0.1, 0.6)

    // Volume rises with |move| and follows the U-shaped intraday curve.
    const uShape = 1 + 1.6 * (Math.exp(-i / 45) + Math.exp(-(BAR_COUNT - i) / 55))
    const v = Math.round(
      (18_000 + Math.abs(shock) / spec.vol * 26_000) * uShape * rng.range(0.7, 1.35),
    )

    candles.push({ t: new Date(SESSION_OPEN + i * BAR_MS), o, h, l: Math.max(0.4, l), c, v })
    price = c
  }

  const mid = price
  const rngBook = new Rng(`${seed}:book`)
  const bids: BookLevel[] = []
  const asks: BookLevel[] = []
  let bidDepth = 0
  let askDepth = 0
  for (let i = 0; i < 14; i++) {
    const tick = mid * 0.0006 * (i + 1)
    bidDepth += Math.round(rngBook.range(400, 2600) * (1 + i * 0.22))
    askDepth += Math.round(rngBook.range(400, 2600) * (1 + i * 0.22))
    bids.push({ price: mid - tick, size: bidDepth })
    asks.push({ price: mid + tick, size: askDepth })
  }

  return { ticker: spec.ticker, name: spec.name, candles, bids, asks }
}

/**
 * Appends one bar, continuing the walk from the last close. The live view calls
 * this on a cadence so the tape keeps moving.
 */
export function nextCandle(inst: Instrument, rng: Rng): Candle {
  const prev = inst.candles[inst.candles.length - 1]
  const recent = inst.candles.slice(-30).map((c) => c.c)
  // `volatility(…, 1)` with one period per year is just the per-bar standard
  // deviation of log returns — exactly the sigma the next bar needs.
  const sigma = Math.max(0.0003, volatility(recent, 1))
  const o = prev.c
  const c = Math.max(0.5, o * (1 + rng.normal(0, sigma)))
  const spread = Math.abs(c - o) + o * sigma * rng.range(0.2, 0.9)
  return {
    t: new Date(prev.t.getTime() + BAR_MS),
    o,
    h: Math.max(o, c) + spread * rng.range(0.1, 0.6),
    l: Math.max(0.4, Math.min(o, c) - spread * rng.range(0.1, 0.6)),
    c,
    v: Math.round(rng.range(14_000, 62_000)),
  }
}

function analyse(inst: Instrument): Insight[] {
  const closes = inst.candles.map((c) => c.c)
  const highs = inst.candles.map((c) => c.h)
  const lows = inst.candles.map((c) => c.l)
  const out: Insight[] = []

  const open = inst.candles[0].o
  const last = closes[closes.length - 1]
  const change = pctChange(open, last)
  out.push({
    id: 'session',
    kind: 'summary',
    severity: change >= 0 ? 'good' : 'critical',
    text: `${inst.ticker} closed the session at ${dec(last, 2)}, ${signedPct(change)} against the open.`,
    evidence: `${dec(open, 2)} → ${dec(last, 2)}`,
  })

  // Compare the last hour's realised vol to the session's, to name the regime.
  const sessionVol = volatility(closes, 390 * 252)
  const recentVol = volatility(closes.slice(-60), 390 * 252)
  const ratio = sessionVol > 0 ? recentVol / sessionVol : 1
  out.push({
    id: 'vol',
    kind: 'trend',
    severity: ratio > 1.6 ? 'serious' : ratio > 1.25 ? 'warning' : 'info',
    text:
      ratio > 1.25
        ? `Volatility is expanding into the close — the last 60 bars run ${dec(ratio, 1)}× the session's realised vol.`
        : `Volatility is contained — the last 60 bars run ${dec(ratio, 1)}× the session's realised vol.`,
    evidence: `σ ann. ${(sessionVol * 100).toFixed(0)}%`,
  })

  const hi = Math.max(...highs)
  const lo = Math.min(...lows)
  const hiIdx = highs.indexOf(hi)
  out.push({
    id: 'range',
    kind: 'summary',
    severity: 'info',
    text: `Session range spans ${dec(lo, 2)} to ${dec(hi, 2)}; the high printed at ${fmtTime(inst.candles[hiIdx].t)}.`,
    evidence: `${(((hi - lo) / lo) * 100).toFixed(1)}% range`,
  })

  const sma20 = movingAverage(closes, 20)
  const sma50 = movingAverage(closes, 50)
  const fast = sma20[sma20.length - 1]
  const slow = sma50[sma50.length - 1]
  if (fast != null && slow != null) {
    const above = fast > slow
    out.push({
      id: 'momentum',
      kind: 'trend',
      severity: above ? 'good' : 'warning',
      text: `SMA-20 sits ${above ? 'above' : 'below'} SMA-50 by ${dec(Math.abs(fast - slow), 2)} — momentum reads ${above ? 'constructive' : 'defensive'}.`,
      evidence: `${dec(fast, 2)} vs ${dec(slow, 2)}`,
    })
  }

  const fit = linearRegression(closes.slice(-120))
  out.push({
    id: 'drift',
    kind: 'trend',
    severity: 'info',
    text: `Trailing two-hour drift is ${signedPct((fit.slope * 120) / last)} per 120 bars — ${fitQuality(fit.r2)}.`,
    evidence: `R² ${fit.r2.toFixed(2)}`,
  })

  const vol = summarize(inst.candles.map((c) => c.v))
  out.push({
    id: 'volume',
    kind: 'summary',
    severity: 'info',
    text: `Median bar traded ${compact(vol.p50)} shares; the 95th percentile bar traded ${compact(vol.p95)}.`,
    evidence: `${compact(inst.candles.reduce((a, c) => a + c.v, 0))} total`,
  })

  const imbalance =
    (inst.bids[inst.bids.length - 1].size - inst.asks[inst.asks.length - 1].size) /
    (inst.bids[inst.bids.length - 1].size + inst.asks[inst.asks.length - 1].size)
  out.push({
    id: 'book',
    kind: 'summary',
    severity: Math.abs(imbalance) > 0.2 ? 'warning' : 'info',
    text: `Resting depth is ${Math.abs(imbalance * 100).toFixed(0)}% skewed to the ${imbalance > 0 ? 'bid' : 'offer'} across 14 levels.`,
    evidence: `imbalance ${imbalance >= 0 ? '+' : '−'}${Math.abs(imbalance).toFixed(2)}`,
  })

  return out
}
