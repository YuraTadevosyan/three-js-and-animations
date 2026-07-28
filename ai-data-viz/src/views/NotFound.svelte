<script lang="ts">
  import { DATASETS } from '@/data/registry'
  import { href } from '@/lib/router.svelte'
</script>

<section class="container py-24">
  <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">404</p>
  <h1 class="mt-3 text-3xl font-semibold tracking-tight">No dataset at that address.</h1>
  <p class="mt-3 max-w-lg text-sm text-muted-foreground">
    There are six of them, and they are all generated on the spot.
  </p>
  <ul class="mt-6 flex flex-wrap gap-2">
    {#each DATASETS as meta (meta.id)}
      <li>
        <a class="chip" href={href(`/d/${meta.id}`)}>{meta.name}</a>
      </li>
    {/each}
  </ul>
</section>
