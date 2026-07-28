<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { roundedBar } from './geometry'
  import type { BookLevel } from '@/data/stocks'
  import { compact, dec } from '@/lib/format'

  interface Props {
    bids: BookLevel[]
    asks: BookLevel[]
    mid: number
    rowHeight?: number
  }

  let { bids, asks, mid, rowHeight = 20 }: Props = $props()

  let width = $state(0)
  let hover = $state<{ side: 'bid' | 'ask'; i: number } | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const rows = $derived(Math.min(bids.length, asks.length))
  const height = $derived(rows * rowHeight + 26)

  const CENTER_W = 92
  const armWidth = $derived(Math.max(20, (width - CENTER_W) / 2))

  const scale = $derived(
    scaleLinear()
      .domain([0, Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size))])
      .range([0, armWidth]),
  )

  const barHeight = $derived(Math.min(14, rowHeight - 6))

  /**
   * Resting depth is polarity data — which side of the mid the liquidity sits on
   * — so it takes the diverging pair: two hues that read as opposite, with the
   * mid price itself as the neutral centre.
   */
  const BID = 'var(--div-neg-2)'
  const ASK = 'var(--div-pos-2)'
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Order book depth by level" class="block">
      <text class="viz-axis-title" x={armWidth - 8} y="12" text-anchor="end">Bids</text>
      <text class="viz-axis-title" x={armWidth + CENTER_W + 8} y="12" text-anchor="start">Asks</text>

      {#each Array(rows) as _, i (i)}
        {@const y = 22 + i * rowHeight}
        {@const by = y + (rowHeight - barHeight) / 2}
        {@const bw = scale(bids[i].size)}
        {@const aw = scale(asks[i].size)}
        <g
          onpointerleave={() => (hover = null)}
          onpointermove={(e) => {
            const box = (e.currentTarget as SVGGElement).ownerSVGElement!.getBoundingClientRect()
            const x = e.clientX - box.left
            pointer = { x, y: e.clientY - box.top }
            hover = { side: x < armWidth + CENTER_W / 2 ? 'bid' : 'ask', i }
          }}
          role="listitem"
        >
          <rect x="0" {y} {width} height={rowHeight} fill="transparent" />
          <path
            d={roundedBar(armWidth - bw, by, bw, barHeight, 4, 'left')}
            fill={BID}
            opacity={hover && !(hover.side === 'bid' && hover.i === i) ? 0.62 : 1}
          />
          <path
            d={roundedBar(armWidth + CENTER_W, by, aw, barHeight, 4, 'right')}
            fill={ASK}
            opacity={hover && !(hover.side === 'ask' && hover.i === i) ? 0.62 : 1}
          />
          <text
            class="viz-tick"
            x={armWidth + CENTER_W / 2}
            y={y + rowHeight / 2}
            text-anchor="middle"
            dominant-baseline="middle"
            fill="var(--viz-ink-2)"
          >
            {dec(bids[i].price, 2)} / {dec(asks[i].price, 2)}
          </text>
        </g>
      {/each}
    </svg>

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          Level {hover.i + 1} · {hover.side === 'bid' ? 'Bid' : 'Ask'}
        </p>
        <TooltipRow
          label="Price"
          value={dec(hover.side === 'bid' ? bids[hover.i].price : asks[hover.i].price, 2)}
          color={hover.side === 'bid' ? BID : ASK}
          strong
        />
        <TooltipRow
          label="Cumulative size"
          value={compact(hover.side === 'bid' ? bids[hover.i].size : asks[hover.i].size)}
        />
        <TooltipRow label="Distance from mid" value={`${dec(Math.abs((hover.side === 'bid' ? bids[hover.i].price : asks[hover.i].price) - mid) / mid * 100, 2)}%`} />
      {/if}
    </Tooltip>
  {/if}
</div>
