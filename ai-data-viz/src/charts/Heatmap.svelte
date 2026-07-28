<script lang="ts">
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { seqVar } from './geometry'

  interface Props {
    /** rows × columns of magnitude. */
    grid: number[][]
    rowLabels: string[]
    columnLabels: string[]
    valueFormat: (v: number) => string
    /** Shown in the tooltip header, e.g. "Mon · 08:00". */
    cellLabel?: (row: number, col: number) => string
    /** Label every nth column, so the axis never crowds. */
    labelEvery?: number
    cellHeight?: number
    unit?: string
  }

  let {
    grid,
    rowLabels,
    columnLabels,
    valueFormat,
    cellLabel,
    labelEvery = 2,
    cellHeight = 26,
    unit = '',
  }: Props = $props()

  let width = $state(0)
  let hover = $state<{ r: number; c: number } | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const LABEL_W = 40
  const TOP = 20

  const cols = $derived(columnLabels.length)
  const cellWidth = $derived(Math.max(4, (width - LABEL_W) / Math.max(1, cols)))
  const height = $derived(rowLabels.length * cellHeight + TOP + 8)

  const extent = $derived.by(() => {
    const flat = grid.flat()
    return [Math.min(...flat), Math.max(...flat)] as [number, number]
  })

  /**
   * Magnitude is a sequential job: one hue, light→dark, never a rainbow. The
   * scale legend below the grid is what makes a continuous colour encoding
   * readable — and the table view carries the exact numbers.
   */
  function fillOf(v: number): string {
    const [lo, hi] = extent
    return seqVar(hi === lo ? 0.5 : (v - lo) / (hi - lo))
  }

  const legendStops = [0, 0.2, 0.4, 0.6, 0.8, 1]
</script>

<div class="w-full">
  <div class="relative w-full" bind:clientWidth={width}>
    {#if width > 0}
      <svg {width} {height} role="img" aria-label="Congestion heatmap by hour and day" class="block">
        <g aria-hidden="true">
          {#each columnLabels as label, c (label)}
            {#if c % labelEvery === 0}
              <text class="viz-tick" x={LABEL_W + c * cellWidth + cellWidth / 2} y="12" text-anchor="middle">
                {label}
              </text>
            {/if}
          {/each}
        </g>

        {#each grid as row, r (rowLabels[r])}
          <text
            class="viz-tick"
            x={LABEL_W - 10}
            y={TOP + r * cellHeight + cellHeight / 2}
            text-anchor="end"
            dominant-baseline="middle"
            fill="var(--viz-ink-2)"
          >
            {rowLabels[r]}
          </text>
          {#each row as value, c (c)}
            {@const isHover = hover?.r === r && hover?.c === c}
            <rect
              x={LABEL_W + c * cellWidth}
              y={TOP + r * cellHeight}
              width={Math.max(1, cellWidth - 2)}
              height={cellHeight - 2}
              rx="2"
              fill={fillOf(value)}
              stroke={isHover ? 'var(--viz-ink)' : 'none'}
              stroke-width="1.5"
              onpointerenter={() => (hover = { r, c })}
              onpointermove={(e) => {
                const box = (e.currentTarget as SVGRectElement).ownerSVGElement!.getBoundingClientRect()
                pointer = { x: e.clientX - box.left, y: e.clientY - box.top }
              }}
              onpointerleave={() => (hover = null)}
              role="presentation"
            />
          {/each}
        {/each}
      </svg>

      <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
        {#if hover}
          <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
            {cellLabel ? cellLabel(hover.r, hover.c) : `${rowLabels[hover.r]} · ${columnLabels[hover.c]}`}
          </p>
          <TooltipRow label={unit || 'Value'} value={valueFormat(grid[hover.r][hover.c])} strong />
        {/if}
      </Tooltip>
    {/if}
  </div>

  <!-- A continuous colour encoding is unreadable without its scale. -->
  <div class="mt-3 flex items-center gap-2 pl-10 text-xs text-muted-foreground">
    <span class="tabular-nums">{valueFormat(extent[0])}</span>
    <span class="flex h-2.5 flex-1 max-w-[220px] overflow-hidden rounded-full" aria-hidden="true">
      {#each legendStops as t (t)}
        <span class="flex-1" style:background={seqVar(t)}></span>
      {/each}
    </span>
    <span class="tabular-nums">{valueFormat(extent[1])}</span>
    {#if unit}<span class="ml-1">{unit}</span>{/if}
  </div>
</div>
