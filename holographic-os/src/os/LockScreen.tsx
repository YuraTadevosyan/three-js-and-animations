import type { ComponentChildren, JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { clock, locked, unlockScreen } from '@/state/os'
import { current as weather, CONDITION_LABEL, station } from '@/state/weather'
import { stats } from '@/state/telemetry'
import { windows } from '@/state/windows'
import { WeatherIcon } from '@/ui/icons'
import { formatClock, formatUptime } from '@/lib/util'

/**
 * Idle lock plate. Deliberately translucent rather than opaque — the projection
 * keeps running behind it, which is the whole point of a holographic desktop
 * going to sleep.
 */
export function LockScreen(): JSX.Element | null {
  const [dismissing, setDismissing] = useState(false)

  // Fade out first, then actually unlock, so the plate doesn't pop.
  const release = () => {
    setDismissing(true)
    window.setTimeout(() => {
      unlockScreen()
      setDismissing(false)
    }, 260)
  }

  // Any key dismisses, matching the "press any key" affordance.
  useEffect(() => {
    if (!locked.value) return

    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      release()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked.value])

  if (!locked.value) return null

  const now = clock.value
  const w = weather.value
  const parked = windows.value.length

  return (
    <div
      class="fixed inset-0 z-[9900] flex flex-col items-center justify-center transition-opacity duration-250"
      style={{
        opacity: dismissing ? 0 : 1,
        background: 'hsl(var(--background) / 0.72)',
        backdropFilter: 'blur(14px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Screen locked"
      onPointerDown={release}
    >
      {/* Clock */}
      <div class="flex flex-col items-center animate-fade-in">
        <span class="font-mono text-[clamp(3.5rem,14vw,8rem)] leading-none tabular-nums text-primary text-glow">
          {formatClock(now)}
        </span>
        <span class="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-muted-foreground">
          {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* Status strip */}
      <div class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6">
        <Cell>
          <span class="text-primary/85">
            <WeatherIcon condition={w.condition} size={18} />
          </span>
          <span>
            {Math.round(w.tempC)}° · {CONDITION_LABEL[w.condition]}
          </span>
        </Cell>
        <Cell>{station.value.name}</Cell>
        <Cell>GPU {Math.round(stats.value.gpu)}%</Cell>
        <Cell>UP {formatUptime(stats.value.uptimeMs)}</Cell>
        <Cell>
          {parked} surface{parked === 1 ? '' : 's'} held
        </Cell>
      </div>

      <span class="hairline mt-10 max-w-[22rem]" />

      <p class="mt-5 flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-primary/70">
        <span class="h-1.5 w-1.5 rounded-full bg-accent animate-breathe" aria-hidden="true" />
        Press any key to resume
      </p>

      <p class="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
        Projection held · nothing was closed
      </p>
    </div>
  )
}

function Cell({ children }: { children: ComponentChildren }): JSX.Element {
  return (
    <span class="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </span>
  )
}
