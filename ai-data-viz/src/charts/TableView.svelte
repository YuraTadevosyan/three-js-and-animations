<script lang="ts">
  import type { TableSpec } from '@/data/types'

  interface Props {
    table: TableSpec
    caption: string
    maxHeight?: number
  }

  let { table, caption, maxHeight = 320 }: Props = $props()
</script>

<!--
  The table view is the chart's WCAG-clean twin, and the relief channel for the
  light-mode slots that sit below 3:1 against the surface. Every value the chart
  encodes in colour or position is reachable here as text.

  Labels come from generated data but are interpolated, not injected as markup —
  Svelte escapes `{}` interpolation, so a series name can never become an element.
-->
<div class="overflow-auto" style:max-height="{maxHeight}px">
  <table class="w-full border-collapse text-xs">
    <caption class="sr-only">{caption}</caption>
    <thead class="sticky top-0 z-10 bg-card">
      <tr>
        {#each table.columns as col, i (col)}
          <th
            scope="col"
            class="border-b px-3 py-2 font-medium text-muted-foreground"
            class:text-left={i === 0}
            class:text-right={i > 0}
          >
            {col}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each table.rows as row, r (r)}
        <tr class="border-b border-border/50 last:border-0">
          {#each row as cell, i (i)}
            <td
              class="px-3 py-1.5"
              class:text-left={i === 0}
              class:text-right={i > 0}
              class:tabular-nums={i > 0}
              class:text-muted-foreground={i === 0}
            >
              {cell}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
