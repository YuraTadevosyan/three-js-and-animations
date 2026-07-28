<script lang="ts">
  interface Tick {
    /** Pixel position along the plot's x range. */
    x: number
    label: string
  }

  interface Props {
    ticks: Tick[]
    innerHeight: number
    innerWidth: number
    /** Vertical gridlines. Off by default — a time axis rarely needs them. */
    grid?: boolean
    /** The baseline rule under the plot. */
    rule?: boolean
  }

  let { ticks, innerHeight, innerWidth, grid = false, rule = true }: Props = $props()
</script>

{#if grid}
  <g class="viz-grid" aria-hidden="true">
    {#each ticks as t (t.x)}
      <line x1={t.x} x2={t.x} y1="0" y2={innerHeight} />
    {/each}
  </g>
{/if}

{#if rule}
  <line class="viz-axis-line" x1="0" x2={innerWidth} y1={innerHeight} y2={innerHeight} />
{/if}

<g aria-hidden="true">
  {#each ticks as t (t.x)}
    <text class="viz-tick" x={t.x} y={innerHeight + 16} text-anchor="middle">{t.label}</text>
  {/each}
</g>
