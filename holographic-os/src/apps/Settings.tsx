import type { ComponentChildren, JSX } from 'preact'
import { projection, resetProjection, setProjection, type Projection } from '@/state/os'
import { STATIONS, setStation, station } from '@/state/weather'

const SCENES: Array<{ id: Projection['scene']; label: string; hint: string }> = [
  { id: 'lattice', label: 'Lattice', hint: 'Volumetric floor and ceiling grid' },
  { id: 'nebula', label: 'Nebula', hint: 'Layered noise clouds and stars' },
  { id: 'void', label: 'Void', hint: 'Minimal — a single breathing core' },
]

/** Every control here writes straight into a live shader uniform. */
export function Settings(): JSX.Element {
  const p = projection.value

  return (
    <div class="h-full overflow-y-auto p-3">
      <div class="space-y-3">
        <Group title="Scene">
          <div class="grid gap-1.5">
            {SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                class="flex items-center gap-2.5 rounded border px-2.5 py-2 text-left transition-colors"
                style={{
                  borderColor: p.scene === s.id ? 'hsl(var(--primary) / 0.55)' : 'hsl(var(--primary) / 0.15)',
                  background: p.scene === s.id ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                }}
                onClick={() => setProjection({ scene: s.id })}
              >
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full border transition-all"
                  style={{
                    borderColor: 'hsl(var(--primary) / 0.6)',
                    background: p.scene === s.id ? 'hsl(var(--primary))' : 'transparent',
                    boxShadow: p.scene === s.id ? '0 0 10px hsl(var(--primary))' : undefined,
                  }}
                />
                <span class="min-w-0">
                  <span class="block font-mono text-[0.68rem] uppercase tracking-[0.14em] text-primary">{s.label}</span>
                  <span class="block font-mono text-[0.55rem] text-muted-foreground">{s.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </Group>

        <Group title="Projection">
          <Slider label="Hue" value={p.hue} min={-180} max={180} step={1} unit="°" onChange={(hue) => setProjection({ hue })} />
          <Slider label="Glow" value={p.glow} min={0.2} max={2} step={0.05} onChange={(glow) => setProjection({ glow })} />
          <Slider label="Grid density" value={p.grid} min={0.3} max={2.5} step={0.05} onChange={(grid) => setProjection({ grid })} />
          <Slider label="Scanlines" value={p.scanline} min={0} max={1} step={0.05} onChange={(scanline) => setProjection({ scanline })} />
          <Slider label="Grain" value={p.grain} min={0} max={1.5} step={0.05} onChange={(grain) => setProjection({ grain })} />
          <Slider label="Parallax" value={p.parallax} min={0} max={3} step={0.05} onChange={(parallax) => setProjection({ parallax })} />
        </Group>

        <Group title="Motion">
          <label class="flex cursor-pointer items-center justify-between gap-3 py-1">
            <span class="min-w-0">
              <span class="block font-mono text-[0.68rem] uppercase tracking-[0.14em] text-primary">Reduce motion</span>
              <span class="block font-mono text-[0.55rem] leading-snug text-muted-foreground">
                Freezes shader time, the projector spin and the assistant's typewriter.
              </span>
            </span>
            <Toggle checked={p.reduceMotion} onChange={(reduceMotion) => setProjection({ reduceMotion })} />
          </label>
        </Group>

        <Group title="Weather station">
          <div class="grid grid-cols-2 gap-1.5">
            {STATIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                class="holo-btn !justify-start !normal-case"
                data-active={station.value.id === s.id}
                onClick={() => setStation(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
          <p class="mt-1.5 font-mono text-[0.55rem] leading-relaxed text-muted-foreground">
            Each station carries its own climate model — base temperature, daily
            swing and how strongly the chain pulls toward precipitation.
          </p>
        </Group>

        <button type="button" class="holo-btn w-full !py-2" onClick={resetProjection}>
          Reset projection
        </button>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ComponentChildren }): JSX.Element {
  return (
    <section class="rounded border border-primary/15 bg-primary/5 p-2.5">
      <h3 class="label mb-2">{title}</h3>
      {children}
    </section>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}): JSX.Element {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <label class="mb-2.5 block last:mb-0">
      <span class="mb-1 flex items-baseline justify-between">
        <span class="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-foreground/80">{label}</span>
        <span class="font-mono text-[0.6rem] tabular-nums text-primary">
          {unit === '°' ? Math.round(value) : value.toFixed(2)}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        class="holo-range"
        style={{ '--fill': `${pct}%` }}
        onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
      />
    </label>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      class="relative h-5 w-9 shrink-0 rounded-full border transition-colors"
      style={{
        borderColor: checked ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary) / 0.2)',
        background: checked ? 'hsl(var(--primary) / 0.25)' : 'hsl(var(--primary) / 0.06)',
      }}
      onClick={() => onChange(!checked)}
    >
      <span
        class="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all duration-200"
        style={{
          left: checked ? 'calc(100% - 1.05rem)' : '0.15rem',
          background: checked ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
          boxShadow: checked ? '0 0 10px hsl(var(--primary))' : undefined,
        }}
      />
    </button>
  )
}
