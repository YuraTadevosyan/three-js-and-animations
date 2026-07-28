<script lang="ts">
  import type { Snippet } from 'svelte'

  /**
   * One filter row, above everything it scopes.
   *
   * Filters never live inside a chart card and never scope a single chart — if
   * one chart needed its own range it would be a different dashboard. Everything
   * below this row re-renders against the same slice, so the numbers always
   * agree with each other.
   */

  export interface RangeOption {
    label: string
    value: string
  }

  interface Props {
    /** Date-range presets come first — it is the filter every reader reaches for. */
    ranges?: RangeOption[]
    range?: string
    onRange?: (value: string) => void
    rangeLabel?: string
    /** Extra dimension filters, rendered to the right of the range. */
    children?: Snippet
    /** Live views show a running indicator instead of a static caption. */
    live?: boolean
    /** Caption on the far right — record counts and the like. */
    note?: string
  }

  let {
    ranges,
    range,
    onRange,
    rangeLabel = 'Range',
    children,
    live = false,
    note,
  }: Props = $props()
</script>

<div class="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border bg-card px-4 py-3">
  {#if ranges?.length}
    <div class="flex items-center gap-2">
      <span class="text-xs font-medium text-muted-foreground">{rangeLabel}</span>
      <div class="flex flex-wrap gap-1.5" role="group" aria-label={rangeLabel}>
        {#each ranges as option (option.value)}
          <button
            type="button"
            class="chip"
            aria-pressed={range === option.value}
            onclick={() => onRange?.(option.value)}
          >
            {#if range === option.value}
              <span aria-hidden="true" class="font-bold">✓</span>
            {/if}
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if children}{@render children()}{/if}

  <div class="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
    {#if live}
      <span class="flex items-center gap-1.5">
        <span
          class="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse"
          style:background="var(--status-good)"
          aria-hidden="true"
        ></span>
        Streaming
      </span>
    {/if}
    {#if note}<span>{note}</span>{/if}
  </div>
</div>
