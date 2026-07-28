<script lang="ts">
  import type { ScaleLinear } from 'd3-scale'

  interface Props {
    scale: ScaleLinear<number, number>
    innerWidth: number
    /** Tick count hint; d3 rounds to clean numbers from here. */
    count?: number
    format?: (v: number) => string
    /** Hairline gridlines across the plot. Solid, one step off the surface. */
    grid?: boolean
    title?: string
    /** Draw a zero rule at a heavier weight — for diverging plots. */
    zeroRule?: boolean
  }

  let {
    scale,
    innerWidth,
    count = 5,
    format = (v: number) => String(v),
    grid = true,
    title,
    zeroRule = false,
  }: Props = $props()

  const ticks = $derived(scale.ticks(count))
</script>

{#if grid}
  <g class="viz-grid" aria-hidden="true">
    {#each ticks as t (t)}
      <line x1="0" x2={innerWidth} y1={scale(t)} y2={scale(t)} />
    {/each}
  </g>
{/if}

{#if zeroRule && scale.domain()[0] < 0 && scale.domain()[1] > 0}
  <line class="viz-axis-line" x1="0" x2={innerWidth} y1={scale(0)} y2={scale(0)} />
{/if}

<g aria-hidden="true">
  {#each ticks as t (t)}
    <text class="viz-tick" x="-10" y={scale(t)} text-anchor="end" dominant-baseline="middle">
      {format(t)}
    </text>
  {/each}
</g>

{#if title}
  <text class="viz-axis-title" x="0" y="-2" text-anchor="start">{title}</text>
{/if}
