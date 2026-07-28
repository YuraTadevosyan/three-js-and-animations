<script lang="ts">
  import { lineRadial, curveCardinalClosed } from 'd3-shape'
  import { scaleLinear } from 'd3-scale'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { seriesVar } from './geometry'

  /**
   * A twelve-month cycle drawn on a circle, because the data itself is
   * cyclical — December really is adjacent to January, and a linear axis is the
   * one thing that cannot say so.
   */

  interface Props {
    values: number[]
    labels: string[]
    valueFormat: (v: number) => string
    /** 1-based categorical slot — see the note in Sparkline on the name. */
    seriesSlot?: number
    height?: number
    /** A reference ring, e.g. the annual mean. */
    reference?: number
    referenceLabel?: string
  }

  let {
    values,
    labels,
    valueFormat,
    seriesSlot = 8,
    height = 300,
    reference,
    referenceLabel = 'Annual mean',
  }: Props = $props()

  let width = $state(0)
  let hover = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const size = $derived(Math.min(width, height))
  const cx = $derived(width / 2)
  const cy = $derived(height / 2)
  const outer = $derived(size * 0.38)
  const inner = $derived(size * 0.12)

  const extent = $derived.by(() => {
    const all = reference == null ? values : [...values, reference]
    const lo = Math.min(...all)
    const hi = Math.max(...all)
    const pad = (hi - lo) * 0.25 || 0.1
    return [lo - pad, hi + pad] as [number, number]
  })

  const radius = $derived(scaleLinear().domain(extent).range([inner, outer]))

  const path = $derived(
    lineRadial<number>()
      .angle((_, i) => (i / values.length) * Math.PI * 2)
      .radius((v) => radius(v))
      .curve(curveCardinalClosed)(values) ?? '',
  )

  function pointAt(i: number, r: number): { x: number; y: number } {
    const a = (i / values.length) * Math.PI * 2 - Math.PI / 2
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  }

  const ticks = $derived(radius.ticks(3))
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Seasonal cycle" class="block">
      <g class="viz-grid" aria-hidden="true">
        {#each ticks as t (t)}
          <circle {cx} {cy} r={radius(t)} fill="none" />
        {/each}
      </g>

      {#each labels as label, i (label)}
        {@const p = pointAt(i, outer + 16)}
        {@const spoke = pointAt(i, outer)}
        <line
          x1={cx}
          y1={cy}
          x2={spoke.x}
          y2={spoke.y}
          stroke="var(--viz-grid)"
          stroke-width="1"
        />
        <text class="viz-tick" x={p.x} y={p.y} text-anchor="middle" dominant-baseline="middle">
          {label}
        </text>
      {/each}

      {#if reference != null}
        <circle
          {cx}
          {cy}
          r={radius(reference)}
          fill="none"
          stroke="var(--viz-muted)"
          stroke-width="1.5"
          stroke-dasharray="4 4"
        />
      {/if}

      <g transform="translate({cx},{cy})">
        <path d={path} fill={seriesVar(seriesSlot)} fill-opacity="0.1" stroke="none" />
        <path
          d={path}
          fill="none"
          stroke={seriesVar(seriesSlot)}
          stroke-width="2"
          stroke-linejoin="round"
        />
      </g>

      {#each values as v, i (i)}
        {@const p = pointAt(i, radius(v))}
        <circle
          cx={p.x}
          cy={p.y}
          r={hover === i ? 5.5 : 4}
          fill={seriesVar(seriesSlot)}
          stroke="var(--viz-surface)"
          stroke-width="2"
        />
        <!-- Hit target far larger than the 8px mark. -->
        <circle
          cx={p.x}
          cy={p.y}
          r="16"
          fill="transparent"
          onpointerenter={() => (hover = i)}
          onpointerleave={() => (hover = null)}
          onpointermove={(e) => {
            const box = (e.currentTarget as SVGCircleElement).ownerSVGElement!.getBoundingClientRect()
            pointer = { x: e.clientX - box.left, y: e.clientY - box.top }
          }}
          role="presentation"
        />
      {/each}
    </svg>

    {#if reference != null}
      <p class="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          class="h-0 w-4 shrink-0 border-t-2 border-dashed"
          style:border-color="var(--viz-muted)"
          aria-hidden="true"
        ></span>
        {referenceLabel} · {valueFormat(reference)}
      </p>
    {/if}

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover != null}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {labels[hover]}
        </p>
        <TooltipRow label="Anomaly" value={valueFormat(values[hover])} color={seriesVar(seriesSlot)} strong />
      {/if}
    </Tooltip>
  {/if}
</div>
