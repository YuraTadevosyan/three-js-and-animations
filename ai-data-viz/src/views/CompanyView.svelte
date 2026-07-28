<script lang="ts">
  import ViewHeader from '@/components/ViewHeader.svelte'
  import ChartCard from '@/components/ChartCard.svelte'
  import FilterBar from '@/components/FilterBar.svelte'
  import StatTile from '@/components/StatTile.svelte'
  import AiInsightPanel from '@/components/AiInsightPanel.svelte'
  import MorphChart from '@/charts/MorphChart.svelte'
  import type { MorphMode } from '@/charts/types'
  import LineChart from '@/charts/LineChart.svelte'
  import BarChart from '@/charts/BarChart.svelte'
  import Legend from '@/charts/Legend.svelte'
  import { getDataset } from '@/data/registry'
  import { SEGMENTS, generateCompany } from '@/data/company'
  import { forecast, pctChange } from '@/lib/stats'
  import { compact, fmtMonth, int, money, signedPct } from '@/lib/format'
  import type { TableSpec } from '@/data/types'

  const meta = getDataset('company')!
  const data = generateCompany()

  const RANGES = [
    { label: '12 months', value: '12' },
    { label: '24 months', value: '24' },
    { label: '36 months', value: '36' },
  ]

  let range = $state('24')
  let mode = $state<MorphMode>('stacked')

  const months = $derived(data.months.slice(-Number(range)))

  /**
   * The morph chart plots quarters rather than months: in grouped form, 24
   * months × 4 segments would be 96 bars a few pixels wide, and a mark that thin
   * stops being readable. The monthly detail lives in the line chart and the
   * table view.
   */
  const quarters = $derived.by(() => {
    const buckets = new Map<string, { label: string; segments: number[]; total: number }>()
    for (const m of months) {
      const q = `${m.date.getUTCFullYear()} Q${Math.floor(m.date.getUTCMonth() / 3) + 1}`
      const entry = buckets.get(q) ?? { label: q, segments: SEGMENTS.map(() => 0), total: 0 }
      m.segments.forEach((v, i) => (entry.segments[i] += v))
      entry.total += m.total
      buckets.set(q, entry)
    }
    return [...buckets.values()]
  })

  const morphSeries = $derived(
    SEGMENTS.map((name, i) => ({
      key: name,
      label: name,
      // Slots are bound to the segment, not to its size — filtering the range
      // never repaints a segment a different colour.
      slot: i + 1,
      values: quarters.map((q) => q.segments[i]),
    })),
  )

  const totals = $derived(months.map((m) => m.total))

  const projection = $derived.by(() => {
    const points = forecast(totals, 6)
    const lastDate = months[months.length - 1].date
    const xs = points.map((_, i) => {
      const d = new Date(lastDate)
      d.setUTCMonth(d.getUTCMonth() + i + 1)
      return d.getTime()
    })
    return {
      xs,
      values: points.map((p) => p.value),
      lower: points.map((p) => p.lower),
      upper: points.map((p) => p.upper),
      slot: 1,
    }
  })

  const last = $derived(months[months.length - 1])
  const prev = $derived(months[months.length - 2] ?? last)
  const arr = $derived(last.total * 12)

  const morphTable = $derived<TableSpec>({
    columns: ['Quarter', ...SEGMENTS, 'Total'],
    rows: quarters.map((q) => [q.label, ...q.segments.map((v) => money(v)), money(q.total)]),
  })

  const trendTable = $derived<TableSpec>({
    columns: ['Month', 'Revenue', 'Accounts', 'Net churn', 'NPS'],
    rows: months.map((m) => [
      fmtMonth(m.date),
      money(m.total),
      int(m.accounts),
      `${(m.churn * 100).toFixed(2)}%`,
      String(m.nps),
    ]),
  })

  const funnelTable = $derived<TableSpec>({
    columns: ['Stage', 'Count', 'Conversion from visit'],
    rows: data.funnel.map((f) => [
      f.stage,
      int(f.count),
      `${((f.count / data.funnel[0].count) * 100).toFixed(2)}%`,
    ]),
  })

  const MODES: { label: string; value: MorphMode }[] = [
    { label: 'Stacked', value: 'stacked' },
    { label: 'Grouped', value: 'grouped' },
    { label: '100%', value: 'share' },
    { label: 'Stream', value: 'stream' },
  ]
</script>

<ViewHeader {meta} />

<div class="container py-8">
  <FilterBar
    ranges={RANGES}
    {range}
    onRange={(v) => (range = v)}
    note="{months.length} months · {SEGMENTS.length} segments"
  />

  <!-- KPI row. Exactly one hero figure per view. -->
  <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile
      label="Annualised run rate"
      value={money(arr)}
      delta={pctChange(prev.total * 12, arr)}
      deltaLabel="vs. last month"
      trend={totals.slice(-12)}
      seriesSlot={1}
      hero
    />
    <StatTile
      label="Monthly revenue"
      value={money(last.total)}
      delta={pctChange(prev.total, last.total)}
      deltaLabel="MoM"
      trend={totals.slice(-12)}
      seriesSlot={1}
    />
    <StatTile
      label="Active accounts"
      value={int(last.accounts)}
      delta={pctChange(prev.accounts, last.accounts)}
      deltaLabel="MoM"
      trend={months.slice(-12).map((m) => m.accounts)}
      seriesSlot={3}
    />
    <StatTile
      label="Net revenue churn"
      value="{(last.churn * 100).toFixed(2)}%"
      delta={pctChange(prev.churn, last.churn)}
      deltaLabel="MoM"
      upIsGood={false}
      trend={months.slice(-12).map((m) => m.churn)}
      seriesSlot={2}
    />
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-3">
    <div class="flex flex-col gap-6 xl:col-span-2">
      <ChartCard
        title="Revenue by segment"
        subtitle="One chart, four forms — the marks and the axis morph together."
        table={morphTable}
        note="Stacked answers “how big is the whole”, grouped answers “which segment is biggest”, 100% answers “how is the mix shifting”, and stream answers “how did the composition move” without anchoring to a baseline."
      >
        {#snippet controls()}
          <div class="flex flex-wrap gap-1.5" role="group" aria-label="Chart form">
            {#each MODES as m (m.value)}
              <button
                type="button"
                class="chip"
                aria-pressed={mode === m.value}
                onclick={() => (mode = m.value)}
              >
                {m.label}
              </button>
            {/each}
          </div>
        {/snippet}

        {#snippet legend()}
          <Legend items={SEGMENTS.map((s, i) => ({ label: s, slot: i + 1 }))} mark="rect" />
        {/snippet}

        <MorphChart
          series={morphSeries}
          categories={quarters.map((q) => q.label)}
          {mode}
          height={340}
          valueFormat={(v) => money(v)}
          axisFormat={(v) => compact(v)}
          labelEvery={quarters.length > 8 ? 2 : 1}
        />
      </ChartCard>

      <ChartCard
        title="Total revenue and six-month projection"
        subtitle="Ordinary least squares over the selected window, with a 95% band."
        table={trendTable}
        note="The projection is drawn dashed inside a widening band so it can never be mistaken for an observation. The band widens with distance because a flat one would claim a confidence the fit doesn't have."
      >
        <LineChart
          series={[{ key: 'total', label: 'Total revenue', slot: 1, values: totals }]}
          xs={months.map((m) => m.date.getTime())}
          xFormat={(v) => fmtMonth(new Date(v))}
          yFormat={(v) => compact(v)}
          tooltipValue={(v) => money(v)}
          band={projection}
          area
          height={280}
          marker={{ x: data.months[data.launchIndex].date.getTime(), label: 'Platform launch' }}
        />
      </ChartCard>
    </div>

    <div class="flex flex-col gap-6">
      <AiInsightPanel insights={data.insights} />

      <ChartCard
        title="Acquisition funnel"
        subtitle="Stages are ordered, so they take a one-hue ramp."
        table={funnelTable}
        note="Reordering these stages would change what they mean, which makes them ordinal rather than nominal — the reader should see the order in the colour."
      >
        <BarChart
          items={data.funnel.map((f) => ({
            label: f.stage,
            value: f.count,
            detail: `${((f.count / data.funnel[0].count) * 100).toFixed(2)}% of visits`,
          }))}
          mode="ordinal"
          valueFormat={(v) => compact(v)}
          labelWidth={94}
        />
      </ChartCard>

      <div class="panel p-4">
        <h3 class="text-sm font-semibold">Segment mix</h3>
        <dl class="mt-3 flex flex-col gap-2 text-xs">
          {#each SEGMENTS as name, i (name)}
            {@const share = last.segments[i] / last.total}
            <div class="flex items-center gap-2">
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style:background="var(--series-{i + 1})"
                aria-hidden="true"
              ></span>
              <dt class="flex-1 text-muted-foreground">{name}</dt>
              <dd class="font-medium tabular-nums">{(share * 100).toFixed(1)}%</dd>
              <dd class="w-20 text-right tabular-nums text-muted-foreground">
                {signedPct(pctChange(prev.segments[i], last.segments[i]))}
              </dd>
            </div>
          {/each}
        </dl>
      </div>
    </div>
  </div>
</div>
