<script lang="ts">
  import ViewHeader from '@/components/ViewHeader.svelte'
  import ChartCard from '@/components/ChartCard.svelte'
  import FilterBar from '@/components/FilterBar.svelte'
  import StatTile from '@/components/StatTile.svelte'
  import AiInsightPanel from '@/components/AiInsightPanel.svelte'
  import ForceGraph from '@/charts/ForceGraph.svelte'
  import LineChart from '@/charts/LineChart.svelte'
  import ShareBar from '@/charts/ShareBar.svelte'
  import Histogram from '@/charts/Histogram.svelte'
  import Legend from '@/charts/Legend.svelte'
  import { getDataset } from '@/data/registry'
  import { NODE_CLASSES, generateNetwork } from '@/data/network'
  import { pctChange, summarize } from '@/lib/stats'
  import { compact, dec, int } from '@/lib/format'
  import type { TableSpec } from '@/data/types'

  const meta = getDataset('network')!
  const data = generateNetwork()

  const WINDOWS = [
    { label: '60 s', value: '60' },
    { label: '120 s', value: '120' },
    { label: '180 s', value: '180' },
  ]
  let window = $state('180')

  const throughput = $derived(data.throughput.slice(-Number(window)))
  const stats = $derived(summarize(throughput))
  const saturated = $derived(data.links.filter((l) => l.util > 0.85).length)
  const totalPps = $derived(data.nodes.reduce((a, n) => a + n.pps, 0))

  const nodeTable = $derived<TableSpec>({
    columns: ['Node', 'Class', 'Packets / s', 'Latency (ms)'],
    rows: [...data.nodes]
      .sort((a, b) => b.pps - a.pps)
      .map((n) => [
        n.name,
        NODE_CLASSES.find((c) => c.key === n.cls)?.label ?? n.cls,
        compact(n.pps),
        dec(n.latencyMs, 1),
      ]),
  })

  const throughputTable = $derived<TableSpec>({
    columns: ['t (s)', 'Throughput (Gbps)'],
    rows: throughput.map((v, i) => [`+${i}`, dec(v, 2)]),
  })

  const protocolTable = $derived<TableSpec>({
    columns: ['Protocol', 'Share', 'Packets / s'],
    rows: data.protocols.map((p) => [
      p.name,
      `${(p.share * 100).toFixed(1)}%`,
      compact(totalPps * p.share),
    ]),
  })

  const latencyTable = $derived<TableSpec>({
    columns: ['Bucket (ms)', 'Samples', 'Share'],
    rows: data.latency.map((b, i) => [
      `${i === 0 ? 0 : data.latency[i - 1].bucket}–${b.bucket}`,
      int(b.count),
      `${((b.count / data.latency.reduce((a, x) => a + x.count, 0)) * 100).toFixed(1)}%`,
    ]),
  })

  const classCounts = $derived(
    NODE_CLASSES.map((c) => ({
      ...c,
      count: data.nodes.filter((n) => n.cls === c.key).length,
    })),
  )
</script>

<ViewHeader {meta} />

<div class="container py-8">
  <FilterBar
    ranges={WINDOWS}
    range={window}
    onRange={(v) => (window = v)}
    rangeLabel="Window"
    live
    note="{data.nodes.length} nodes · {data.links.length} links"
  />

  <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile
      label="Aggregate throughput"
      value="{dec(throughput[throughput.length - 1], 1)} Gbps"
      delta={pctChange(stats.mean, throughput[throughput.length - 1])}
      deltaLabel="vs. window mean"
      trend={throughput.slice(-40)}
      seriesSlot={5}
      hero
    />
    <StatTile label="Peak in window" value="{dec(stats.max, 1)} Gbps" trend={throughput.slice(-40)} seriesSlot={1} />
    <StatTile label="Forwarding rate" value="{compact(totalPps)} pps" seriesSlot={3} />
    <StatTile
      label="Links above 85% util"
      value="{saturated} / {data.links.length}"
      upIsGood={false}
      seriesSlot={2}
    />
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-3">
    <div class="flex flex-col gap-6 xl:col-span-2">
      <ChartCard
        title="Fabric topology"
        subtitle="Packets integrated along each link, every frame."
        table={nodeTable}
        note="A node-link diagram is an all-pairs form — any two nodes can end up adjacent — so the palette caps it at three classes. Shape carries the class as well as hue, and the four core routers are directly labelled."
      >
        {#snippet legend()}
          <Legend
            items={classCounts.map((c) => ({ label: `${c.label} (${c.count})`, slot: c.slot }))}
            mark="dot"
          />
        {/snippet}

        <ForceGraph nodes={data.nodes} links={data.links} height={440} />
      </ChartCard>

      <ChartCard
        title="Throughput"
        subtitle="Aggregate Gbps across the fabric."
        table={throughputTable}
        note="The burst near the end of the window is 4σ above the trailing baseline — the analyst flags it as volumetric rather than organic, because organic growth doesn't arrive in fourteen seconds."
      >
        <LineChart
          series={[{ key: 'gbps', label: 'Throughput', slot: 5, values: throughput }]}
          xs={throughput.map((_, i) => i)}
          xFormat={(v) => `+${Math.round(v)}s`}
          yFormat={(v) => `${Math.round(v)}`}
          tooltipValue={(v) => `${dec(v, 2)} Gbps`}
          area
          zeroBase
          height={240}
          yTitle="Gbps"
        />
      </ChartCard>
    </div>

    <div class="flex flex-col gap-6">
      <AiInsightPanel insights={data.insights} />

      <ChartCard
        title="Protocol mix"
        subtitle="Share of forwarded packets."
        table={protocolTable}
        note="Labels only go inside a segment when the rendered text genuinely fits with padding — the rest fall back to the legend and the tooltip rather than being clipped."
      >
        {#snippet legend()}
          <Legend items={data.protocols.map((p) => ({ label: p.name, slot: p.slot }))} mark="rect" />
        {/snippet}

        <div class="px-3 pb-1 pt-2">
          <ShareBar
            segments={data.protocols.map((p) => ({
              label: p.name,
              slot: p.slot,
              value: p.share * totalPps,
            }))}
            valueFormat={(v) => `${compact(v)} pps`}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Latency distribution"
        subtitle="Client subnets, log-normal by construction."
        table={latencyTable}
        note="Buckets are ordered, so they take a one-hue ramp — reordering them would destroy the meaning, which is what makes them ordinal rather than nominal."
      >
        <Histogram
          bins={data.latency.map((b) => ({ label: `≤${b.bucket}`, count: b.count }))}
          valueFormat={(v) => compact(v)}
          height={230}
          yTitle="samples"
        />
      </ChartCard>
    </div>
  </div>
</div>
