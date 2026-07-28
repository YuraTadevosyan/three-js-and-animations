<script lang="ts">
  import Sparkline from '@/charts/Sparkline.svelte'
  import { signedPct } from '@/lib/format'

  interface Props {
    label: string
    value: string
    /** Signed change against a named period. */
    delta?: number
    deltaLabel?: string
    /** Whether an increase is the good direction — inverts the delta colour. */
    upIsGood?: boolean
    trend?: number[]
    /** 1-based categorical slot — see the note in Sparkline on the name. */
    seriesSlot?: number
    /** Renders at hero size. Exactly one per view. */
    hero?: boolean
  }

  let {
    label,
    value,
    delta,
    deltaLabel = 'vs. previous period',
    upIsGood = true,
    trend,
    seriesSlot = 1,
    hero = false,
  }: Props = $props()

  const good = $derived(delta == null ? null : delta === 0 ? null : delta > 0 === upIsGood)
</script>

<!--
  Stat-tile contract: label · value · delta · trend. The number is the chart —
  a single value never gets a one-bar bar chart.
  Values use proportional figures: `tabular-nums` would make a number like 121
  look loose at display sizes. Tabular is for columns, not for headlines.
-->
<div class="panel flex flex-col justify-between gap-3 p-4">
  <p class="text-xs font-medium text-muted-foreground">{label}</p>

  <div class="flex items-end justify-between gap-3">
    <div class="min-w-0">
      <p
        class="font-semibold leading-none tracking-tight"
        class:text-5xl={hero}
        class:text-2xl={!hero}
      >
        {value}
      </p>
      {#if delta != null}
        <p class="mt-1.5 flex items-center gap-1 text-xs">
          <span
            class="font-medium"
            style:color={good === null
              ? 'var(--viz-ink-2)'
              : good
                ? 'var(--status-good-text)'
                : 'var(--status-critical)'}
          >
            <!-- Direction is stated by the arrow and the sign, not by hue alone. -->
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '■'}
            {signedPct(delta)}
          </span>
          <span class="text-muted-foreground">{deltaLabel}</span>
        </p>
      {/if}
    </div>

    {#if trend && trend.length > 1}
      <Sparkline values={trend} {seriesSlot} width={hero ? 132 : 88} height={hero ? 40 : 30} />
    {/if}
  </div>
</div>
