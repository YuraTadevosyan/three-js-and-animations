import type { ComponentChildren, JSX } from 'preact'
import { useState } from 'preact/hooks'
import { CoreBars, Gauge, Meter, Sparkline } from '@/ui/charts'
import { history, processes, stats, TOTAL_RAM_GB, TOTAL_VRAM_GB } from '@/state/telemetry'
import { formatUptime } from '@/lib/util'

type Tab = 'overview' | 'processes' | 'sensors'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'processes', label: 'Processes' },
  { id: 'sensors', label: 'Sensors' },
]

export function SystemMonitor(): JSX.Element {
  const [tab, setTab] = useState<Tab>('overview')
  const s = stats.value

  return (
    <div class="flex h-full flex-col">
      <nav class="flex shrink-0 items-center gap-1 border-b border-primary/15 px-2.5 py-1.5">
        {TABS.map((t) => (
          <button key={t.id} type="button" class="holo-btn" data-active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <span class="flex-1" />
        <span class="font-mono text-[0.58rem] tabular-nums text-muted-foreground">
          {Math.round(s.fps)} fps · up {formatUptime(s.uptimeMs)}
        </span>
      </nav>

      <div class="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === 'overview' && <Overview />}
        {tab === 'processes' && <Processes />}
        {tab === 'sensors' && <Sensors />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Overview(): JSX.Element {
  const s = stats.value

  return (
    <div class="space-y-3">
      <div class="grid grid-cols-3 gap-2">
        <Panel>
          <Gauge value={s.gpu} label="GPU" readout={`${Math.round(s.gpu)}%`} class="h-24" tone={s.gpu > 82 ? 'warn' : 'primary'} />
        </Panel>
        <Panel>
          <Gauge value={s.cpu} label="CPU" readout={`${Math.round(s.cpu)}%`} class="h-24" tone={s.cpu > 82 ? 'warn' : 'primary'} />
        </Panel>
        <Panel>
          <Gauge
            value={(s.ram / TOTAL_RAM_GB) * 100}
            label="Memory"
            readout={`${s.ram.toFixed(1)}G`}
            class="h-24"
            tone="accent"
          />
        </Panel>
      </div>

      <Panel>
        <PanelHead title="GPU utilisation" right={`${Math.round(s.gpu)}%  peak ${Math.round(history.gpu.max())}%`} />
        <div class="h-28">
          <Sparkline buffer={history.gpu} max={100} tone="primary" />
        </div>
      </Panel>

      <div class="grid grid-cols-2 gap-2">
        <Panel>
          <PanelHead title="CPU" right={`${Math.round(s.cpu)}%`} />
          <div class="h-20">
            <Sparkline buffer={history.cpu} max={100} tone="primary" />
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Per-core" right={`${s.cores.length} cores`} />
          <CoreBars cores={s.cores} class="pt-1" />
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Memory" right={`${s.ram.toFixed(1)} / ${TOTAL_RAM_GB} GB`} />
        <Meter value={(s.ram / TOTAL_RAM_GB) * 100} tone="accent" class="mb-2" />
        <PanelHead title="VRAM" right={`${s.vram.toFixed(1)} / ${TOTAL_VRAM_GB} GB`} />
        <Meter value={(s.vram / TOTAL_VRAM_GB) * 100} tone="primary" />
      </Panel>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Processes(): JSX.Element {
  const rows = processes.value
  const s = stats.value

  return (
    <div class="space-y-2">
      <div class="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
        <span>{rows.length} processes</span>
        <span>
          CPU {Math.round(s.cpu)}% · GPU {Math.round(s.gpu)}%
        </span>
      </div>

      <table class="w-full border-collapse font-mono text-[0.66rem] tabular-nums">
        <thead>
          <tr class="border-b border-primary/20 text-left text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
            <th class="py-1.5 pr-2 font-normal">PID</th>
            <th class="py-1.5 pr-2 font-normal">Process</th>
            <th class="py-1.5 pr-2 text-right font-normal">CPU</th>
            <th class="py-1.5 pr-2 text-right font-normal">GPU</th>
            <th class="py-1.5 text-right font-normal">Mem</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.pid} class="border-b border-primary/10 transition-colors hover:bg-primary/5">
              <td class="py-1.5 pr-2 text-muted-foreground">{p.pid}</td>
              <td class="py-1.5 pr-2">
                <span class="flex items-center gap-1.5">
                  <span
                    class="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background:
                        p.kind === 'render'
                          ? 'hsl(var(--primary))'
                          : p.kind === 'user'
                            ? 'hsl(var(--accent))'
                            : 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <span class="truncate text-foreground/90">{p.name}</span>
                </span>
              </td>
              <td class="py-1.5 pr-2 text-right text-primary/85">{p.cpu.toFixed(1)}</td>
              <td class="py-1.5 pr-2 text-right text-primary/85">{p.gpu.toFixed(1)}</td>
              <td class="py-1.5 text-right text-muted-foreground">{p.mem.toFixed(1)}G</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Sensors(): JSX.Element {
  const s = stats.value

  return (
    <div class="space-y-3">
      <Panel>
        <PanelHead title="GPU temperature" right={`${Math.round(s.gpuTemp)} °C`} />
        <div class="h-24">
          <Sparkline buffer={history.gpuTemp} max={100} tone={s.gpuTemp > 78 ? 'warn' : 'primary'} />
        </div>
      </Panel>

      <Panel>
        <PanelHead title="Power draw" right={`${Math.round(s.power)} W`} />
        <div class="h-24">
          <Sparkline buffer={history.power} max={420} tone={s.power > 340 ? 'warn' : 'accent'} />
        </div>
      </Panel>

      <div class="grid grid-cols-2 gap-2">
        <Panel>
          <Readout label="CPU temp" value={`${Math.round(s.cpuTemp)} °C`} warn={s.cpuTemp > 80} />
          <Meter value={s.cpuTemp} max={100} tone={s.cpuTemp > 80 ? 'warn' : 'primary'} class="mt-2" />
        </Panel>
        <Panel>
          <Readout label="Fan" value={`${Math.round(s.fan)} rpm`} />
          <Meter value={s.fan} max={3000} tone="primary" class="mt-2" />
        </Panel>
        <Panel>
          <Readout label="Downlink" value={`${s.netDown.toFixed(1)} MB/s`} />
          <div class="mt-1 h-10">
            <Sparkline buffer={history.netDown} tone="primary" grid={false} />
          </div>
        </Panel>
        <Panel>
          <Readout label="Uplink" value={`${s.netUp.toFixed(1)} MB/s`} />
          <div class="mt-1 h-10">
            <Sparkline buffer={history.netUp} tone="accent" grid={false} />
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Frame rate" right={`${Math.round(s.fps)} fps`} />
        <div class="h-20">
          <Sparkline buffer={history.fps} max={144} tone="accent" />
        </div>
        <p class="mt-1.5 font-mono text-[0.55rem] leading-relaxed text-muted-foreground">
          The only measured channel on this page — every other reading is
          synthesised from seeded noise.
        </p>
      </Panel>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Panel({ children }: { children: ComponentChildren }): JSX.Element {
  return <section class="rounded border border-primary/15 bg-primary/5 p-2.5">{children}</section>
}

function PanelHead({ title, right }: { title: string; right?: string }): JSX.Element {
  return (
    <div class="mb-1.5 flex items-baseline justify-between">
      <h3 class="label">{title}</h3>
      {right && <span class="font-mono text-[0.58rem] tabular-nums text-primary/80">{right}</span>}
    </div>
  )
}

function Readout({ label, value, warn }: { label: string; value: string; warn?: boolean }): JSX.Element {
  return (
    <div class="flex items-baseline justify-between">
      <span class="label">{label}</span>
      <span class={`font-mono text-sm tabular-nums ${warn ? 'text-warn' : 'text-primary'}`}>{value}</span>
    </div>
  )
}
