import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'

const compactFmt = format('.3~s')
const fixed1 = format(',.1f')
const intFmt = format(',d')
const pctFmt = format('+.1%')

/** Fixed-decimal formatters are built on demand and cached by precision. */
const fixedCache = new Map<number, (n: number) => string>()
function fixed(places: number): (n: number) => string {
  let fmt = fixedCache.get(places)
  if (!fmt) {
    fmt = format(`,.${places}f`)
    fixedCache.set(places, fmt)
  }
  return fmt
}

/** 1,284 / 12.9K / 4.2M — the stat-tile contract's auto-compact value. */
export function compact(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs < 1000) return abs < 10 ? fixed1(n) : intFmt(Math.round(n))
  return compactFmt(n).replace('G', 'B')
}

export function money(n: number, currency = '$'): string {
  const sign = n < 0 ? '−' : ''
  return `${sign}${currency}${compact(Math.abs(n))}`
}

export function int(n: number): string {
  return intFmt(Math.round(n))
}

export function dec(n: number, places = 1): string {
  return fixed(places)(n)
}

/** Signed percentage for deltas — the sign is the point, so never strip it. */
export function signedPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—'
  return pctFmt(ratio)
}

export function signed(n: number, places = 1): string {
  const s = n < 0 ? '−' : '+'
  return `${s}${Math.abs(n).toFixed(places)}`
}

export const fmtMonth = timeFormat('%b %Y')
export const fmtMonthShort = timeFormat('%b')
export const fmtDay = timeFormat('%d %b')
export const fmtDate = timeFormat('%d %b %Y')
export const fmtTime = timeFormat('%H:%M')
export const fmtTimeSec = timeFormat('%H:%M:%S')
export const fmtYear = timeFormat('%Y')

/** "T+04:12:38" — mission elapsed time, the way telemetry consoles show it. */
export function elapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (v: number) => String(v).padStart(2, '0')
  return `T+${pad(h)}:${pad(m)}:${pad(sec)}`
}

export function bytes(n: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let v = n
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`
}
