<script lang="ts">
  import Tooltip from './Tooltip.svelte'
  import TooltipRow from './TooltipRow.svelte'
  import { seriesVar } from './geometry'
  import type { ShareSegment } from './types'

  /**
   * Part-to-whole across one bar. Horizontal, because the category names are
   * words rather than dates.
   */

  interface Props {
    segments: ShareSegment[]
    valueFormat: (v: number) => string
    height?: number
  }

  let { segments, valueFormat, height = 44 }: Props = $props()

  const GAP = 2
  const LABEL_FONT = '600 12px Inter, system-ui, sans-serif'
  const PADDING = 10

  let width = $state(0)
  let hover = $state<number | null>(null)
  let pointer = $state({ x: 0, y: 0 })

  const total = $derived(segments.reduce((a, s) => a + s.value, 0) || 1)

  /**
   * Real text measurement, not a character-count guess: a label only goes inside
   * a segment when it genuinely fits with padding on both sides. Anything that
   * doesn't fit drops to the legend and the tooltip rather than being clipped.
   */
  let measure: CanvasRenderingContext2D | null = null
  function textWidth(text: string): number {
    if (!measure) {
      measure = document.createElement('canvas').getContext('2d')
      if (measure) measure.font = LABEL_FONT
    }
    return measure?.measureText(text).width ?? text.length * 7
  }

  const layout = $derived.by(() => {
    let x = 0
    return segments.map((s, i) => {
      const raw = (s.value / total) * width
      const w = Math.max(0, raw - (i < segments.length - 1 ? GAP : 0))
      const item = { ...s, x, w, index: i }
      x += raw
      return item
    })
  })

  function labelFor(w: number, label: string, share: string): string | null {
    if (textWidth(`${label} ${share}`) + PADDING * 2 <= w) return `${label} ${share}`
    if (textWidth(share) + PADDING * 2 <= w) return share
    return null
  }
</script>

<div class="relative w-full" bind:clientWidth={width}>
  {#if width > 0}
    <svg {width} {height} role="img" aria-label="Protocol mix" class="block">
      {#each layout as seg (seg.label)}
        {@const share = `${((seg.value / total) * 100).toFixed(1)}%`}
        {@const inline = labelFor(seg.w, seg.label, share)}
        <g
          onpointerenter={() => (hover = seg.index)}
          onpointerleave={() => (hover = null)}
          onpointermove={(e) => {
            const box = (e.currentTarget as SVGGElement).ownerSVGElement!.getBoundingClientRect()
            pointer = { x: e.clientX - box.left, y: e.clientY - box.top }
          }}
          role="listitem"
        >
          <rect
            x={seg.x}
            y="0"
            width={seg.w}
            {height}
            rx="4"
            fill={seriesVar(seg.slot)}
            opacity={hover != null && hover !== seg.index ? 0.65 : 1}
          />
          {#if inline}
            <!-- A label inside a colour fill is the one place text may take a
                 non-token colour: white or ink, picked so it always clears. -->
            <text
              x={seg.x + seg.w / 2}
              y={height / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="12"
              font-weight="600"
              fill="#ffffff"
            >
              {inline}
            </text>
          {/if}
        </g>
      {/each}
    </svg>

    <Tooltip visible={hover != null} x={pointer.x} y={pointer.y} containerWidth={width}>
      {#if hover != null}
        <p class="mb-1 border-b pb-1 text-[11px] font-medium text-muted-foreground">
          {segments[hover].label}
        </p>
        <TooltipRow
          label="Share"
          value={`${((segments[hover].value / total) * 100).toFixed(1)}%`}
          color={seriesVar(segments[hover].slot)}
          strong
        />
        <TooltipRow label="Volume" value={valueFormat(segments[hover].value)} />
      {/if}
    </Tooltip>
  {/if}
</div>
