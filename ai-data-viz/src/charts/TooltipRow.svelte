<script lang="ts">
  interface Props {
    label: string
    value: string
    /** 1-based categorical slot, or a raw CSS colour for status marks. */
    color?: string
    /** Emphasise the row the pointer is closest to. */
    strong?: boolean
  }

  let { label, value, color, strong = false }: Props = $props()
</script>

<!--
  Values lead, labels follow: in a tooltip the reader already knows the series
  and wants the number, so the number gets the high-contrast weight.
  Series identity rides a short stroke, not a filled box — at this density a box
  is data-weight ink doing a label's job.
-->
<div class="flex items-baseline gap-2 py-0.5">
  {#if color}
    <span
      class="mt-1 h-0.5 w-3 shrink-0 rounded-full"
      style:background={color}
      aria-hidden="true"
    ></span>
  {/if}
  <span class="min-w-0 flex-1 truncate text-muted-foreground">{label}</span>
  <span
    class="shrink-0 font-medium tabular-nums"
    class:text-foreground={strong}
    class:text-card-foreground={!strong}
  >
    {value}
  </span>
</div>
