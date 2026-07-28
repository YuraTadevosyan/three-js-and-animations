<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { ordinalVar, roundedBar, seriesVar } from './geometry'
  import type { BarItem } from './types'

  interface Props {
    items: BarItem[]
    valueFormat: (v: number) => string
    /**
     * nominal   — categories with no natural order: every bar wears slot 1, because
     *             colouring by value would re-encode what bar length already shows.
     * ordinal   — an ordered scale (funnel stages, tiers): one hue, stepped.
     * emphasis  — one bar is the story, the rest are context.
     */
    mode?: 'nominal' | 'ordinal' | 'emphasis'
    /** Index of the emphasised bar, when mode is 'emphasis'. */
    emphasisIndex?: number
    barHeight?: number
    /** Room on the right for the direct label at the bar tip. */
    valueGutter?: number
    labelWidth?: number
  }

  let {
    items,
    valueFormat,
    mode = 'nominal',
    emphasisIndex = 0,
    barHeight = 26,
    valueGutter = 62,
    labelWidth = 118,
  }: Props = $props()

  let width = $state(0)
  let hover = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const rowHeight = $derived(barHeight + 10)
  const height = $derived(items.length * rowHeight + 6)
  const plotWidth = $derived(Math.max(20, width - labelWidth - valueGutter))

  const scale = $derived(
    scaleLinear()
      .domain([0, Math.max(1, ...items.map((d) => d.value))])
      .range([0, plotWidth]),
  )

  // Bars are capped at 24px so the row's leftover height stays as air.
  const thickness = $derived(Math.min(24, barHeight))

  function colorOf(item: BarItem, i: number): string {
    if (item.color) return item.color
    if (mode === 'ordinal') {
      const step = items.length <= 1 ? 3 : 1 + Math.round((i / (items.length - 1)) * 4)
      return ordinalVar(step)
    }
    if (mode === 'emphasis') return i === emphasisIndex ? seriesVar(1) : 'var(--viz-muted)'
    return seriesVar(1)
  }
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Bar chart" class="block">
      {#each items as item, i (item.label)}
        {@const y = i * rowHeight + 3}
        {@const w = Math.max(2, scale(item.value))}
        {@const barY = y + (rowHeight - thickness) / 2 - 5}
        <g
          role="listitem"
          onpointerenter={() => (hover = i)}
          onpointerleave={() => (hover = null)}
          onpointermove={(e) => {
            const rect = (e.currentTarget as SVGGElement).ownerSVGElement!.getBoundingClientRect()
            pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
          }}
        >
          <!-- The hit target is the whole row, not the painted bar. -->
          <rect x="0" {y} {width} height={rowHeight} fill="transparent" />
          <text
            class="viz-tick"
            x={labelWidth - 12}
            y={barY + thickness / 2}
            text-anchor="end"
            dominant-baseline="middle"
            fill="var(--viz-ink-2)"
          >
            {item.label}
          </text>
          <path
            d={roundedBar(labelWidth, barY, w, thickness, 4, 'right')}
            fill={colorOf(item, i)}
            opacity={hover != null && hover !== i ? 0.65 : 1}
          />
          <!-- Value at the tip, outside the bar, so it is never clipped by a
               bar too short to hold it. -->
          <text
            class="viz-tick"
            x={labelWidth + w + 8}
            y={barY + thickness / 2}
            dominant-baseline="middle"
            fill="var(--viz-ink-2)"
          >
            {valueFormat(item.value)}
          </text>
        </g>
      {/each}
    </svg>

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover != null}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {items[hover].label}
        </p>
        <TooltipRow
          label="Value"
          value={valueFormat(items[hover].value)}
          color={colorOf(items[hover], hover)}
          strong
        />
        {@const detail = items[hover].detail}
        {#if detail}
          <TooltipRow label="Detail" value={detail} />
        {/if}
      {/if}
    </Tooltip>
  {/if}
</div>
