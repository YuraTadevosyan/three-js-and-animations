<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import { curveMonotoneX, line as d3Line } from 'd3-shape'
  import AxisX from './AxisX.svelte'
  import AxisY from './AxisY.svelte'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { clamp, seriesVar } from './geometry'
  import type { OverlaySeries } from './types'
  import type { Candle } from '@/data/stocks'
  import { compact, dec, fmtTime } from '@/lib/format'

  interface Props {
    bars: Candle[]
    /** Overlays drawn on the price panel — moving averages and the like. */
    overlays?: OverlaySeries[]
    height?: number
    /**
     * The volume panel is a *separate plot stacked below*, with its own axis and
     * its own baseline. It is not a second y-scale on the price plot: a
     * dual-axis chart invents a correlation the data doesn't have.
     */
    volumeHeight?: number
  }

  let { bars, overlays = [], height = 300, volumeHeight = 72 }: Props = $props()

  const MARGIN = { top: 12, right: 20, bottom: 26, left: 58 }
  const PANEL_GAP = 22

  let width = $state(0)
  let hover = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const totalHeight = $derived(height + PANEL_GAP + volumeHeight)
  const innerWidth = $derived(Math.max(10, width - MARGIN.left - MARGIN.right))
  const priceHeight = $derived(Math.max(10, height - MARGIN.top - MARGIN.bottom))

  const step = $derived(bars.length ? innerWidth / bars.length : innerWidth)
  const bodyWidth = $derived(Math.max(1.5, Math.min(11, step - 2)))

  const priceScale = $derived(
    scaleLinear()
      .domain([
        Math.min(...bars.map((b) => b.l)) * 0.999,
        Math.max(...bars.map((b) => b.h)) * 1.001,
      ])
      .nice()
      .range([priceHeight, 0]),
  )

  const volumeScale = $derived(
    scaleLinear()
      .domain([0, Math.max(...bars.map((b) => b.v))])
      .range([volumeHeight, 0]),
  )

  const xTicks = $derived.by(() => {
    if (!bars.length) return []
    const every = Math.max(1, Math.round(bars.length / 6))
    return bars
      .map((b, i) => ({ x: i * step + step / 2, label: fmtTime(b.t), i }))
      .filter((t) => t.i % every === 0)
      .map(({ x, label }) => ({ x, label }))
  })

  const overlayGen = $derived(
    d3Line<number | null>()
      .defined((v) => v != null)
      .x((_, i) => i * step + step / 2)
      .y((v) => priceScale(v as number))
      .curve(curveMonotoneX),
  )

  /** Up and down bars *mean* gain and loss, so they wear status tokens. */
  function colorOf(b: Candle): string {
    return b.c >= b.o ? 'var(--status-good)' : 'var(--status-critical)'
  }

  function onMove(event: PointerEvent) {
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect()
    const px = event.clientX - rect.left
    hover = clamp(Math.floor(px / step), 0, bars.length - 1)
    pointer = { x: MARGIN.left + px, y: MARGIN.top + clamp(event.clientY - rect.top, 0, priceHeight) }
  }

  function onKey(event: KeyboardEvent) {
    const current = hover ?? bars.length - 1
    let next = current
    if (event.key === 'ArrowRight') next = Math.min(bars.length - 1, current + 1)
    else if (event.key === 'ArrowLeft') next = Math.max(0, current - 1)
    else if (event.key === 'Escape') {
      hover = null
      return
    } else return
    event.preventDefault()
    hover = next
    pointer = { x: MARGIN.left + next * step + step / 2, y: MARGIN.top + priceHeight / 2 }
  }
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0 && bars.length > 1}
    <svg {width} height={totalHeight} role="img" aria-label="Price candles with a volume panel" class="block">
      <!-- Price panel -->
      <g transform="translate({MARGIN.left},{MARGIN.top})">
        <AxisY scale={priceScale} {innerWidth} count={5} format={(v) => dec(v, 2)} />

        {#each bars as b, i (i)}
          {@const cx = i * step + step / 2}
          {@const color = colorOf(b)}
          {@const top = priceScale(Math.max(b.o, b.c))}
          {@const bottom = priceScale(Math.min(b.o, b.c))}
          <g opacity={hover != null && hover !== i ? 0.55 : 1}>
            <line x1={cx} x2={cx} y1={priceScale(b.h)} y2={priceScale(b.l)} stroke={color} stroke-width="1" />
            <rect
              x={cx - bodyWidth / 2}
              y={top}
              width={bodyWidth}
              height={Math.max(1, bottom - top)}
              fill={color}
              rx="1"
            />
          </g>
        {/each}

        {#each overlays as o (o.key)}
          <path
            d={overlayGen(o.values) ?? ''}
            fill="none"
            stroke={seriesVar(o.slot)}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        {/each}

        {#if hover != null}
          {@const hx = hover * step + step / 2}
          <line x1={hx} x2={hx} y1="0" y2={priceHeight} stroke="var(--viz-axis)" stroke-width="1" />
        {/if}

        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <rect
          x="0"
          y="0"
          width={innerWidth}
          height={priceHeight}
          fill="transparent"
          tabindex="0"
          role="application"
          aria-label="Price bars. Use the arrow keys to step between bars."
          onpointermove={onMove}
          onpointerleave={() => (hover = null)}
          onkeydown={onKey}
          onfocus={() => (hover ??= bars.length - 1)}
          onblur={() => (hover = null)}
        />
      </g>

      <!-- Volume panel: its own plot, its own axis, its own baseline. -->
      <g transform="translate({MARGIN.left},{MARGIN.top + priceHeight + PANEL_GAP})">
        <text class="viz-axis-title" x="0" y="-8">Volume</text>
        <AxisY
          scale={volumeScale}
          {innerWidth}
          count={2}
          format={(v) => compact(v)}
          grid={false}
        />
        {#each bars as b, i (i)}
          {@const h = volumeHeight - volumeScale(b.v)}
          <rect
            x={i * step + (step - bodyWidth) / 2}
            y={volumeScale(b.v)}
            width={bodyWidth}
            height={Math.max(0.5, h)}
            fill={colorOf(b)}
            opacity={hover != null && hover !== i ? 0.35 : 0.62}
          />
        {/each}
        <AxisX ticks={xTicks} innerHeight={volumeHeight} {innerWidth} />
      </g>
    </svg>

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover != null}
        {@const b = bars[hover]}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {fmtTime(b.t)}
        </p>
        <TooltipRow label="Open" value={dec(b.o, 2)} />
        <TooltipRow label="High" value={dec(b.h, 2)} />
        <TooltipRow label="Low" value={dec(b.l, 2)} />
        <TooltipRow label="Close" value={dec(b.c, 2)} color={colorOf(b)} strong />
        <TooltipRow label="Volume" value={compact(b.v)} />
        {#each overlays as o (o.key)}
          {@const v = o.values[hover]}
          {#if v != null}
            <TooltipRow label={o.label} value={dec(v, 2)} color={seriesVar(o.slot)} />
          {/if}
        {/each}
      {/if}
    </Tooltip>
  {/if}
</div>
