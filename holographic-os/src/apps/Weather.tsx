import type { JSX } from 'preact'
import {
  CONDITION_LABEL,
  current,
  daily,
  hourly,
  setStation,
  station,
  STATIONS,
} from '@/state/weather'
import { WeatherCanvas } from '@/ui/WeatherCanvas'
import { useCanvas } from '@/ui/useCanvas'
import { WeatherIcon, IconDroplet, IconEye, IconGauge, IconWind } from '@/ui/icons'
import { clamp, pad2 } from '@/lib/util'

export function Weather(): JSX.Element {
  const w = current.value
  const hours = hourly.value
  const days = daily.value
  const s = station.value

  return (
    <div class="flex h-full flex-col">
      {/* Station picker */}
      <div class="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-primary/15 px-2 py-1.5">
        {STATIONS.map((st) => (
          <button
            key={st.id}
            type="button"
            class="holo-btn shrink-0"
            data-active={st.id === s.id}
            onClick={() => setStation(st.id)}
          >
            {st.name}
          </button>
        ))}
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        {/* Hero */}
        <div class="relative h-44 overflow-hidden border-b border-primary/15">
          <WeatherCanvas
            condition={w.condition}
            intensity={w.intensity}
            windKph={w.windKph}
            cloudCover={w.cloudCover}
          />

          <div class="absolute inset-0 flex items-end justify-between p-3.5">
            <div>
              <div class="flex items-start gap-1">
                <span class="font-mono text-5xl leading-none text-primary text-glow tabular-nums">
                  {Math.round(w.tempC)}
                </span>
                <span class="mt-1 font-mono text-lg text-primary/70">°C</span>
              </div>
              <p class="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-primary/85">
                {CONDITION_LABEL[w.condition]}
              </p>
              <p class="font-mono text-[0.6rem] text-muted-foreground">
                Feels like {Math.round(w.feelsLike)}° · dew {Math.round(w.dewPoint)}°
              </p>
            </div>

            <div class="flex flex-col items-end gap-1.5">
              <span class="text-primary text-glow">
                <WeatherIcon condition={w.condition} size={48} strokeWidth={1.1} />
              </span>
              <span class="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
                {s.coords}
              </span>
            </div>
          </div>
        </div>

        {/* Conditions grid */}
        <div class="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
          <Cell icon={<IconWind size={14} />} label="Wind" value={`${Math.round(w.windKph)}`} unit="km/h" sub={`gust ${Math.round(w.gustKph)}`} />
          <Cell icon={<IconDroplet size={14} />} label="Humidity" value={`${Math.round(w.humidity)}`} unit="%" />
          <Cell icon={<IconGauge size={14} />} label="Pressure" value={`${Math.round(w.pressure)}`} unit="hPa" />
          <Cell icon={<IconEye size={14} />} label="Visibility" value={w.visibilityKm.toFixed(1)} unit="km" warn={w.visibilityKm < 2} />
        </div>

        {/* Hourly */}
        <section class="px-3 pb-3">
          <h3 class="label mb-2">Next 24 hours</h3>
          <div class="rounded border border-primary/15 bg-primary/5 p-2.5">
            <div class="h-24">
              <HourlyChart />
            </div>
            <div class="mt-2 flex gap-1 overflow-x-auto pb-1">
              {hours.slice(0, 12).map((h, i) => (
                <div key={i} class="flex w-11 shrink-0 flex-col items-center gap-1">
                  <span class="font-mono text-[0.52rem] text-muted-foreground">{pad2(h.hour)}</span>
                  <span class="text-primary/75">
                    <WeatherIcon condition={h.condition} size={14} />
                  </span>
                  <span class="font-mono text-[0.58rem] tabular-nums text-primary">{Math.round(h.tempC)}°</span>
                  <span
                    class="font-mono text-[0.5rem] tabular-nums"
                    style={{ color: h.precipChance > 45 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground) / 0.6)' }}
                  >
                    {Math.round(h.precipChance)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Daily */}
        <section class="px-3 pb-4">
          <h3 class="label mb-2">Seven-day outlook</h3>
          <div class="space-y-1">
            {days.map((d, i) => {
              const lo = Math.min(...days.map((x) => x.min))
              const hi = Math.max(...days.map((x) => x.max))
              const span = Math.max(hi - lo, 1)
              const left = ((d.min - lo) / span) * 100
              const width = ((d.max - d.min) / span) * 100

              return (
                <div
                  key={i}
                  class="flex items-center gap-2 rounded border border-primary/10 bg-primary/5 px-2 py-1.5 transition-colors hover:border-primary/25"
                >
                  <span class="w-9 shrink-0 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                    {d.label}
                  </span>
                  <span class="shrink-0 text-primary/80">
                    <WeatherIcon condition={d.condition} size={15} />
                  </span>
                  <span class="w-7 shrink-0 text-right font-mono text-[0.6rem] tabular-nums text-muted-foreground">
                    {Math.round(d.min)}°
                  </span>

                  {/* Temperature range bar */}
                  <span class="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-primary/10">
                    <span
                      class="absolute inset-y-0 rounded-full transition-all duration-500"
                      style={{
                        left: `${clamp(left, 0, 100)}%`,
                        width: `${clamp(width, 4, 100)}%`,
                        background: 'linear-gradient(to right, hsl(var(--primary) / 0.5), hsl(var(--primary)))',
                      }}
                    />
                  </span>

                  <span class="w-7 shrink-0 font-mono text-[0.6rem] tabular-nums text-primary">
                    {Math.round(d.max)}°
                  </span>
                  <span
                    class="w-8 shrink-0 text-right font-mono text-[0.55rem] tabular-nums"
                    style={{ color: d.precipChance > 45 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground) / 0.55)' }}
                  >
                    {Math.round(d.precipChance)}%
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <p class="px-3 pb-3 font-mono text-[0.55rem] leading-relaxed text-muted-foreground">
          Simulated atmospherics — conditions evolve through a weighted Markov
          chain while temperature, pressure and wind drift on value noise. No
          network requests are made.
        </p>
      </div>
    </div>
  )
}

/** Temperature curve for the next 24 h, with a precipitation band beneath. */
function HourlyChart(): JSX.Element {
  const hours = hourly.value

  const ref = useCanvas(({ ctx, w, h, p }) => {
    if (hours.length < 2) return

    const temps = hours.map((x) => x.tempC)
    const lo = Math.min(...temps) - 1.5
    const hi = Math.max(...temps) + 1.5
    const span = Math.max(hi - lo, 1)

    const px = (i: number) => (i / (hours.length - 1)) * w
    const py = (v: number) => h - ((v - lo) / span) * (h - 22) - 16

    // Precipitation probability as a column field.
    for (let i = 0; i < hours.length; i++) {
      const barH = (hours[i].precipChance / 100) * (h * 0.42)
      ctx.fillStyle = p.accent(0.18)
      ctx.fillRect(px(i) - w / hours.length / 2, h - barH, w / hours.length - 1.5, barH)
    }

    // Temperature area.
    const fill = ctx.createLinearGradient(0, 0, 0, h)
    fill.addColorStop(0, p.primary(0.3))
    fill.addColorStop(1, p.primary(0))
    ctx.beginPath()
    ctx.moveTo(0, h)
    hours.forEach((x, i) => ctx.lineTo(px(i), py(x.tempC)))
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()

    ctx.beginPath()
    hours.forEach((x, i) => (i === 0 ? ctx.moveTo(px(i), py(x.tempC)) : ctx.lineTo(px(i), py(x.tempC))))
    ctx.strokeStyle = p.primary(1)
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Label the extremes only — a full axis would crowd a panel this small.
    const maxI = temps.indexOf(Math.max(...temps))
    const minI = temps.indexOf(Math.min(...temps))
    ctx.font = '9px "JetBrains Mono", monospace'
    ctx.fillStyle = p.primary(0.9)
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(temps[maxI])}°`, clamp(px(maxI), 12, w - 12), py(temps[maxI]) - 5)
    ctx.fillStyle = p.muted(0.9)
    ctx.fillText(`${Math.round(temps[minI])}°`, clamp(px(minI), 12, w - 12), py(temps[minI]) + 11)
  })

  return <canvas ref={ref} class="h-full w-full" />
}

function Cell({
  icon,
  label,
  value,
  unit,
  sub,
  warn,
}: {
  icon: JSX.Element
  label: string
  value: string
  unit: string
  sub?: string
  warn?: boolean
}): JSX.Element {
  return (
    <div class="rounded border border-primary/15 bg-primary/5 p-2.5">
      <div class="mb-1 flex items-center gap-1.5 text-primary/60">
        {icon}
        <span class="label">{label}</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class={`font-mono text-lg leading-none tabular-nums ${warn ? 'text-warn' : 'text-primary'}`}>{value}</span>
        <span class="font-mono text-[0.6rem] text-muted-foreground">{unit}</span>
      </div>
      {sub && <p class="mt-0.5 font-mono text-[0.55rem] text-muted-foreground">{sub}</p>}
    </div>
  )
}
