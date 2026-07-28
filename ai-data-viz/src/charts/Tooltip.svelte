<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    /** Pixel position inside the chart wrapper. */
    x: number
    y: number
    visible: boolean
    /** Wrapper width, so the card can flip before it runs off the edge. */
    containerWidth: number
    children: Snippet
  }

  let { x, y, visible, containerWidth, children }: Props = $props()

  const WIDTH = 190
  const GAP = 14

  // Flip to the other side of the pointer rather than clipping at the edge.
  const flipped = $derived(x + GAP + WIDTH > containerWidth)
  const left = $derived(flipped ? Math.max(4, x - GAP - WIDTH) : x + GAP)
</script>

<div
  class="pointer-events-none absolute z-20 rounded-md border bg-card/95 px-3 py-2 text-xs
         shadow-lg backdrop-blur transition-opacity duration-100"
  class:opacity-0={!visible}
  class:opacity-100={visible}
  style:left="{left}px"
  style:top="{Math.max(4, y - 12)}px"
  style:width="{WIDTH}px"
  role="tooltip"
  aria-hidden={!visible}
>
  {@render children()}
</div>
