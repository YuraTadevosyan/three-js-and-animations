<script lang="ts">
  import ViewHeader from '@/components/ViewHeader.svelte'
  import ChartCard from '@/components/ChartCard.svelte'
  import FilterBar from '@/components/FilterBar.svelte'
  import StatTile from '@/components/StatTile.svelte'
  import AiInsightPanel from '@/components/AiInsightPanel.svelte'
  import Heatmap from '@/charts/Heatmap.svelte'
  import BarChart from '@/charts/BarChart.svelte'
  import LineChart from '@/charts/LineChart.svelte'
  import TrafficMap from '@/charts/TrafficMap.svelte'
  import { getDataset } from '@/data/registry'
  import { DAYS, HOURS, generateTraffic } from '@/data/traffic'
  import { summarize } from '@/lib/stats'
  import { dec, int } from '@/lib/format'
  import type { TableSpec } from '@/data/types'

  const meta = getDataset('traffic')!
  const data = generateTraffic()

  const SCOPES = [
    { label: 'Whole week', value: 'week' },
    { label: 'Weekdays', value: 'weekday' },
    { label: 'Weekend', value: 'weekend' },
  ]
  let scope = $state('week')

  const dayIndices = $derived(
    scope === 'weekday' ? [0, 1, 2, 3, 4] : scope === 'weekend' ? [5, 6] : [0, 1, 2, 3, 4, 5, 6],
  )
  const dayLabels = $derived(dayIndices.map((d) => DAYS[d]))

  /** City-wide grid: the mean across corridors, scoped by the filter row. */
  const cityGrid = $derived(
    dayIndices.map((d) =>
      HOURS.map(
        (h) => data.corridors.reduce((sum, c) => sum + c.grid[d][h], 0) / data.corridors.length,
      ),
    ),
  )

  const scopedWeekly = $derived(dayIndices.flatMap((d) => cityGrid[dayIndices.indexOf(d)]))
  const stats = $derived(summarize(scopedWeekly))

  /** Hourly profile averaged across the scoped days — one series, so one hue. */
  const hourlyProfile = $derived(
    HOURS.map((h) => cityGrid.reduce((sum, row) => sum + row[h], 0) / cityGrid.length),
  )

  const corridorTotals = $derived(
    data.corridors.map((c) => ({
      corridor: c,
      mean: summarize(dayIndices.flatMap((d) => c.grid[d])).mean,
    })),
  )

  const worstIndex = $derived(
    corridorTotals.reduce((best, cur, i, arr) => (cur.mean > arr[best].mean ? i : best), 0),
  )

  const heatTable = $derived<TableSpec>({
    columns: ['Day', ...HOURS.map((h) => `${String(h).padStart(2, '0')}:00`)],
    rows: cityGrid.map((row, i) => [dayLabels[i], ...row.map((v) => dec(v))]),
  })

  const corridorTable = $derived<TableSpec>({
    columns: ['Corridor', 'Mean congestion', 'Mean speed (km/h)', 'Length (km)'],
    rows: corridorTotals.map(({ corridor, mean }) => [
      corridor.name,
      dec(mean),
      dec(corridor.meanSpeed),
      dec(corridor.lengthKm),
    ]),
  })

  const profileTable = $derived<TableSpec>({
    columns: ['Hour', 'Mean congestion index'],
    rows: HOURS.map((h) => [`${String(h).padStart(2, '0')}:00`, dec(hourlyProfile[h])]),
  })

  const incidentTable = $derived<TableSpec>({
    columns: ['Corridor', 'When', 'Type', 'Severity'],
    rows: data.incidents.map((i) => [
      i.corridor,
      `${DAYS[i.day]} ${String(i.hour).padStart(2, '0')}:00`,
      i.kind,
      i.severity,
    ]),
  })

  const SEVERITY_COLOR = {
    warning: 'var(--status-warning)',
    serious: 'var(--status-serious)',
    critical: 'var(--status-critical)',
  } as const

  const peak = $derived.by(() => {
    let best = { day: 0, hour: 0, value: -Infinity }
    cityGrid.forEach((row, d) =>
      row.forEach((v, h) => {
        if (v > best.value) best = { day: d, hour: h, value: v }
      }),
    )
    return best
  })
</script>

<ViewHeader {meta} />

<div class="container py-8">
  <FilterBar
    ranges={SCOPES}
    range={scope}
    onRange={(v) => (scope = v)}
    rangeLabel="Days"
    live
    note="{data.corridors.length} corridors · {dayIndices.length * 24} hourly readings"
  />

  <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile
      label="Peak congestion index"
      value={dec(peak.value)}
      deltaLabel="{dayLabels[peak.day]} at {String(peak.hour).padStart(2, '0')}:00"
      trend={hourlyProfile}
      seriesSlot={4}
      hero
    />
    <StatTile label="Mean across window" value={dec(stats.mean)} trend={hourlyProfile} seriesSlot={1} />
    <StatTile
      label="Busiest corridor"
      value={corridorTotals[worstIndex].corridor.name}
      seriesSlot={2}
    />
    <StatTile label="Incidents logged" value={int(data.incidents.length)} seriesSlot={8} />
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-3">
    <div class="flex flex-col gap-6 xl:col-span-2">
      <ChartCard
        title="Congestion by hour and day"
        subtitle="Congestion index, 0–100."
        table={heatTable}
        note="Congestion is a magnitude, so this is the sequential case: one hue, light to dark, with a scale legend. A rainbow ramp here would imply category boundaries the data doesn't have."
      >
        <Heatmap
          grid={cityGrid}
          rowLabels={dayLabels}
          columnLabels={HOURS.map((h) => String(h).padStart(2, '0'))}
          valueFormat={(v) => dec(v)}
          cellLabel={(r, c) => `${dayLabels[r]} · ${String(c).padStart(2, '0')}:00`}
          unit="index"
          labelEvery={3}
        />
      </ChartCard>

      <ChartCard
        title="Road network"
        subtitle="Junction load across the ring-and-spoke layout."
        table={corridorTable}
        note="Node positions are fixed rather than force-simulated — a city map that reshuffles on every reload stops reading as a map. Only the vehicles move, and they slow as load rises."
      >
        <TrafficMap
          nodes={data.nodes}
          edges={data.edges}
          load={Math.min(1, stats.mean / 70)}
        />
      </ChartCard>
    </div>

    <div class="flex flex-col gap-6">
      <AiInsightPanel insights={data.insights} />

      <ChartCard
        title="Hourly profile"
        subtitle="Mean congestion across the selected days."
        table={profileTable}
        note="One series, so no legend box — the title already names what is plotted."
      >
        <LineChart
          series={[{ key: 'profile', label: 'Congestion index', slot: 1, values: hourlyProfile }]}
          xs={HOURS}
          xFormat={(v) => `${String(Math.round(v)).padStart(2, '0')}:00`}
          yFormat={(v) => dec(v, 1)}
          area
          zeroBase
          height={220}
          xTickCount={6}
        />
      </ChartCard>

      <ChartCard
        title="Corridor load"
        subtitle="Mean congestion index across the selected days."
        table={corridorTable}
        note="Corridors are nominal categories, so every bar takes the same hue and the one that matters is highlighted. Colouring each bar by its value would re-encode what bar length already shows."
      >
        <BarChart
          items={corridorTotals.map(({ corridor, mean }) => ({
            label: corridor.name,
            value: mean,
            detail: `${dec(corridor.meanSpeed)} km/h mean speed`,
          }))}
          mode="emphasis"
          emphasisIndex={worstIndex}
          valueFormat={(v) => dec(v)}
          labelWidth={128}
          barHeight={22}
        />
      </ChartCard>
    </div>
  </div>

  <ChartCard
    title="Incident log"
    subtitle="Five events across the week."
    table={incidentTable}
    class="mt-6"
    note="Severity wears the status scale, always with a word beside it — a status colour never carries the meaning on its own."
  >
    <ul class="flex flex-col divide-y px-3">
      {#each data.incidents as incident (`${incident.corridor}-${incident.day}-${incident.hour}`)}
        <li class="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
          <span
            class="text-xs font-bold"
            style:color={SEVERITY_COLOR[incident.severity]}
            aria-hidden="true"
          >
            {incident.severity === 'critical' ? '✕' : incident.severity === 'serious' ? '▲' : '!'}
          </span>
          <span
            class="text-[11px] font-semibold uppercase tracking-wider"
            style:color={SEVERITY_COLOR[incident.severity]}
          >
            {incident.severity}
          </span>
          <span class="text-sm font-medium">{incident.kind}</span>
          <span class="text-sm text-muted-foreground">{incident.corridor}</span>
          <span class="ml-auto text-xs tabular-nums text-muted-foreground">
            {DAYS[incident.day]} · {String(incident.hour).padStart(2, '0')}:00
          </span>
        </li>
      {/each}
    </ul>
  </ChartCard>
</div>
