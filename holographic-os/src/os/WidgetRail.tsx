import type { ComponentChildren, JSX } from 'preact'
import { clock } from '@/state/os'
import { history, stats, TOTAL_RAM_GB } from '@/state/telemetry'
import { current as weather, CONDITION_LABEL, station } from '@/state/weather'
import { openApp } from '@/state/windows'
import { Ring, Sparkline } from '@/ui/charts'
import { useCanvas } from '@/ui/useCanvas'
import { WeatherCanvas } from '@/ui/WeatherCanvas'
import { WeatherIcon } from '@/ui/icons'
import { formatClock, formatUptime, pad2 } from '@/lib/util'

/** Right-hand rail of always-on animated widgets. */
export function WidgetRail(): JSX.Element {
  return (
    <div class="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-[248px] flex-col gap-2.5 overflow-y-auto p-3 xl:flex">
      <ClockWidget />
      <SystemWidget />
      <WeatherWidget />
      <NetworkWidget />
    </div>
  )
}

function Widget({
  title,
  children,
  onOpen,
  delay = 0,
}: {
  title: string
  children: ComponentChildren
  onOpen?: () => void
  delay?: number
}): JSX.Element {
  return (
    <section
      class="glass brackets sweep pointer-events-auto shrink-0 rounded-lg p-3 animate-rail-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header class="mb-2 flex items-center justify-between">
        <h2 class="label">{title}</h2>
        {onOpen && (
          <button
            type="button"
            class="font-mono text-[0.55rem] uppercase tracking-widest text-primary/60 transition-colors hover:text-primary"
            onClick={onOpen}
          >
            Open
          </button>
        )}
      </header>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------

function ClockWidget(): JSX.Element {
  const now = clock.value

  // Second hand runs off rAF, not the 1 Hz signal, so it sweeps smoothly.
  const ref = useCanvas(({ ctx, w, h, p }) => {
    const cx = w / 2
    const cy = h / 2
    const r = Math.min(w, h) / 2 - 3
    const d = new Date()
    const ms = d.getSeconds() + d.getMilliseconds() / 1000

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = p.primary(0.14)
    ctx.lineWidth = 2
    ctx.stroke()

    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2
      const major = i % 5 === 0
      const inner = r - (major ? 6 : 3)
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      ctx.strokeStyle = p.primary(i <= ms ? 0.55 : 0.13)
      ctx.lineWidth = major ? 1.6 : 1
      ctx.stroke()
    }

    const a = (ms / 60) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, a)
    ctx.strokeStyle = p.primary(0.85)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.6, 0, Math.PI * 2)
    ctx.fillStyle = p.primary(1)
    ctx.fill()
  })

  return (
    <Widget title="Chronometer" delay={0}>
      <div class="flex items-center gap-3">
        <div class="relative h-16 w-16 shrink-0">
          <canvas ref={ref} class="h-full w-full" />
          <span class="absolute inset-0 grid place-items-center font-mono text-[0.6rem] tabular-nums text-primary">
            {pad2(now.getSeconds())}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-mono text-2xl leading-none tabular-nums text-primary text-glow">
            {formatClock(now)}
          </div>
          <div class="mt-1.5 font-mono text-[0.58rem] uppercase leading-tight tracking-[0.14em] text-muted-foreground">
            {now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          <div class="mt-0.5 font-mono text-[0.55rem] tabular-nums text-primary/50">
            UP {formatUptime(stats.value.uptimeMs)}
          </div>
        </div>
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------

function SystemWidget(): JSX.Element {
  const s = stats.value

  return (
    <Widget title="Load" onOpen={() => openApp('monitor')} delay={70}>
      <div class="mb-2.5 flex items-center justify-around">
        <Ring value={s.gpu} readout={`${Math.round(s.gpu)}`} sub="GPU" class="h-14 w-14" tone={s.gpu > 82 ? 'warn' : 'primary'} />
        <Ring value={s.cpu} readout={`${Math.round(s.cpu)}`} sub="CPU" class="h-14 w-14" tone={s.cpu > 82 ? 'warn' : 'primary'} />
        <Ring
          value={(s.ram / TOTAL_RAM_GB) * 100}
          readout={`${Math.round((s.ram / TOTAL_RAM_GB) * 100)}`}
          sub="MEM"
          class="h-14 w-14"
          tone="accent"
        />
      </div>

      <div class="h-12">
        <Sparkline buffer={history.gpu} max={100} tone="primary" />
      </div>

      <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[0.58rem] tabular-nums">
        <Stat label="GPU temp" value={`${Math.round(s.gpuTemp)}°C`} warn={s.gpuTemp > 78} />
        <Stat label="Fan" value={`${Math.round(s.fan)}`} />
        <Stat label="VRAM" value={`${s.vram.toFixed(1)}G`} />
        <Stat label="Draw" value={`${Math.round(s.power)}W`} warn={s.power > 340} />
      </dl>
    </Widget>
  )
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }): JSX.Element {
  return (
    <div class="flex items-baseline justify-between gap-1">
      <dt class="truncate text-muted-foreground">{label}</dt>
      <dd class={warn ? 'text-warn' : 'text-primary/85'}>{value}</dd>
    </div>
  )
}

// ---------------------------------------------------------------------------

function WeatherWidget(): JSX.Element {
  const w = weather.value

  return (
    <Widget title="Atmospherics" onOpen={() => openApp('weather')} delay={140}>
      <div class="relative h-24 overflow-hidden rounded border border-primary/20">
        <WeatherCanvas
          condition={w.condition}
          intensity={w.intensity}
          windKph={w.windKph}
          cloudCover={w.cloudCover}
          density={0.45}
        />
        <div class="absolute inset-0 flex items-end justify-between p-2">
          <div>
            <div class="font-mono text-2xl leading-none text-primary text-glow tabular-nums">
              {Math.round(w.tempC)}°
            </div>
            <div class="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-primary/70">
              {CONDITION_LABEL[w.condition]}
            </div>
          </div>
          <span class="text-primary/85">
            <WeatherIcon condition={w.condition} size={26} />
          </span>
        </div>
      </div>

      <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[0.58rem] tabular-nums">
        <Stat label="Wind" value={`${Math.round(w.windKph)}k`} />
        <Stat label="Humid" value={`${Math.round(w.humidity)}%`} />
        <Stat label="Press" value={`${Math.round(w.pressure)}`} />
        <Stat label="Vis" value={`${w.visibilityKm.toFixed(1)}km`} warn={w.visibilityKm < 2} />
      </dl>

      <p class="mt-1.5 truncate font-mono text-[0.52rem] uppercase tracking-[0.14em] text-muted-foreground">
        {station.value.name} · {station.value.coords}
      </p>
    </Widget>
  )
}

// ---------------------------------------------------------------------------

function NetworkWidget(): JSX.Element {
  const s = stats.value

  return (
    <Widget title="Uplink" delay={210}>
      <div class="mb-1 flex items-baseline justify-between font-mono text-[0.58rem] tabular-nums">
        <span class="text-primary">▼ {s.netDown.toFixed(1)} MB/s</span>
        <span class="text-accent">▲ {s.netUp.toFixed(1)}</span>
      </div>
      <div class="h-10">
        <Sparkline buffer={history.netDown} tone="primary" grid={false} />
      </div>
      <div class="h-7">
        <Sparkline buffer={history.netUp} tone="accent" grid={false} />
      </div>
      <div class="mt-1.5 flex items-center justify-between font-mono text-[0.55rem] tabular-nums text-muted-foreground">
        <span>FPS {Math.round(s.fps)}</span>
        <span>DISK {Math.round(s.diskRead)}/{Math.round(s.diskWrite)}</span>
      </div>
    </Widget>
  )
}
