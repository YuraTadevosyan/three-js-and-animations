<script lang="ts">
  import { untrack } from 'svelte'
  import { Tween } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import { scaleLinear } from 'd3-scale'
  import AxisX from './AxisX.svelte'
  import AxisY from './AxisY.svelte'
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { MARGIN, clamp, roundedBar, seriesVar, type Margin } from './geometry'
  import type { MorphMode, MorphSeries } from './types'
  import { prefersReducedMotion } from '@/lib/ticker'

  /**
   * One chart, four forms.
   *
   * Every form is the same set of rectangles — the morph tweens each rect's
   * horizontal slot and its value-space top and bottom, and tweens the y-domain
   * alongside them, so the marks and the axis they are measured against always
   * move together. Nothing cross-fades and nothing is redrawn from scratch.
   */

  interface Props {
    series: MorphSeries[]
    /** One label per x position. */
    categories: string[]
    mode: MorphMode
    height?: number
    margin?: Partial<Margin>
    valueFormat: (v: number) => string
    /** Axis formatter for the absolute modes; share mode always uses percent. */
    axisFormat: (v: number) => string
    /** Show every nth category label, to keep the axis from crowding. */
    labelEvery?: number
  }

  let {
    series,
    categories,
    mode,
    height = 300,
    margin: marginOverride,
    valueFormat,
    axisFormat,
    labelEvery = 1,
  }: Props = $props()

  const margin = $derived<Margin>({ ...MARGIN, ...marginOverride })

  let width = $state(0)
  let hover = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const innerWidth = $derived(Math.max(10, width - margin.left - margin.right))
  const innerHeight = $derived(Math.max(10, height - margin.top - margin.bottom))

  const count = $derived(categories.length)
  const step = $derived(count ? innerWidth / count : innerWidth)

  /** Column totals — the stacked and share layouts both need them. */
  const totals = $derived(
    categories.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0)),
  )

  /**
   * Per-mode layout in *value* space, plus the y-domain that measures it.
   * Keeping the layout unit-free until render is what lets a single tween carry
   * a currency stack, a percentage stack and a centred stream.
   */
  function layout(m: MorphMode): { domain: [number, number]; rects: number[] } {
    const S = series.length
    const rects: number[] = []
    // Grouped bars need room between the groups; the stacked forms read better
    // as near-contiguous columns.
    const pad = m === 'grouped' ? 0.3 : 0.16

    let lo = 0
    let hi = 1

    if (m === 'stacked') {
      hi = Math.max(1, ...totals) * 1.04
    } else if (m === 'grouped') {
      hi = Math.max(1, ...series.flatMap((s) => s.values)) * 1.08
    } else if (m === 'share') {
      hi = 1.02
    } else {
      const half = Math.max(1, ...totals) / 2
      lo = -half * 1.12
      hi = half * 1.12
    }

    for (let i = 0; i < count; i++) {
      let cum = 0
      const total = totals[i] || 1
      for (let s = 0; s < S; s++) {
        const v = series[s].values[i] ?? 0
        let x0: number
        let x1: number
        let v0: number
        let v1: number
        let r: number

        if (m === 'grouped') {
          const inner = 1 - pad
          const sub = inner / S
          x0 = pad / 2 + s * sub
          x1 = x0 + sub
          v0 = 0
          v1 = v
          r = 4
        } else if (m === 'share') {
          x0 = pad / 2
          x1 = 1 - pad / 2
          v0 = cum / total
          v1 = (cum + v) / total
          r = s === S - 1 ? 4 : 0
        } else if (m === 'stream') {
          const half = total / 2
          x0 = pad / 2
          x1 = 1 - pad / 2
          v0 = cum - half
          v1 = cum + v - half
          r = s === S - 1 || s === 0 ? 4 : 0
        } else {
          x0 = pad / 2
          x1 = 1 - pad / 2
          v0 = cum
          v1 = cum + v
          r = s === S - 1 ? 4 : 0
        }

        rects.push(x0, x1, v0, v1, r)
        cum += v
      }
    }

    return { domain: [lo, hi], rects }
  }

  /** Flattened as [loDomain, hiDomain, ...rect quintuples] so one tween carries all of it. */
  function flatten(m: MorphMode): number[] {
    const { domain, rects } = layout(m)
    return [domain[0], domain[1], ...rects]
  }

  // Seeded from the initial mode on purpose — the effect below owns every
  // subsequent change, so reading `mode` reactively here would be redundant.
  const tween = new Tween(
    untrack(() => flatten(mode)),
    { duration: 620, easing: cubicOut },
  )

  $effect(() => {
    const next = flatten(mode)
    // A tween can only interpolate between equal-length arrays. When the data
    // itself changes shape (a different date range), snap instead of animating.
    if (next.length !== tween.current.length || prefersReducedMotion()) {
      tween.set(next, { duration: 0 })
    } else {
      tween.target = next
    }
  })

  const frame = $derived(tween.current)

  const yScale = $derived(
    scaleLinear()
      .domain([frame[0] ?? 0, frame[1] ?? 1])
      .range([innerHeight, 0]),
  )

  interface Rect {
    key: string
    seriesIndex: number
    categoryIndex: number
    x: number
    y: number
    w: number
    h: number
    r: number
  }

  const rects = $derived.by<Rect[]>(() => {
    const out: Rect[] = []
    const S = series.length
    for (let i = 0; i < count; i++) {
      for (let s = 0; s < S; s++) {
        const base = 2 + (i * S + s) * 5
        const x0 = frame[base]
        const x1 = frame[base + 1]
        const v0 = frame[base + 2]
        const v1 = frame[base + 3]
        const r = frame[base + 4]
        if (x0 == null) continue

        const px = i * step + x0 * step
        const pw = Math.max(0, (x1 - x0) * step)
        const py0 = yScale(v0)
        const py1 = yScale(v1)
        const top = Math.min(py0, py1)
        const rawH = Math.abs(py0 - py1)

        // The 2px surface gap: white does the separating, never a stroke.
        // It applies between stacked segments and between adjacent bars alike.
        const h = Math.max(0, rawH - (rawH > 5 ? 2 : 0))
        const w = Math.max(0, pw - (pw > 5 ? 2 : 0))

        out.push({
          key: `${series[s].key}-${i}`,
          seriesIndex: s,
          categoryIndex: i,
          x: px + (pw - w) / 2,
          y: top,
          w,
          h,
          r,
        })
      }
    }
    return out
  })

  const xTicks = $derived(
    categories
      .map((label, i) => ({ x: i * step + step / 2, label, i }))
      .filter((t) => t.i % labelEvery === 0)
      .map(({ x, label }) => ({ x, label })),
  )

  const isShare = $derived(mode === 'share')
  const tickFormat = $derived(isShare ? (v: number) => `${Math.round(v * 100)}%` : axisFormat)

  function onMove(event: PointerEvent) {
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect()
    const px = event.clientX - rect.left
    hover = clamp(Math.floor(px / step), 0, count - 1)
    pointer = {
      x: margin.left + px,
      y: margin.top + clamp(event.clientY - rect.top, 0, innerHeight),
    }
  }

  function onKey(event: KeyboardEvent) {
    const current = hover ?? 0
    let next = current
    if (event.key === 'ArrowRight') next = Math.min(count - 1, current + 1)
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
    <svg {width} {height} role="img" aria-label="Segment revenue, {mode} view" class="block">
      <g transform="translate({margin.left},{margin.top})">
        <AxisY scale={yScale} {innerWidth} format={tickFormat} zeroRule={mode === 'stream'} />
        <AxisX ticks={xTicks} {innerHeight} {innerWidth} rule={mode !== 'stream'} />

        {#each rects as r (r.key)}
          <path
            d={roundedBar(r.x, r.y, r.w, r.h, r.r, 'top')}
            fill={seriesVar(series[r.seriesIndex].slot)}
            opacity={hover != null && hover !== r.categoryIndex ? 0.58 : 1}
          />
        {/each}

        <!-- On bars the mark is the hit target, so each column band carries its
             own tooltip; the band is far wider than the 24px minimum. -->
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
          aria-label="Segment values by period. Use the arrow keys to step between periods."
          onpointermove={onMove}
          onpointerleave={() => (hover = null)}
          onkeydown={onKey}
          onfocus={() => (hover ??= 0)}
          onblur={() => (hover = null)}
        />
      </g>
    </svg>

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover != null}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {categories[hover]}
        </p>
        {#each series as s (s.key)}
          <TooltipRow
            label={s.label}
            value={isShare
              ? `${(((s.values[hover] ?? 0) / (totals[hover] || 1)) * 100).toFixed(1)}%`
              : valueFormat(s.values[hover] ?? 0)}
            color={seriesVar(s.slot)}
          />
        {/each}
        <div class="mt-1 border-t pt-1">
          <TooltipRow label="Total" value={valueFormat(totals[hover])} strong />
        </div>
      {/if}
    </Tooltip>
  {/if}
</div>
