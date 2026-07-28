<script lang="ts">
  import ViewHeader from '@/components/ViewHeader.svelte'
  import ChartCard from '@/components/ChartCard.svelte'
  import FilterBar from '@/components/FilterBar.svelte'
  import StatTile from '@/components/StatTile.svelte'
  import AiInsightPanel from '@/components/AiInsightPanel.svelte'
  import StripChart from '@/charts/StripChart.svelte'
  import OrbitTrack from '@/charts/OrbitTrack.svelte'
  import Meter from '@/charts/Meter.svelte'
  import { getDataset } from '@/data/registry'
  import { channelState, generateTelemetry, stepTelemetry } from '@/data/telemetry'
  import { Rng } from '@/lib/rng'
  import { onInterval } from '@/lib/ticker'
  import { dec, elapsed } from '@/lib/format'
  import type { TableSpec } from '@/data/types'

  const meta = getDataset('telemetry')!

  // The stream mutates in place, so the whole structure is reactive state.
  const data = $state(generateTelemetry())
  const rng = new Rng('telemetry-live')

  let live = $state(true)
  let tick = $state(0)
  let runId = $state(0)

  const RATES = [
    { label: '2 Hz', value: '500' },
    { label: '5 Hz', value: '200' },
    { label: '10 Hz', value: '100' },
  ]
  let rate = $state('500')

  $effect(() => {
    if (!live) return
    const interval = Number(rate)
    return onInterval(interval, (steps) => {
      for (let i = 0; i < steps; i++) {
        tick += 1
        stepTelemetry(data, rng, tick)
      }
    })
  })

  const nominalCount = $derived(data.channels.filter((c) => channelState(c) === 'nominal').length)
  const worst = $derived(
    [...data.channels].sort(
      (a, b) =>
        Math.abs(b.history[b.history.length - 1] - b.nominal) / b.limit -
        Math.abs(a.history[a.history.length - 1] - a.nominal) / a.limit,
    )[0],
  )

  const stripTable = $derived<TableSpec>({
    columns: ['Channel', 'Current', 'Unit', 'Nominal', 'Deviation', 'State'],
    rows: data.channels.map((c) => {
      const v = c.history[c.history.length - 1]
      return [
        c.label,
        dec(v, 3),
        c.unit,
        dec(c.nominal, 2),
        dec(v - c.nominal, 3),
        channelState(c) === 'nominal' ? 'Nominal' : channelState(c) === 'caution' ? 'Caution' : 'Limit',
      ]
    }),
  })

  const orbitTable = $derived<TableSpec>({
    columns: ['Parameter', 'Value'],
    rows: [
      ['Vehicle', data.vehicle.name],
      ['Designation', data.vehicle.designation],
      ['Mission elapsed', elapsed(data.vehicle.met)],
      ['Altitude (km)', dec(data.vehicle.altitudeKm, 1)],
      ['Velocity (m/s)', String(Math.round(data.vehicle.velocityMs))],
      ['True anomaly (rad)', dec(data.vehicle.theta, 3)],
    ],
  })
</script>

<ViewHeader {meta} />

<div class="container py-8">
  <FilterBar
    ranges={RATES}
    range={rate}
    onRange={(v) => (rate = v)}
    rangeLabel="Sample rate"
    {live}
    note="{data.channels.length} channels · 240-sample window"
  >
    <button type="button" class="chip" aria-pressed={live} onclick={() => (live = !live)}>
      {live ? 'Hold stream' : 'Resume stream'}
    </button>
    <button type="button" class="chip" onclick={() => (runId += 1)}>Re-run analysis</button>
  </FilterBar>

  <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile
      label="Mission elapsed time"
      value={elapsed(data.vehicle.met)}
      seriesSlot={3}
      hero
    />
    <StatTile
      label="Channels nominal"
      value="{nominalCount} / {data.channels.length}"
      seriesSlot={3}
    />
    <StatTile
      label="Altitude"
      value="{dec(data.vehicle.altitudeKm, 1)} km"
      trend={data.channels[0].history.slice(-40)}
      seriesSlot={1}
    />
    <StatTile
      label="Closest to limit"
      value={worst.label}
      seriesSlot={2}
    />
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-3">
    <div class="xl:col-span-2">
      <ChartCard
        title="Subsystem channels"
        subtitle="Eight channels, eight plots — one y-scale each."
        table={stripTable}
        note="These carry different units, so they get small multiples rather than one plot with eight scales. Each channel's current value is directly labelled, so the tooltip only ever enhances a reading — it never gates one."
      >
        <StripChart channels={data.channels} />
      </ChartCard>
    </div>

    <div class="flex flex-col gap-6">
      <AiInsightPanel insights={data.insights} {runId} />

      <ChartCard
        title="Orbit track"
        subtitle="{data.vehicle.name} · {data.vehicle.designation}"
        table={orbitTable}
        note="The green line is the ground-station line of sight; it drops when the vehicle passes behind the body."
      >
        <OrbitTrack vehicle={data.vehicle} />
      </ChartCard>
    </div>
  </div>

  <section class="panel mt-6 p-4 sm:p-5">
    <h3 class="text-sm font-semibold">Envelope margin</h3>
    <p class="mt-1 text-xs text-muted-foreground">
      How close each channel sits to its limit, as a fraction of the allowed
      deviation.
    </p>
    <div class="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
      {#each data.channels as ch (ch.key)}
        {@const value = ch.history[ch.history.length - 1]}
        <Meter
          label={ch.label}
          ratio={Math.abs(value - ch.nominal) / ch.limit}
          value="{dec(value, 2)} {ch.unit}"
          state={channelState(ch)}
        />
      {/each}
    </div>
  </section>
</div>
