<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import AxisX from './AxisX.svelte'
  import AxisY from './AxisY.svelte'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { MARGIN, ordinalVar, roundedBar, type Margin } from './geometry'

  /**
   * Buckets are *ordinal*, not nominal — reordering them would destroy the
   * meaning — so they take a one-hue ramp rather than eight categorical
   * identities.
   */

  interface Props {
    bins: { label: string; count: number }[]
    height?: number
    margin?: Partial<Margin>
    valueFormat: (v: number) => string
    yTitle?: string
  }

  let { bins, height = 240, margin: marginOverride, valueFormat, yTitle }: Props = $props()

  const margin = $derived<Margin>({ ...MARGIN, ...marginOverride })

  let width = $state(0)
  let hover = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const innerWidth = $derived(Math.max(10, width - margin.left - margin.right))
  const innerHeight = $derived(Math.max(10, height - margin.top - margin.bottom))
  const step = $derived(bins.length ? innerWidth / bins.length : innerWidth)
  const barWidth = $derived(Math.max(2, Math.min(48, step - 6)))

  const yScale = $derived(
    scaleLinear()
      .domain([0, Math.max(1, ...bins.map((b) => b.count))])
      .nice()
      .range([innerHeight, 0]),
  )

  const xTicks = $derived(bins.map((b, i) => ({ x: i * step + step / 2, label: b.label })))

  const total = $derived(bins.reduce((a, b) => a + b.count, 0))

  function colorOf(i: number): string {
    const stepIdx = bins.length <= 1 ? 3 : 1 + Math.round((i / (bins.length - 1)) * 4)
    return ordinalVar(stepIdx)
  }
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Distribution histogram" class="block">
      <g transform="translate({margin.left},{margin.top})">
        <AxisY scale={yScale} {innerWidth} format={valueFormat} title={yTitle} />
        <AxisX ticks={xTicks} {innerHeight} {innerWidth} />

        {#each bins as b, i (b.label)}
          {@const h = innerHeight - yScale(b.count)}
          <g
            onpointerenter={() => (hover = i)}
            onpointerleave={() => (hover = null)}
            onpointermove={(e) => {
              const box = (e.currentTarget as SVGGElement).ownerSVGElement!.getBoundingClientRect()
              pointer = { x: e.clientX - box.left, y: e.clientY - box.top }
            }}
            role="listitem"
          >
            <rect x={i * step} y="0" width={step} height={innerHeight} fill="transparent" />
            <path
              d={roundedBar(i * step + (step - barWidth) / 2, yScale(b.count), barWidth, Math.max(1, h), 4, 'top')}
              fill={colorOf(i)}
              opacity={hover != null && hover !== i ? 0.6 : 1}
            />
          </g>
        {/each}
      </g>
    </svg>

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover != null}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {bins[hover].label}
        </p>
        <TooltipRow label="Samples" value={valueFormat(bins[hover].count)} color={colorOf(hover)} strong />
        <TooltipRow label="Share" value={`${((bins[hover].count / (total || 1)) * 100).toFixed(1)}%`} />
      {/if}
    </Tooltip>
  {/if}
</div>
