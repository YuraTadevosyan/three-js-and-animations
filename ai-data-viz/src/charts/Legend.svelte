<script lang="ts">
  import { seriesVar } from './geometry'
  import type { LegendItem } from './types'

  interface Props {
    items: LegendItem[]
    /** Legends mirror the mark: a rect for bars and areas, a stroke for lines. */
    mark?: 'rect' | 'line' | 'dot'
    /** Optional click-to-mute. Muting never re-assigns colours to the survivors. */
    muted?: Set<string>
    onToggle?: (label: string) => void
  }

  let { items, mark = 'rect', muted, onToggle }: Props = $props()

  function colorOf(item: LegendItem): string {
    return item.color ?? seriesVar(item.slot ?? 1)
  }
</script>

{#snippet swatch(item: LegendItem)}
  <!-- The legend mirrors the mark: a rect for bars and areas, a stroke for
       lines, a dot for scatter and node marks. Individual rows may override it,
       so a price chart can show its bars as rects and its averages as strokes. -->
  {@const shape = item.mark ?? mark}
  {#if shape === 'line'}
    <span
      class="h-0.5 w-4 shrink-0 rounded-full"
      style:background={colorOf(item)}
      aria-hidden="true"
    ></span>
  {:else if shape === 'dot'}
    <span
      class="h-2.5 w-2.5 shrink-0 rounded-full"
      style:background={colorOf(item)}
      aria-hidden="true"
    ></span>
  {:else}
    <span
      class="h-2.5 w-2.5 shrink-0 rounded-[2px]"
      style:background={colorOf(item)}
      aria-hidden="true"
    ></span>
  {/if}
{/snippet}

<ul class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
  {#each items as item (item.label)}
    {@const isMuted = muted?.has(item.label) ?? false}
    <li>
      {#if onToggle}
        <button
          type="button"
          class="flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity hover:text-foreground"
          class:opacity-40={isMuted}
          aria-pressed={!isMuted}
          onclick={() => onToggle(item.label)}
        >
          {@render swatch(item)}
          <span>{item.label}</span>
        </button>
      {:else}
        <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
          {@render swatch(item)}
          <span>{item.label}</span>
        </span>
      {/if}
    </li>
  {/each}
</ul>
