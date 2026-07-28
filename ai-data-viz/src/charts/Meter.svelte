<script lang="ts">
  interface Props {
    label: string
    /** 0–1 fill. */
    ratio: number
    value: string
    state: 'nominal' | 'caution' | 'limit'
  }

  let { label, ratio, value, state }: Props = $props()

  const FILL = {
    nominal: 'var(--status-good)',
    caution: 'var(--status-warning)',
    limit: 'var(--status-critical)',
  } as const

  const STATE_LABEL = { nominal: 'Nominal', caution: 'Caution', limit: 'Limit' } as const

  const pct = $derived(Math.max(0, Math.min(1, ratio)))
</script>

<!--
  Meter: the fill carries severity and the unfilled track is a lighter step of
  the same ramp, so the state reads across the whole bar rather than only where
  the fill stops. The state is spelled out beside it — status colour never
  carries the meaning alone.
-->
<div
  class="flex flex-col gap-1.5"
  role="meter"
  aria-valuenow={Math.round(pct * 100)}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="{label}: {value}, {STATE_LABEL[state]}"
>
  <div class="flex items-baseline justify-between gap-2">
    <span class="truncate text-xs text-muted-foreground">{label}</span>
    <span class="shrink-0 text-xs font-medium tabular-nums">{value}</span>
  </div>
  <div
    class="h-1.5 w-full overflow-hidden rounded-full"
    style:background="color-mix(in srgb, {FILL[state]} 18%, transparent)"
  >
    <div
      class="h-full rounded-full transition-[width] duration-500 ease-out"
      style:width="{pct * 100}%"
      style:background={FILL[state]}
    ></div>
  </div>
  <span class="text-[11px]" style:color={FILL[state]}>● {STATE_LABEL[state]}</span>
</div>
