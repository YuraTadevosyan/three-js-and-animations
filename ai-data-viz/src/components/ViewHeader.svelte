<script lang="ts">
  import type { DatasetMeta } from '@/data/types'
  import { seriesVar } from '@/charts/geometry'

  interface Props {
    meta: DatasetMeta
  }

  let { meta }: Props = $props()
</script>

<header class="border-b py-8">
  <div class="container">
    <div class="flex items-center gap-2">
      <span
        class="h-2.5 w-2.5 rounded-full"
        style:background={seriesVar(meta.accent)}
        aria-hidden="true"
      ></span>
      <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Generated dataset
      </p>
    </div>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{meta.name}</h1>
    <p class="mt-2 max-w-2xl text-sm text-muted-foreground">{meta.tagline}</p>
    <p class="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
      <span class="font-medium text-foreground">How it's generated · </span>{meta.method}
    </p>
  </div>
</header>
