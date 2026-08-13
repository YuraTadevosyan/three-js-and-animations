import type { JSX } from 'preact'
import { clock, launcherOpen, lockScreen } from '@/state/os'
import { stats } from '@/state/telemetry'
import { current as weather, station } from '@/state/weather'
import {
  activeWorkspace,
  minimizeAll,
  switchWorkspace,
  TOPBAR_H,
  windows,
  WORKSPACE_COUNT,
} from '@/state/windows'
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

      <WorkspaceSwitcher />

      <span class="hidden font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground lg:inline">
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
          title="Minimise all surfaces on this desk"
          aria-label="Minimise all surfaces on this desk"
          class="grid h-6 w-6 place-items-center rounded text-primary/60 transition-colors hover:bg-primary/15 hover:text-primary"
          onClick={minimizeAll}
        >
          <IconLayers size={14} />
        </button>

        <button
          type="button"
          title="Lock screen"
          aria-label="Lock screen"
          class="grid h-6 w-6 place-items-center rounded text-primary/60 transition-colors hover:bg-danger/20 hover:text-danger"
          onClick={lockScreen}
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

/**
 * Virtual desktop switcher. Each pip shows how many windows that desk is
 * holding, so a populated desk is visible without switching to it.
 */
function WorkspaceSwitcher(): JSX.Element {
  const active = activeWorkspace.value
  const all = windows.value

  return (
    <div class="flex items-center gap-1" role="tablist" aria-label="Virtual desktops">
      {Array.from({ length: WORKSPACE_COUNT }, (_, i) => {
        const count = all.filter((w) => w.workspace === i).length
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            title={`Desk ${i + 1}${count ? ` — ${count} surface${count === 1 ? '' : 's'}` : ' — empty'} (Alt+${i + 1})`}
            class="group relative grid h-6 w-7 place-items-center rounded border transition-all duration-150"
            style={{
              borderColor: i === active ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary) / 0.18)',
              background: i === active ? 'hsl(var(--primary) / 0.18)' : 'transparent',
              boxShadow: i === active ? '0 0 12px -4px hsl(var(--primary) / 0.8)' : undefined,
            }}
            onClick={() => switchWorkspace(i)}
          >
            <span
              class="font-mono text-[0.6rem] tabular-nums transition-colors"
              style={{ color: i === active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
            >
              {i + 1}
            </span>
            {count > 0 && (
              <span
                class="absolute -bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(count, 4) * 3 + 3}px`, opacity: i === active ? 1 : 0.45 }}
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
