<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { TableSpec } from '@/data/types'
  import TableView from '@/charts/TableView.svelte'

  interface Props {
    title: string
    subtitle?: string
    /** The chart itself. */
    children: Snippet
    /** Legend row, rendered under the header. Required for two or more series. */
    legend?: Snippet
    /** Extra controls for this card — mode switches, series pickers. */
    controls?: Snippet
    /**
     * The table twin. Every chart card ships one: it is the accessible
     * equivalent, and the relief channel for sub-3:1 light-mode slots.
     */
    table: TableSpec
    /** A short note under the chart — what the reader should take away. */
    note?: string
    class?: string
  }

  let {
    title,
    subtitle,
    children,
    legend,
    controls,
    table,
    note,
    class: className = '',
  }: Props = $props()

  let showTable = $state(false)
  const tableId = `table-${Math.random().toString(36).slice(2, 8)}`
</script>

<section class="panel flex flex-col overflow-hidden {className}">
  <header class="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
    <div class="min-w-0">
      <h3 class="text-sm font-semibold leading-tight">{title}</h3>
      {#if subtitle}
        <p class="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      {/if}
    </div>
    <div class="flex shrink-0 items-center gap-2">
      {#if controls}{@render controls()}{/if}
      <button
        type="button"
        class="chip"
        aria-pressed={showTable}
        aria-controls={tableId}
        onclick={() => (showTable = !showTable)}
      >
        {showTable ? 'Chart' : 'Table'}
      </button>
    </div>
  </header>

  {#if legend}
    <div class="px-4 pt-3 sm:px-5">{@render legend()}</div>
  {/if}

  <div id={tableId} class="min-w-0 flex-1 px-1 pb-2 pt-3 sm:px-2">
    {#if showTable}
      <div class="px-3 sm:px-3">
        <TableView {table} caption="{title} — tabular values" />
      </div>
    {:else}
      {@render children()}
    {/if}
  </div>

  {#if note}
    <p class="border-t px-4 py-2.5 text-xs leading-relaxed text-muted-foreground sm:px-5">
      {note}
    </p>
  {/if}
</section>
