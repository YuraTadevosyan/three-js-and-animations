<script lang="ts">
  import { DATASETS } from '@/data/registry'
  import { href, router } from '@/lib/router.svelte'
  import { theme } from '@/lib/theme.svelte'

  let open = $state(false)

  const links = $derived([
    { label: 'Overview', path: '/' },
    ...DATASETS.map((d) => ({ label: d.name, path: `/d/${d.id}` })),
    { label: 'About', path: '/about' },
  ])
</script>

<header
  class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65"
>
  <div class="container flex h-14 items-center gap-4">
    <a href={href('/')} class="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
      <span
        class="grid h-6 w-6 place-items-center rounded-md text-[13px]"
        style:background="hsl(var(--primary) / 0.16)"
        style:color="var(--series-1)"
        aria-hidden="true">⌁</span
      >
      <span class="text-sm">AI Data Visualization</span>
    </a>

    <nav class="ml-auto hidden items-center gap-1 lg:flex" aria-label="Datasets">
      {#each links as link (link.path)}
        <a
          href={href(link.path)}
          class="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          class:bg-accent={router.isActive(link.path)}
          class:text-foreground={router.isActive(link.path)}
          aria-current={router.isActive(link.path) ? 'page' : undefined}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <button
      type="button"
      class="chip ml-auto lg:ml-0"
      onclick={() => theme.toggle()}
      aria-label="Switch to {theme.mode === 'dark' ? 'light' : 'dark'} mode"
    >
      {theme.mode === 'dark' ? '☾ Dark' : '☀ Light'}
    </button>

    <button
      type="button"
      class="chip lg:hidden"
      aria-expanded={open}
      aria-controls="mobile-nav"
      onclick={() => (open = !open)}
    >
      Menu
    </button>
  </div>

  {#if open}
    <nav id="mobile-nav" class="container grid grid-cols-2 gap-1 pb-3 lg:hidden" aria-label="Datasets">
      {#each links as link (link.path)}
        <a
          href={href(link.path)}
          class="rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          class:bg-accent={router.isActive(link.path)}
          class:text-foreground={router.isActive(link.path)}
          onclick={() => (open = false)}
        >
          {link.label}
        </a>
      {/each}
    </nav>
  {/if}
</header>
