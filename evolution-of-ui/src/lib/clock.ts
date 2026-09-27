/**
 * Every era shows the real time of day and the real calendar date, but in its
 * own year — and with the weekday that date actually fell on in that year.
 * 27 September was a Saturday in 1980 and a Wednesday in 1995.
 *
 * Clocks are updated imperatively: any element with `data-clock="<format>"`
 * gets its text rewritten once a second by a single interval. Routing a
 * ticking signal through Qwik would wake every component that shows a time.
 */

export type ClockFormat =
  | 'win'
  | 'win-date'
  | 'short'
  | 'glass-time'
  | 'glass-date'
  | 'glass-day'
  | 'hud-date'
  | 'hud-time'
  | 'web2-date'
  | 'md-date'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const pad = (n: number, w = 2) => String(n).padStart(w, '0')

/** Today's month, day and time, transplanted into `year`. */
export function eraDate(year: number, now = new Date()): Date {
  const month = now.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(now.getDate(), lastDay), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
}

const h12 = (d: Date) => {
  const h = d.getHours() % 12
  return h === 0 ? 12 : h
}
const ampm = (d: Date) => (d.getHours() < 12 ? 'AM' : 'PM')

export function formatClock(fmt: ClockFormat, now = new Date()): string {
  switch (fmt) {
    case 'win':
      return `${h12(now)}:${pad(now.getMinutes())} ${ampm(now)}`
    case 'win-date': {
      const d = eraDate(1995, now)
      return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, 1995`
    }
    case 'short':
      return `${h12(now)}:${pad(now.getMinutes())}`
    case 'glass-time':
      return `${h12(now)}:${pad(now.getMinutes())}`
    case 'glass-date': {
      const d = eraDate(2025, now)
      return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
    }
    case 'glass-day': {
      const d = eraDate(2025, now)
      return `${DAYS[d.getDay()].slice(0, 3)} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}  ${h12(now)}:${pad(now.getMinutes())}`
    }
    case 'hud-date': {
      const d = eraDate(2040, now)
      return `2040.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
    }
    case 'hud-time':
      return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    case 'web2-date': {
      const d = eraDate(2005, now)
      return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, 2005`
    }
    case 'md-date': {
      const d = eraDate(2015, now)
      return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`
    }
  }
}

/** DOS `DATE` output, e.g. "Sat 09-27-1980". */
export function dosDate(now = new Date()): string {
  const d = eraDate(1980, now)
  return `${DAYS[d.getDay()].slice(0, 3)} ${pad(d.getMonth() + 1)}-${pad(d.getDate())}-1980`
}

/** DOS `TIME` output, e.g. " 9:04:33.12p". */
export function dosTime(now = new Date()): string {
  const h = h12(now)
  return `${String(h).padStart(2, ' ')}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(Math.floor(now.getMilliseconds() / 10))}${now.getHours() < 12 ? 'a' : 'p'}`
}

/** DOS directory-listing date for a file "modified today", e.g. "09-27-80". */
export function dosFileDate(now = new Date()): string {
  const d = eraDate(1980, now)
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-80`
}

/** Start the one interval that keeps every `[data-clock]` element current. */
export function startClocks(root: ParentNode = document): () => void {
  const tick = () => {
    const now = new Date()
    root.querySelectorAll<HTMLElement>('[data-clock]').forEach((el) => {
      const text = formatClock(el.dataset.clock as ClockFormat, now)
      if (el.textContent !== text) el.textContent = text
    })
    root.querySelectorAll<HTMLElement>('[data-clock-title]').forEach((el) => {
      const text = formatClock(el.dataset.clockTitle as ClockFormat, now)
      if (el.title !== text) el.title = text
    })
  }
  tick()
  // Align to the second boundary so every clock on the page flips together.
  let interval = 0
  const timeout = window.setTimeout(() => {
    tick()
    interval = window.setInterval(tick, 1000)
  }, 1000 - (Date.now() % 1000))
  return () => {
    window.clearTimeout(timeout)
    window.clearInterval(interval)
  }
}
