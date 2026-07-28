<script lang="ts">
  import type { DatasetMeta } from '@/data/types'
  import { seriesVar } from '@/charts/geometry'
  import Sparkline from '@/charts/Sparkline.svelte'
  import { href } from '@/lib/router.svelte'
  import { fbm1d } from '@/lib/rng'

  interface Props {
    meta: DatasetMeta
  }

  let { meta }: Props = $props()

  /** A shape preview, seeded from the dataset id so each card is distinct. */
  const preview = $derived.by(() => {
    const wave = fbm1d(`preview:${meta.id}`, 3)
    return Array.from({ length: 26 }, (_, i) => wave(i * 0.42) + i * 0.012)
  })
</script>

<a
  href={href(`/d/${meta.id}`)}
  class="panel group flex flex-col gap-3 p-5 transition-colors hover:bg-accent/40"
>
  <div class="flex items-start justify-between gap-3">
    <div class="flex items-center gap-2">
      <span
        class="h-2.5 w-2.5 rounded-full"
        style:background={seriesVar(meta.accent)}
        aria-hidden="true"
      ></span>
      <h3 class="text-sm font-semibold">{meta.name}</h3>
    </div>
    {#if meta.live}
      <span class="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
        <span
          class="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse"
          style:background="var(--status-good)"
          aria-hidden="true"
        ></span>
        Live
      </span>
    {/if}
  </div>

  <p class="text-xs leading-relaxed text-muted-foreground">{meta.tagline}</p>

  <div class="-mx-1 opacity-80 transition-opacity group-hover:opacity-100">
    <Sparkline values={preview} seriesSlot={meta.accent} width={240} height={44} />
  </div>

  <ul class="mt-auto flex flex-wrap gap-1.5 pt-1">
    {#each meta.forms as form (form)}
      <li class="rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground">{form}</li>
    {/each}
  </ul>
</a>
