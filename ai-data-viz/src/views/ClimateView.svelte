<script lang="ts">
  import ViewHeader from '@/components/ViewHeader.svelte'
  import ChartCard from '@/components/ChartCard.svelte'
  import FilterBar from '@/components/FilterBar.svelte'
  import StatTile from '@/components/StatTile.svelte'
  import AiInsightPanel from '@/components/AiInsightPanel.svelte'
  import DivergingBars from '@/charts/DivergingBars.svelte'
  import Stripes from '@/charts/Stripes.svelte'
  import RadialCycle from '@/charts/RadialCycle.svelte'
  import LineChart from '@/charts/LineChart.svelte'
  import { getDataset } from '@/data/registry'
  import { generateClimate } from '@/data/climate'
  import { forecast, linearRegression, movingAverage, summarize } from '@/lib/stats'
  import { dec, signed } from '@/lib/format'
  import type { TableSpec } from '@/data/types'

  const meta = getDataset('climate')!
  const data = generateClimate()

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const RANGES = [
    { label: 'Since 1900', value: '1900' },
    { label: 'Since 1950', value: '1950' },
    { label: 'Since 1975', value: '1975' },
  ]
  let from = $state('1900')

  const years = $derived(data.years.filter((y) => y.year >= Number(from)))
  const anomalies = $derived(years.map((y) => y.anomaly))
  const smoothed = $derived(movingAverage(anomalies, Math.min(30, Math.max(5, Math.round(years.length / 6)))))

  const last = $derived(years[years.length - 1])
  const fit = $derived(linearRegression(anomalies))
  const stats = $derived(summarize(anomalies))

  const projection = $derived.by(() => {
    const horizon = 25
    const points = forecast(anomalies, horizon)
    return {
      xs: points.map((_, i) => last.year + i + 1),
      values: points.map((p) => p.value),
      lower: points.map((p) => p.lower),
      upper: points.map((p) => p.upper),
      slot: 8,
    }
  })

  const anomalyTable = $derived<TableSpec>({
    columns: ['Year', 'Anomaly (°C)', 'Smoothed (°C)', 'CO₂ (ppm)'],
    rows: years.map((y, i) => [
      String(y.year),
      signed(y.anomaly, 2),
      smoothed[i] == null ? '—' : signed(smoothed[i], 2),
      String(Math.round(y.co2)),
    ]),
  })

  const seasonalTable = $derived<TableSpec>({
    columns: ['Month', 'Mean anomaly (°C)'],
    rows: data.seasonal.map((v, i) => [MONTHS[i], signed(v, 2)]),
  })

  const decadeTable = $derived<TableSpec>({
    columns: ['Decade', 'Mean anomaly (°C)'],
    rows: data.decades.map((d) => [`${d.decade}s`, signed(d.mean, 2)]),
  })

  const co2Table = $derived<TableSpec>({
    columns: ['Year', 'CO₂ (ppm)', 'Sea level (mm)'],
    rows: years
      .filter((_, i) => i % 5 === 0)
      .map((y) => [String(y.year), String(Math.round(y.co2)), dec(y.seaLevelMm, 1)]),
  })

  const warmest = $derived([...years].sort((a, b) => b.anomaly - a.anomaly)[0])
  const seasonalMean = $derived(summarize(data.seasonal).mean)
</script>

<ViewHeader {meta} />

<div class="container py-8">
  <FilterBar
    ranges={RANGES}
    range={from}
    onRange={(v) => (from = v)}
    rangeLabel="From"
    note="{years.length} annual observations · baseline {data.baselineStart}–{data.baselineEnd}"
  />

  <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile
      label="Anomaly in {last.year}"
      value="{signed(last.anomaly, 2)} °C"
      trend={anomalies.slice(-30)}
      seriesSlot={8}
      hero
    />
    <StatTile
      label="Warming rate"
      value="{dec(fit.slope * 10, 2)} °C / decade"
      deltaLabel="R² {fit.r2.toFixed(2)}"
      trend={anomalies.slice(-30)}
      seriesSlot={2}
    />
    <StatTile label="Warmest year" value={String(warmest.year)} seriesSlot={8} />
    <StatTile
      label="CO₂ concentration"
      value="{Math.round(last.co2)} ppm"
      trend={years.slice(-30).map((y) => y.co2)}
      seriesSlot={4}
      upIsGood={false}
    />
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-3">
    <div class="flex flex-col gap-6 xl:col-span-2">
      <ChartCard
        title="Annual temperature anomaly"
        subtitle="Against the {data.baselineStart}–{data.baselineEnd} mean, with a centred moving average."
        table={anomalyTable}
        note="This is the diverging case: which side of the baseline a year falls on is the whole question. Two hues that read as opposite, a neutral gray at zero — never a hue at the midpoint, and never a rainbow."
      >
        <DivergingBars
          values={anomalies}
          xs={years.map((y) => y.year)}
          xFormat={(v) => String(Math.round(v))}
          valueFormat={(v) => signed(v, 2)}
          trend={smoothed}
          yTitle="°C"
          height={320}
        />
      </ChartCard>

      <ChartCard
        title="Warming stripes"
        subtitle="The same encoding with position removed."
        table={anomalyTable}
        note="Stripes are deliberately paired with the bar chart above rather than shipped alone: colour is never the only route to a value here, and the table view carries every year."
      >
        <div class="px-3 pb-2 pt-1">
          <Stripes
            values={anomalies}
            labels={years.map((y) => String(y.year))}
            valueFormat={(v) => `${signed(v, 2)} °C`}
            labelEvery={Math.max(5, Math.round(years.length / 7))}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Projection to {last.year + 25}"
        subtitle="Linear extrapolation of the fitted trend, with a 95% band."
        table={anomalyTable}
        note="A straight line extended twenty-five years is the weakest claim on this page, and it is drawn that way — dashed, inside a band that widens with distance."
      >
        <LineChart
          series={[{ key: 'anomaly', label: 'Anomaly', slot: 8, values: anomalies }]}
          xs={years.map((y) => y.year)}
          xFormat={(v) => String(Math.round(v))}
          yFormat={(v) => signed(v, 1)}
          tooltipValue={(v) => `${signed(v, 2)} °C`}
          band={projection}
          height={260}
          yTitle="°C"
        />
      </ChartCard>
    </div>

    <div class="flex flex-col gap-6">
      <AiInsightPanel insights={data.insights} />

      <ChartCard
        title="Seasonal cycle"
        subtitle="Mean monthly anomaly over the last decade."
        table={seasonalTable}
        note="December really is adjacent to January, and a linear axis is the one thing that cannot say so."
      >
        <RadialCycle
          values={data.seasonal}
          labels={MONTHS}
          valueFormat={(v) => `${signed(v, 2)} °C`}
          reference={seasonalMean}
          referenceLabel="Decade mean"
          seriesSlot={8}
          height={280}
        />
      </ChartCard>

      <ChartCard
        title="Decadal means"
        subtitle="Every decade in the record."
        table={decadeTable}
        note="Decadal means cross zero, so they get the same diverging treatment as the annual series. A zero-based bar chart would have to shift the baseline to draw them, and a bar whose length no longer starts at zero misstates its own value."
      >
        <DivergingBars
          values={data.decades.map((d) => d.mean)}
          xs={data.decades.map((d) => d.decade)}
          xFormat={(v) => `${Math.round(v)}s`}
          valueFormat={(v) => signed(v, 2)}
          yTitle="°C"
          height={240}
          margin={{ left: 46 }}
        />
      </ChartCard>

      <ChartCard
        title="CO₂ concentration"
        subtitle="Parts per million, sampled every five years."
        table={co2Table}
        note="Plotted as its own chart rather than a second axis on the temperature plot. Two scales sharing one frame would invent a correlation neither series proves."
      >
        <LineChart
          series={[
            { key: 'co2', label: 'CO₂', slot: 4, values: years.map((y) => y.co2) },
          ]}
          xs={years.map((y) => y.year)}
          xFormat={(v) => String(Math.round(v))}
          yFormat={(v) => String(Math.round(v))}
          tooltipValue={(v) => `${Math.round(v)} ppm`}
          area
          height={200}
          yTitle="ppm"
        />
      </ChartCard>
    </div>
  </div>

  <p class="mt-6 text-xs leading-relaxed text-muted-foreground">
    Range of the selected window: {signed(stats.min, 2)} °C to {signed(stats.max, 2)} °C,
    mean {signed(stats.mean, 2)} °C. This is generated data shaped to resemble the
    published record — it is not the record itself.
  </p>
</div>
