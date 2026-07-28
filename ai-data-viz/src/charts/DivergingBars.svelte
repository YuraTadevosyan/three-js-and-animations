<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import AxisX from './AxisX.svelte'
  import AxisY from './AxisY.svelte'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { MARGIN, clamp, divVar, type Margin } from './geometry'

  /**
   * Anomaly against a baseline is polarity data — which side of zero a year
   * falls on — so this is the diverging case: two hues that read as opposite
   * (cool blue below, warm red above) with a neutral gray at the midpoint, and
   * never a hue sitting at zero.
   */

  interface Props {
    values: number[]
    /** x value per bar — years here. */
    xs: number[]
    xFormat: (v: number) => string
    valueFormat: (v: number) => string
    height?: number
    margin?: Partial<Margin>
    yTitle?: string
    /** Optional trend line over the bars. */
    trend?: (number | null)[]
  }

  let {
    values,
    xs,
    xFormat,
    valueFormat,
    height = 300,
    margin: marginOverride,
    yTitle,
    trend,
  }: Props = $props()

  const margin = $derived<Margin>({ ...MARGIN, ...marginOverride })

  let width = $state(0)
  let hover = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const innerWidth = $derived(Math.max(10, width - margin.left - margin.right))
  const innerHeight = $derived(Math.max(10, height - margin.top - margin.bottom))
  const step = $derived(values.length ? innerWidth / values.length : innerWidth)
  const barWidth = $derived(Math.max(1, Math.min(24, step - 1.5)))

  const extent = $derived(Math.max(...values.map((v) => Math.abs(v))) * 1.08)

  const yScale = $derived(scaleLinear().domain([-extent, extent]).nice().range([innerHeight, 0]))

  const xTicks = $derived.by(() => {
    const every = Math.max(1, Math.round(values.length / 7))
    return xs
      .map((x, i) => ({ x: i * step + step / 2, label: xFormat(x), i }))
      .filter((t) => t.i % every === 0)
      .map(({ x, label }) => ({ x, label }))
  })

  const trendPath = $derived.by(() => {
    if (!trend) return ''
    const pts = trend
      .map((v, i) => (v == null ? null : `${i * step + step / 2},${yScale(v)}`))
      .filter((p): p is string => p != null)
    return pts.length ? `M${pts.join(' L')}` : ''
  })

  function onMove(event: PointerEvent) {
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect()
    const px = event.clientX - rect.left
    hover = clamp(Math.floor(px / step), 0, values.length - 1)
    pointer = { x: margin.left + px, y: margin.top + clamp(event.clientY - rect.top, 0, innerHeight) }
  }

  function onKey(event: KeyboardEvent) {
    const current = hover ?? values.length - 1
    let next = current
    if (event.key === 'ArrowRight') next = Math.min(values.length - 1, current + 1)
    else if (event.key === 'ArrowLeft') next = Math.max(0, current - 1)
    else if (event.key === 'Escape') {
      hover = null
      return
    } else return
    event.preventDefault()
    hover = next
    pointer = { x: margin.left + next * step + step / 2, y: margin.top + innerHeight / 2 }
  }
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Anomaly against baseline" class="block">
      <g transform="translate({margin.left},{margin.top})">
        <AxisY scale={yScale} {innerWidth} format={valueFormat} title={yTitle} zeroRule />
        <AxisX ticks={xTicks} {innerHeight} {innerWidth} rule={false} />

        {#each values as v, i (i)}
          {@const zero = yScale(0)}
          {@const y = yScale(v)}
          <rect
            x={i * step + (step - barWidth) / 2}
            y={Math.min(zero, y)}
            width={barWidth}
            height={Math.max(1, Math.abs(zero - y))}
            fill={divVar(v, extent)}
            opacity={hover != null && hover !== i ? 0.55 : 1}
          />
        {/each}

        {#if trendPath}
          <path
            d={trendPath}
            fill="none"
            stroke="var(--viz-ink)"
            stroke-width="2"
            stroke-linecap="round"
            opacity="0.72"
          />
        {/if}

        {#if hover != null}
          {@const hx = hover * step + step / 2}
          <line x1={hx} x2={hx} y1="0" y2={innerHeight} stroke="var(--viz-axis)" stroke-width="1" />
        {/if}

        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <rect
          x="0"
          y="0"
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          tabindex="0"
          role="application"
          aria-label="Annual anomaly. Use the arrow keys to step between years."
          onpointermove={onMove}
          onpointerleave={() => (hover = null)}
          onkeydown={onKey}
          onfocus={() => (hover ??= values.length - 1)}
          onblur={() => (hover = null)}
        />
      </g>
    </svg>

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover != null}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {xFormat(xs[hover])}
        </p>
        <TooltipRow
          label={values[hover] >= 0 ? 'Above baseline' : 'Below baseline'}
          value={valueFormat(values[hover])}
          color={divVar(values[hover], extent)}
          strong
        />
        {@const smoothed = trend?.[hover]}
        {#if smoothed != null}
          <TooltipRow label="Moving average" value={valueFormat(smoothed)} />
        {/if}
      {/if}
    </Tooltip>
  {/if}
</div>
