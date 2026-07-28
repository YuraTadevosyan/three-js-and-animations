<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import { curveMonotoneX, area as d3Area, line as d3Line } from 'd3-shape'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { clamp } from './geometry'
  import { channelState, type Channel } from '@/data/telemetry'
  import { dec } from '@/lib/format'

  /**
   * Eight channels, eight plots.
   *
   * These channels carry different units — volts, amps, degrees, percent — so
   * they get small multiples with one y-scale each, never one plot with eight
   * scales stacked on top of each other. Each row also has its own baseline and
   * its own caution/limit rules, which only makes sense per channel.
   */

  interface Props {
    channels: Channel[]
    rowHeight?: number
  }

  let { channels, rowHeight = 62 }: Props = $props()

  const LABEL_W = 132
  const VALUE_W = 84
  const PAD = 8

  let width = $state(0)
  let hoverIndex = $state<number | null>(null)
  let hoverRow = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const plotWidth = $derived(Math.max(20, width - LABEL_W - VALUE_W))
  const height = $derived(channels.length * rowHeight)
  const sampleCount = $derived(channels[0]?.history.length ?? 0)

  const STATUS_COLOR = {
    nominal: 'var(--status-good)',
    caution: 'var(--status-warning)',
    limit: 'var(--status-critical)',
  } as const

  const STATUS_LABEL = { nominal: 'Nominal', caution: 'Caution', limit: 'Limit' } as const

  function scaleFor(ch: Channel) {
    return scaleLinear().domain([ch.min, ch.max]).range([rowHeight - PAD, PAD])
  }

  const xScale = $derived(
    scaleLinear()
      .domain([0, Math.max(1, sampleCount - 1)])
      .range([0, plotWidth]),
  )

  function pathFor(ch: Channel): string {
    const y = scaleFor(ch)
    return (
      d3Line<number>()
        .x((_, i) => xScale(i))
        .y((v) => y(v))
        .curve(curveMonotoneX)(ch.history) ?? ''
    )
  }

  function areaFor(ch: Channel): string {
    const y = scaleFor(ch)
    return (
      d3Area<number>()
        .x((_, i) => xScale(i))
        .y0(y(ch.nominal))
        .y1((v) => y(v))
        .curve(curveMonotoneX)(ch.history) ?? ''
    )
  }

  function onMove(event: PointerEvent, row: number) {
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect()
    const px = clamp(event.clientX - rect.left, 0, plotWidth)
    hoverIndex = Math.round(xScale.invert(px))
    hoverRow = row
    pointer = { x: LABEL_W + px, y: row * rowHeight + rowHeight / 2 }
  }
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Subsystem telemetry channels" class="block">
      {#each channels as ch, row (ch.key)}
        {@const state = channelState(ch)}
        {@const color = STATUS_COLOR[state]}
        {@const y = scaleFor(ch)}
        {@const last = ch.history[ch.history.length - 1]}
        <g transform="translate(0,{row * rowHeight})">
          <line class="viz-axis-line" x1="0" x2={width} y1="0" y2="0" opacity={row === 0 ? 0 : 1} />

          <text class="viz-tick" x="0" y={rowHeight / 2 - 6} fill="var(--viz-ink-2)" font-size="12">
            {ch.label}
          </text>
          <!-- Status is stated in words as well as colour; a status hue never
               carries meaning on its own. -->
          <text class="viz-tick" x="0" y={rowHeight / 2 + 10} fill={color} font-size="10.5">
            ● {STATUS_LABEL[state]}
          </text>

          <g transform="translate({LABEL_W},0)">
            <!-- Caution rules bracket the nominal envelope. Solid hairlines. -->
            <line
              class="viz-grid"
              x1="0"
              x2={plotWidth}
              y1={y(ch.nominal)}
              y2={y(ch.nominal)}
              stroke="var(--viz-grid)"
            />
            <line
              x1="0"
              x2={plotWidth}
              y1={y(ch.nominal + ch.caution)}
              y2={y(ch.nominal + ch.caution)}
              stroke="var(--status-warning)"
              stroke-width="1"
              opacity="0.32"
            />
            <line
              x1="0"
              x2={plotWidth}
              y1={y(ch.nominal - ch.caution)}
              y2={y(ch.nominal - ch.caution)}
              stroke="var(--status-warning)"
              stroke-width="1"
              opacity="0.32"
            />

            <path d={areaFor(ch)} fill={color} fill-opacity="0.1" />
            <path
              d={pathFor(ch)}
              fill="none"
              stroke={color}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx={xScale(ch.history.length - 1)}
              cy={y(last)}
              r="3.5"
              fill={color}
              stroke="var(--viz-surface)"
              stroke-width="2"
            />

            {#if hoverRow === row && hoverIndex != null && ch.history[hoverIndex] != null}
              <line
                x1={xScale(hoverIndex)}
                x2={xScale(hoverIndex)}
                y1={PAD - 4}
                y2={rowHeight - PAD + 4}
                stroke="var(--viz-axis)"
                stroke-width="1"
              />
            {/if}

            <rect
              x="0"
              y="0"
              width={plotWidth}
              height={rowHeight}
              fill="transparent"
              onpointermove={(e) => onMove(e, row)}
              onpointerleave={() => {
                hoverIndex = null
                hoverRow = null
              }}
              role="presentation"
            />
          </g>

          <!-- The current value is directly labelled, so the tooltip only ever
               enhances — it never gates a reading. -->
          <text
            x={width}
            y={rowHeight / 2}
            text-anchor="end"
            dominant-baseline="middle"
            class="tabular-nums"
            fill="var(--viz-ink)"
            font-size="13"
            font-weight="600"
          >
            {dec(last, 2)}
          </text>
          <text
            x={width}
            y={rowHeight / 2 + 14}
            text-anchor="end"
            dominant-baseline="middle"
            class="viz-tick"
          >
            {ch.unit}
          </text>
        </g>
      {/each}
    </svg>

    <Tooltip
      visible={hoverRow != null && hoverIndex != null}
      x={pointer.x}
      y={pointer.y}
      containerWidth={width}
    >
      {#if hoverRow != null && hoverIndex != null}
        {@const ch = channels[hoverRow]}
        {@const v = ch.history[hoverIndex]}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {ch.label} · sample {hoverIndex + 1}
        </p>
        <TooltipRow
          label={ch.unit}
          value={v == null ? '—' : dec(v, 3)}
          color={STATUS_COLOR[channelState(ch, v)]}
          strong
        />
        <TooltipRow label="Nominal" value={dec(ch.nominal, 2)} />
        <TooltipRow label="Deviation" value={v == null ? '—' : dec(v - ch.nominal, 3)} />
      {/if}
    </Tooltip>
  {/if}
</div>
