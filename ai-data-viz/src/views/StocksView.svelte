<script lang="ts">
  import ViewHeader from '@/components/ViewHeader.svelte'
  import ChartCard from '@/components/ChartCard.svelte'
  import FilterBar from '@/components/FilterBar.svelte'
  import StatTile from '@/components/StatTile.svelte'
  import AiInsightPanel from '@/components/AiInsightPanel.svelte'
  import CandleChart from '@/charts/CandleChart.svelte'
  import DepthLadder from '@/charts/DepthLadder.svelte'
  import Legend from '@/charts/Legend.svelte'
  import { getDataset } from '@/data/registry'
  import { generateStocks, nextCandle, type Candle } from '@/data/stocks'
  import { movingAverage, pctChange, summarize, volatility } from '@/lib/stats'
  import { Rng } from '@/lib/rng'
  import { onInterval } from '@/lib/ticker'
  import { compact, dec, fmtTime } from '@/lib/format'
  import type { TableSpec } from '@/data/types'

  const meta = getDataset('stocks')!
  const base = generateStocks()

  const RANGES = [
    { label: '30 min', value: '30' },
    { label: '1 hour', value: '60' },
    { label: '2 hours', value: '120' },
    { label: 'Full session', value: '390' },
  ]

  let range = $state('120')
  let ticker = $state(base.instruments[0].ticker)
  let live = $state(true)

  /** Bars appended by the live tape, keyed by ticker. */
  let appended = $state<Record<string, Candle[]>>({})

  const rng = new Rng('live-tape')

  $effect(() => {
    if (!live) return
    return onInterval(1400, () => {
      const inst = base.instruments.find((i) => i.ticker === ticker)
      if (!inst) return
      const existing = appended[ticker] ?? []
      const source = { ...inst, candles: [...inst.candles, ...existing] }
      const bar = nextCandle(source, rng)
      // Cap the tape so a long-running tab doesn't grow without bound.
      appended = { ...appended, [ticker]: [...existing, bar].slice(-240) }
    })
  })

  const instrument = $derived(base.instruments.find((i) => i.ticker === ticker)!)
  const allBars = $derived([...instrument.candles, ...(appended[ticker] ?? [])])
  const bars = $derived(allBars.slice(-Number(range)))

  const sma20 = $derived(movingAverage(allBars.map((b) => b.c), 20).slice(-bars.length))
  const sma50 = $derived(movingAverage(allBars.map((b) => b.c), 50).slice(-bars.length))

  const first = $derived(bars[0])
  const last = $derived(bars[bars.length - 1])
  const sessionOpen = $derived(instrument.candles[0].o)
  const dayChange = $derived(pctChange(sessionOpen, last.c))
  const volStats = $derived(summarize(bars.map((b) => b.v)))
  const annualVol = $derived(volatility(allBars.map((b) => b.c), 390 * 252))

  const priceTable = $derived<TableSpec>({
    columns: ['Time', 'Open', 'High', 'Low', 'Close', 'Volume'],
    rows: bars.map((b) => [
      fmtTime(b.t),
      dec(b.o, 2),
      dec(b.h, 2),
      dec(b.l, 2),
      dec(b.c, 2),
      compact(b.v),
    ]),
  })

  const bookTable = $derived<TableSpec>({
    columns: ['Level', 'Bid price', 'Bid size', 'Ask price', 'Ask size'],
    rows: instrument.bids.map((b, i) => [
      String(i + 1),
      dec(b.price, 2),
      compact(b.size),
      dec(instrument.asks[i].price, 2),
      compact(instrument.asks[i].size),
    ]),
  })
</script>

<ViewHeader {meta} />

<div class="container py-8">
  <FilterBar
    ranges={RANGES}
    {range}
    onRange={(v) => (range = v)}
    rangeLabel="Window"
    {live}
    note="{bars.length} bars · 1 min"
  >
    <div class="flex items-center gap-2">
      <label class="text-xs font-medium text-muted-foreground" for="ticker">Instrument</label>
      <select
        id="ticker"
        class="rounded-md border bg-card px-2.5 py-1.5 text-xs"
        bind:value={ticker}
      >
        {#each base.instruments as inst (inst.ticker)}
          <option value={inst.ticker}>{inst.ticker} — {inst.name}</option>
        {/each}
      </select>
    </div>
    <button type="button" class="chip" aria-pressed={live} onclick={() => (live = !live)}>
      {live ? 'Pause tape' : 'Resume tape'}
    </button>
  </FilterBar>

  <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile
      label="{instrument.ticker} last"
      value={dec(last.c, 2)}
      delta={dayChange}
      deltaLabel="vs. session open"
      trend={bars.slice(-40).map((b) => b.c)}
      seriesSlot={1}
      hero
    />
    <StatTile
      label="Window range"
      value="{dec(Math.min(...bars.map((b) => b.l)), 2)} – {dec(Math.max(...bars.map((b) => b.h)), 2)}"
      trend={bars.slice(-40).map((b) => b.h - b.l)}
      seriesSlot={2}
    />
    <StatTile
      label="Realised volatility"
      value="{(annualVol * 100).toFixed(1)}%"
      deltaLabel="annualised"
      trend={bars.slice(-40).map((b) => Math.abs(b.c - b.o))}
      seriesSlot={4}
    />
    <StatTile
      label="Median bar volume"
      value={compact(volStats.p50)}
      delta={pctChange(volStats.p50, bars[bars.length - 1].v)}
      deltaLabel="latest vs. median"
      trend={bars.slice(-40).map((b) => b.v)}
      seriesSlot={3}
    />
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-3">
    <div class="flex flex-col gap-6 xl:col-span-2">
      <ChartCard
        title="{instrument.ticker} · {instrument.name}"
        subtitle="One-minute bars with a separate volume panel below."
        table={priceTable}
        note="Volume is a stacked panel with its own axis and its own baseline — not a second y-scale on the price plot. Two scales on one plot invent a correlation the data doesn't contain."
      >
        {#snippet legend()}
          <Legend
            items={[
              { label: 'Up bar', color: 'var(--status-good)', mark: 'rect' },
              { label: 'Down bar', color: 'var(--status-critical)', mark: 'rect' },
              { label: 'SMA 20', slot: 1, mark: 'line' },
              { label: 'SMA 50', slot: 4, mark: 'line' },
            ]}
          />
        {/snippet}

        <CandleChart
          {bars}
          overlays={[
            { key: 'sma20', label: 'SMA 20', slot: 1, values: sma20 },
            { key: 'sma50', label: 'SMA 50', slot: 4, values: sma50 },
          ]}
          height={320}
        />
      </ChartCard>

      <ChartCard
        title="Order book depth"
        subtitle="Cumulative resting size across fourteen levels each side."
        table={bookTable}
        note="Which side of the mid liquidity is resting on is polarity data, so it takes the diverging pair: cool below, warm above, with the mid price itself as the neutral centre."
      >
        <DepthLadder bids={instrument.bids} asks={instrument.asks} mid={last.c} />
      </ChartCard>
    </div>

    <div class="flex flex-col gap-6">
      <AiInsightPanel insights={base.insights[ticker]} runId={ticker.length} />

      <div class="panel p-4">
        <h3 class="text-sm font-semibold">Session summary</h3>
        <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <dt class="text-muted-foreground">Session open</dt>
            <dd class="mt-0.5 font-medium tabular-nums">{dec(sessionOpen, 2)}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Window open</dt>
            <dd class="mt-0.5 font-medium tabular-nums">{dec(first.o, 2)}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Window volume</dt>
            <dd class="mt-0.5 font-medium tabular-nums">
              {compact(bars.reduce((a, b) => a + b.v, 0))}
            </dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Bars elapsed</dt>
            <dd class="mt-0.5 font-medium tabular-nums">{allBars.length}</dd>
          </div>
        </dl>
        <p class="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
          Up and down bars wear the status scale rather than categorical slots:
          here the colour genuinely means gain or loss, and a status colour must
          never stand in for “series 4”.
        </p>
      </div>
    </div>
  </div>
</div>
