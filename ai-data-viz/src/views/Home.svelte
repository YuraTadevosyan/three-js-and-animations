<script lang="ts">
  import HeroFlow from '@/components/HeroFlow.svelte'
  import DatasetCard from '@/components/DatasetCard.svelte'
  import { DATASETS } from '@/data/registry'
  import { href } from '@/lib/router.svelte'

  const liveCount = DATASETS.filter((d) => d.live).length
</script>

<section class="relative overflow-hidden border-b">
  <div class="pointer-events-none absolute inset-x-0 bottom-0 opacity-70">
    <HeroFlow height={240} />
  </div>
  <div
    class="pointer-events-none absolute inset-0"
    style:background="linear-gradient(to bottom, hsl(var(--background)) 22%, transparent 78%)"
    aria-hidden="true"
  ></div>

  <div class="container relative py-16 sm:py-20">
    <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      Svelte 5 · D3 · generated data
    </p>
    <h1 class="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
      Six invented datasets, visualised properly.
    </h1>
    <p class="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
      Every series on this site is generated in the browser from a fixed seed —
      company revenue, a trading session, spacecraft telemetry, a week of city
      traffic, a packet fabric, and a century of climate. Then an analyst panel
      reads them back: regression, rolling z-scores, changepoints and
      autocorrelation, all computed client-side.
    </p>

    <div class="mt-7 flex flex-wrap items-center gap-3">
      <a
        href={href('/d/company')}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
               transition-opacity hover:opacity-90"
      >
        Start with company analytics
      </a>
      <a
        href={href('/about')}
        class="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        How it's built
      </a>
    </div>

    <dl class="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-sm">
      <div>
        <dt class="text-xs text-muted-foreground">Datasets</dt>
        <dd class="mt-0.5 text-2xl font-semibold">{DATASETS.length}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">Streaming live</dt>
        <dd class="mt-0.5 text-2xl font-semibold">{liveCount}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">Model calls</dt>
        <dd class="mt-0.5 text-2xl font-semibold">0</dd>
      </div>
    </dl>
  </div>
</section>

<section class="container py-12">
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2 class="text-xl font-semibold tracking-tight">Datasets</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Each one picks its chart forms from what the data's job actually is.
      </p>
    </div>
  </div>

  <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {#each DATASETS as meta (meta.id)}
      <DatasetCard {meta} />
    {/each}
  </div>
</section>

<section class="container pb-4">
  <div class="grid gap-4 sm:grid-cols-3">
    <div class="panel p-5">
      <h3 class="text-sm font-semibold">Flowing graphs</h3>
      <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
        Telemetry streams at up to 10 Hz into eight small multiples; the trading
        tape appends bars as you watch; packets integrate along every link, every
        frame. One shared requestAnimationFrame loop drives all of it, so charts
        on a page never disagree about “now”.
      </p>
    </div>
    <div class="panel p-5">
      <h3 class="text-sm font-semibold">Morphing charts</h3>
      <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
        The revenue chart holds four forms — stacked, grouped, 100% and stream —
        in one set of rectangles. The marks and the y-domain tween together, so
        nothing cross-fades and nothing is redrawn from scratch.
      </p>
    </div>
    <div class="panel p-5">
      <h3 class="text-sm font-semibold">Animated nodes</h3>
      <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
        A d3-force simulation lays out a 38-node packet fabric and keeps a
        whisper of alpha so it stays alive. The city map does the opposite: fixed
        junctions, moving vehicles, because a map that reshuffles stops being a
        map.
      </p>
    </div>
  </div>
</section>
