<script lang="ts">
  import { href } from '@/lib/router.svelte'
</script>

<footer class="mt-16 border-t py-8">
  <div class="container flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
    <p>
      Every dataset on this site is procedurally generated in the browser from a
      fixed seed. Nothing here is real data.
    </p>
    <nav class="flex items-center gap-4" aria-label="Footer">
      <a class="hover:text-foreground" href={href('/about')}>About</a>
      <a
        class="hover:text-foreground"
        href="https://yuratadevosyan.github.io/three-js-and-animations/"
      >
        All showcases
      </a>
    </nav>
  </div>
</footer>
