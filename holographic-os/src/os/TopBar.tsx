import type { JSX } from 'preact'
import { clock, launcherOpen } from '@/state/os'
import { stats } from '@/state/telemetry'
import { current as weather, station } from '@/state/weather'
import { minimizeAll, TOPBAR_H, windows } from '@/state/windows'
import { formatClock, formatDate } from '@/lib/util'
import { IconCpu, IconLayers, IconPower, IconWifi, WeatherIcon } from '@/ui/icons'

/** Persistent chrome across the top of the projection. */
export function TopBar(): JSX.Element {
  const now = clock.value
  const s = stats.value
  const w = weather.value
  const openCount = windows.value.filter((win) => !win.minimized).length

  return (
    <header
      class="glass-solid scanlines fixed inset-x-0 top-0 z-[9000] flex items-center gap-3 border-x-0 border-t-0 px-3 no-select"
      style={{ height: `${TOPBAR_H}px` }}
    >
      {/* Launcher */}
      <button
        type="button"
        class="holo-btn !px-2 !py-1"
        data-active={launcherOpen.value}
        onClick={() => (launcherOpen.value = !launcherOpen.value)}
        aria-expanded={launcherOpen.value}
        aria-label="Open launcher"
      >
        <span class="grid h-3.5 w-3.5 grid-cols-2 gap-[2px]" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} class="rounded-[1px] bg-current" />
          ))}
        </span>
        <span class="hidden sm:inline">Holo</span>
      </button>

      <span class="hidden h-4 w-px bg-primary/20 sm:block" />

      <span class="hidden font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground md:inline">
        {station.value.name}
      </span>

      <div class="flex-1" />

      {/* Centre clock */}
      <div class="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-baseline gap-2 lg:flex">
        <span class="font-mono text-sm tabular-nums text-primary text-glow">{formatClock(now, true)}</span>
        <span class="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {formatDate(now)}
        </span>
      </div>

      {/* Status cluster */}
      <div class="flex items-center gap-2.5 font-mono text-[0.62rem] tabular-nums">
        <StatusChip icon={<WeatherIcon condition={w.condition} size={13} />} value={`${Math.round(w.tempC)}°`} title="Atmospherics" />
        <StatusChip icon={<IconCpu size={13} />} value={`${Math.round(s.gpu)}%`} title="GPU load" tone={s.gpu > 80 ? 'warn' : 'default'} />
        <StatusChip icon={<IconWifi size={13} />} value={`${s.netDown.toFixed(1)}`} title="Downlink MB/s" />
        <StatusChip icon={<IconLayers size={13} />} value={String(openCount)} title="Open surfaces" />

        <span class="hidden font-mono text-[0.6rem] tabular-nums text-primary lg:inline">
          {formatClock(now)}
        </span>

        <button
          type="button"
          title="Minimise all surfaces"
          aria-label="Minimise all surfaces"
          class="grid h-6 w-6 place-items-center rounded text-primary/60 transition-colors hover:bg-danger/20 hover:text-danger"
          onClick={minimizeAll}
        >
          <IconPower size={14} />
        </button>
      </div>
    </header>
  )
}

function StatusChip({
  icon,
  value,
  title,
  tone = 'default',
}: {
  icon: JSX.Element
  value: string
  title: string
  tone?: 'default' | 'warn'
}): JSX.Element {
  return (
    <span
      title={title}
      class={`hidden items-center gap-1.5 sm:inline-flex ${tone === 'warn' ? 'text-warn' : 'text-primary/80'}`}
    >
      <span class="opacity-70">{icon}</span>
      {value}
    </span>
  )
}
