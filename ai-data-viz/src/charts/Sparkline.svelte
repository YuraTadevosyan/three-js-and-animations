<script lang="ts">
  import { curveMonotoneX, line as d3Line } from 'd3-shape'
  import { scaleLinear } from 'd3-scale'
  import { seriesVar } from './geometry'

  interface Props {
    values: number[]
    /**
     * 1-based categorical slot, or a raw colour for status-meaning channels.
     * Named `seriesSlot` rather than `slot`: `slot` is a reserved attribute in
     * Svelte and would be silently swallowed as a slot name.
     */
    seriesSlot?: number
    color?: string
    width?: number
    height?: number
    /** The stat-tile contract's de-emphasised trend, with the last point accented. */
    showEnd?: boolean
  }

  let { values, seriesSlot = 1, color, width = 96, height = 28, showEnd = true }: Props = $props()

  const stroke = $derived(color ?? seriesVar(seriesSlot))

  const path = $derived.by(() => {
    if (values.length < 2) return ''
    const x = scaleLinear().domain([0, values.length - 1]).range([2, width - 2])
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const y = scaleLinear()
      .domain(lo === hi ? [lo - 1, hi + 1] : [lo, hi])
      .range([height - 3, 3])
    return (
      d3Line<number>()
        .x((_, i) => x(i))
        .y((v) => y(v))
        .curve(curveMonotoneX)(values) ?? ''
    )
  })

  const endPoint = $derived.by(() => {
    if (values.length < 2) return null
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const y = scaleLinear()
      .domain(lo === hi ? [lo - 1, hi + 1] : [lo, hi])
      .range([height - 3, 3])
    return { x: width - 2, y: y(values[values.length - 1]) }
  })
</script>

<svg {width} {height} class="block overflow-visible" aria-hidden="true">
  <path d={path} fill="none" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  {#if showEnd && endPoint}
    <circle
      cx={endPoint.x}
      cy={endPoint.y}
      r="2.75"
      fill={stroke}
      stroke="var(--viz-surface)"
      stroke-width="2"
    />
  {/if}
</svg>
