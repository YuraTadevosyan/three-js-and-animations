<script lang="ts">
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { clamp, divVar } from './geometry'

  interface Props {
    values: number[]
    labels: string[]
    valueFormat: (v: number) => string
    height?: number
    /** Label every nth stripe under the band. */
    labelEvery?: number
  }

  let { values, labels, valueFormat, height = 92, labelEvery = 20 }: Props = $props()

  let width = $state(0)
  let hover = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const BAND = $derived(height - 22)
  const step = $derived(values.length ? width / values.length : width)
  const extent = $derived(Math.max(...values.map((v) => Math.abs(v))))

  const LEGEND_STEPS = ['neg-3', 'neg-2', 'neg-1', 'mid', 'pos-1', 'pos-2', 'pos-3']

  function onMove(event: PointerEvent) {
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect()
    const px = event.clientX - rect.left
    hover = clamp(Math.floor(px / step), 0, values.length - 1)
    pointer = { x: px, y: event.clientY - rect.top }
  }
</script>

<!--
  Warming stripes: the same diverging encoding as the bar chart, with position
  removed so a century reads as one gradient. It is deliberately paired with the
  bar chart above it — colour alone is never the only way to get a value here,
  and the table view carries every year.
-->
<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Warming stripes, one stripe per year" class="block">
      {#each values as v, i (i)}
        <rect
          x={i * step}
          y="0"
          width={Math.ceil(step) + 0.5}
          height={BAND}
          fill={divVar(v, extent)}
          opacity={hover != null && hover !== i ? 0.62 : 1}
        />
      {/each}

      {#if hover != null}
        <rect
          x={hover * step}
          y="0"
          width={Math.max(2, step)}
          height={BAND}
          fill="none"
          stroke="var(--viz-ink)"
          stroke-width="1.5"
        />
      {/if}

      {#each labels as label, i (label)}
        {#if i % labelEvery === 0}
          <text class="viz-tick" x={i * step + step / 2} y={BAND + 15} text-anchor="middle">
            {label}
          </text>
        {/if}
      {/each}

      <rect
        x="0"
        y="0"
        {width}
        height={BAND}
        fill="transparent"
        onpointermove={onMove}
        onpointerleave={() => (hover = null)}
        role="presentation"
      />
    </svg>

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover != null}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {labels[hover]}
        </p>
        <TooltipRow
          label="Anomaly"
          value={valueFormat(values[hover])}
          color={divVar(values[hover], extent)}
          strong
        />
      {/if}
    </Tooltip>

    <!-- Position is gone here, so colour is the whole encoding — which makes the
         scale legend mandatory rather than decorative. -->
    <div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
      <span class="tabular-nums">{valueFormat(-extent)}</span>
      <span class="flex h-2.5 flex-1 max-w-[220px] overflow-hidden rounded-full" aria-hidden="true">
        {#each LEGEND_STEPS as stepName (stepName)}
          <span class="flex-1" style:background="var(--div-{stepName})"></span>
        {/each}
      </span>
      <span class="tabular-nums">{valueFormat(extent)}</span>
    </div>
  {/if}
</div>
