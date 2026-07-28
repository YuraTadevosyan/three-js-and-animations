<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import { area as d3Area, curveMonotoneX, line as d3Line } from 'd3-shape'
  import AxisX from './AxisX.svelte'
  import AxisY from './AxisY.svelte'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { MARGIN, clamp, nearestIndex, seriesVar, type Margin } from './geometry'
  import type { LineSeries } from './types'

  interface Props {
    series: LineSeries[]
    /** Numeric x values — timestamps or plain indices. */
    xs: number[]
    xFormat: (v: number) => string
    yFormat?: (v: number) => string
    tooltipValue?: (v: number) => string
    height?: number
    margin?: Partial<Margin>
    /** Fill the area under a single series with a 10% wash. */
    area?: boolean
    /**
     * A projection band drawn beyond the observed data — deliberately
     * distinguished from the observed line, never blended into it.
     */
    band?: { xs: number[]; values: number[]; lower: number[]; upper: number[]; slot?: number }
    /** Key of the one series that carries the story; the rest go muted. */
    emphasis?: string
    /** Label the last point of each series directly, beside its end dot. */
    endLabels?: boolean
    yTitle?: string
    /** Force the y domain to include zero. */
    zeroBase?: boolean
    xTickCount?: number
    /** Marks a notable x position with a hairline rule and a caption. */
    marker?: { x: number; label: string }
  }

  let {
    series,
    xs,
    xFormat,
    yFormat = (v: number) => String(Math.round(v)),
    tooltipValue,
    height = 260,
    margin: marginOverride,
    area = false,
    band,
    emphasis,
    endLabels = false,
    yTitle,
    zeroBase = false,
    xTickCount = 6,
    marker,
  }: Props = $props()

  const margin = $derived<Margin>({ ...MARGIN, ...marginOverride })

  let width = $state(0)
  let hoverIndex = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const innerWidth = $derived(Math.max(10, width - margin.left - margin.right))
  const innerHeight = $derived(Math.max(10, height - margin.top - margin.bottom))

  const allX = $derived(band ? [...xs, ...band.xs] : xs)

  const xScale = $derived(
    scaleLinear()
      .domain([Math.min(...allX), Math.max(...allX)])
      .range([0, innerWidth]),
  )

  const yExtent = $derived.by(() => {
    const values: number[] = []
    for (const s of series) for (const v of s.values) if (v != null && Number.isFinite(v)) values.push(v)
    if (band) values.push(...band.lower, ...band.upper)
    if (!values.length) return [0, 1] as [number, number]
    let lo = Math.min(...values)
    let hi = Math.max(...values)
    if (zeroBase) lo = Math.min(0, lo)
    if (lo === hi) {
      lo -= 1
      hi += 1
    }
    const pad = (hi - lo) * 0.08
    return [lo - pad, hi + pad] as [number, number]
  })

  const yScale = $derived(scaleLinear().domain(yExtent).nice().range([innerHeight, 0]))

  const xPositions = $derived(xs.map((x) => xScale(x)))

  const xTicks = $derived(
    xScale.ticks(xTickCount).map((t) => ({ x: xScale(t), label: xFormat(t) })),
  )

  function colorOf(s: LineSeries): string {
    if (emphasis && s.key !== emphasis) return 'var(--viz-muted)'
    return s.color ?? seriesVar(s.slot)
  }

  const lineGen = $derived(
    d3Line<{ x: number; y: number | null }>()
      .defined((d) => d.y != null)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y as number))
      .curve(curveMonotoneX),
  )

  const areaGen = $derived(
    d3Area<{ x: number; y: number | null }>()
      .defined((d) => d.y != null)
      .x((d) => xScale(d.x))
      .y0(yScale(Math.max(yScale.domain()[0], 0)))
      .y1((d) => yScale(d.y as number))
      .curve(curveMonotoneX),
  )

  const bandGen = $derived(
    d3Area<number>()
      .x((_, i) => xScale(band!.xs[i]))
      .y0((_, i) => yScale(band!.lower[i]))
      .y1((_, i) => yScale(band!.upper[i]))
      .curve(curveMonotoneX),
  )

  function pointsOf(s: LineSeries) {
    return xs.map((x, i) => ({ x, y: s.values[i] ?? null }))
  }

  /** Last non-null point of a series, for the end dot and direct label. */
  function lastPoint(s: LineSeries): { x: number; y: number } | null {
    for (let i = s.values.length - 1; i >= 0; i--) {
      const v = s.values[i]
      if (v != null && Number.isFinite(v)) return { x: xs[i], y: v }
    }
    return null
  }

  function onMove(event: PointerEvent) {
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect()
    const px = event.clientX - rect.left
    hoverIndex = nearestIndex(xPositions, px)
    pointer = { x: margin.left + px, y: clamp(event.clientY - rect.top, 0, innerHeight) + margin.top }
  }

  function onKey(event: KeyboardEvent) {
    if (!xs.length) return
    const current = hoverIndex ?? xs.length - 1
    let next = current
    if (event.key === 'ArrowRight') next = Math.min(xs.length - 1, current + 1)
    else if (event.key === 'ArrowLeft') next = Math.max(0, current - 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = xs.length - 1
    else if (event.key === 'Escape') {
      hoverIndex = null
      return
    } else return
    event.preventDefault()
    hoverIndex = next
    // Keyboard focus gets exactly what hover gets, positioned on the datum.
    pointer = { x: margin.left + xPositions[next], y: margin.top + innerHeight / 2 }
  }

  const fmtTooltip = $derived(tooltipValue ?? yFormat)
  const visibleSeries = $derived(series.filter((s) => !s.reference))
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg
      {width}
      {height}
      role="img"
      aria-label="Line chart"
      class="block overflow-visible"
    >
      <g transform="translate({margin.left},{margin.top})">
        <AxisY
          scale={yScale}
          innerWidth={innerWidth}
          format={yFormat}
          title={yTitle}
          zeroRule={yExtent[0] < 0}
        />
        <AxisX ticks={xTicks} {innerHeight} {innerWidth} />

        {#if marker}
          <line
            x1={xScale(marker.x)}
            x2={xScale(marker.x)}
            y1="0"
            y2={innerHeight}
            stroke="var(--viz-axis)"
            stroke-width="1"
          />
          <text
            class="viz-tick"
            x={xScale(marker.x) + 6}
            y="10"
            text-anchor="start"
            fill="var(--viz-muted)"
          >
            {marker.label}
          </text>
        {/if}

        {#if band}
          <!-- The projection band is a wash, and its centre line is dashed, so a
               forecast can never be mistaken for an observation. -->
          <path
            d={bandGen(band.lower) ?? ''}
            fill={seriesVar(band.slot ?? 1)}
            fill-opacity="0.1"
          />
          <path
            d={d3Line<number>()
              .x((_, i) => xScale(band!.xs[i]))
              .y((v) => yScale(v))
              .curve(curveMonotoneX)(band.values) ?? ''}
            fill="none"
            stroke={seriesVar(band.slot ?? 1)}
            stroke-width="2"
            stroke-dasharray="5 4"
            stroke-linecap="round"
          />
        {/if}

        {#if area && series.length === 1}
          <path d={areaGen(pointsOf(series[0])) ?? ''} fill={colorOf(series[0])} fill-opacity="0.1" />
        {/if}

        {#each series as s (s.key)}
          <path
            d={lineGen(pointsOf(s)) ?? ''}
            fill="none"
            stroke={colorOf(s)}
            stroke-width={s.reference ? 1.5 : 2}
            stroke-dasharray={s.reference ? '4 4' : undefined}
            stroke-linejoin="round"
            stroke-linecap="round"
            opacity={emphasis && s.key !== emphasis ? 0.75 : 1}
          />
        {/each}

        {#each visibleSeries as s (s.key)}
          {@const p = lastPoint(s)}
          {#if p}
            <!-- 2px surface ring keeps the end dot legible where lines cross. -->
            <circle
              cx={xScale(p.x)}
              cy={yScale(p.y)}
              r="4"
              fill={colorOf(s)}
              stroke="var(--viz-surface)"
              stroke-width="2"
            />
            {#if endLabels}
              <text
                class="viz-tick"
                x={xScale(p.x) + 8}
                y={yScale(p.y)}
                dominant-baseline="middle"
                fill="var(--viz-ink-2)"
              >
                {yFormat(p.y)}
              </text>
            {/if}
          {/if}
        {/each}

        {#if hoverIndex != null}
          {@const hx = xPositions[hoverIndex]}
          <line x1={hx} x2={hx} y1="0" y2={innerHeight} stroke="var(--viz-axis)" stroke-width="1" />
          {#each visibleSeries as s (s.key)}
            {@const v = s.values[hoverIndex]}
            {#if v != null && Number.isFinite(v)}
              <circle
                cx={hx}
                cy={yScale(v)}
                r="4.5"
                fill={colorOf(s)}
                stroke="var(--viz-surface)"
                stroke-width="2"
              />
            {/if}
          {/each}
        {/if}

        <!-- The crosshair finds the X, so the reader aims at a date rather than
             at a 2px line.
             The overlay is deliberately a focusable `application` region: it has
             an accessible name and full arrow-key navigation, which is exactly
             what the rule is protecting against when it fires on a bare rect. -->
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
          aria-label="Chart values. Use the left and right arrow keys to step through data points."
          onpointermove={onMove}
          onpointerleave={() => (hoverIndex = null)}
          onkeydown={onKey}
          onfocus={() => (hoverIndex ??= xs.length - 1)}
          onblur={() => (hoverIndex = null)}
        />
      </g>
    </svg>

    <Tooltip visible={hoverIndex != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hoverIndex != null}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {xFormat(xs[hoverIndex])}
        </p>
        {#each visibleSeries as s (s.key)}
          {@const v = s.values[hoverIndex]}
          <TooltipRow
            label={s.label}
            value={v == null ? '—' : fmtTooltip(v)}
            color={colorOf(s)}
            strong={visibleSeries.length === 1}
          />
        {/each}
      {/if}
    </Tooltip>
  {/if}
</div>
