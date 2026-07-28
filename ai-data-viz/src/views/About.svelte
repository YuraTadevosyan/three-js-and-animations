<script lang="ts">
  import { DATASETS } from '@/data/registry'
  import { href } from '@/lib/router.svelte'

  const SLOTS = [
    { n: 1, hue: 'blue' },
    { n: 2, hue: 'orange' },
    { n: 3, hue: 'aqua' },
    { n: 4, hue: 'yellow' },
    { n: 5, hue: 'magenta' },
    { n: 6, hue: 'green' },
    { n: 7, hue: 'violet' },
    { n: 8, hue: 'red' },
  ]

  const SEQ = [100, 200, 300, 400, 500, 600, 700]
  const DIV = ['neg-3', 'neg-2', 'neg-1', 'mid', 'pos-1', 'pos-2', 'pos-3']
  const STATUS = [
    { key: 'good', label: 'Good' },
    { key: 'warning', label: 'Warning' },
    { key: 'serious', label: 'Serious' },
    { key: 'critical', label: 'Critical' },
  ]
</script>

<header class="border-b py-10">
  <div class="container">
    <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">How it's built</h1>
    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
      An honest account of what is real here and what is invented — and of the
      rules the charts follow.
    </p>
  </div>
</header>

<div class="container grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
  <div class="flex flex-col gap-10">
    <section>
      <h2 class="text-lg font-semibold tracking-tight">The data is fake. The statistics are not.</h2>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
        Every series is generated in the browser by a seeded PRNG plus layered
        value noise, so a reload reproduces the same numbers exactly. That
        determinism matters more than it might sound: the analyst panel cites
        specific timestamps and magnitudes, and those citations would be nonsense
        if the data reshuffled underneath them.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
        The analyst itself calls no model. Each line it prints comes out of
        <code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">lib/stats.ts</code>
        running over the generated series: ordinary least squares with an R² and a
        widening forecast band, rolling z-scores against a trailing window, a
        CUSUM changepoint scan, autocorrelation for seasonality, and annualised
        volatility of log returns. The framing is the fiction; the arithmetic
        holds up, which is why you can check any claim against the chart beside
        it.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
        The practical payoff is that the whole thing runs offline on a static
        host, with no key to paste in and no request to wait on.
      </p>
    </section>

    <section>
      <h2 class="text-lg font-semibold tracking-tight">Choosing the form before the colour</h2>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
        Each view picks its chart type from what the reader has to do, not from
        what looks impressive. A single current value gets a stat tile, never a
        one-bar bar chart. Magnitude over a grid gets a heatmap on a sequential
        ramp. Distinct series get categorical slots. Polarity — which side of a
        baseline — gets the diverging pair. And when one series is the story, the
        rest go gray rather than joining a rainbow.
      </p>
      <ul class="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
        <li>
          <span class="font-medium text-foreground">No dual axes anywhere.</span>
          CO₂ gets its own chart rather than a second scale on the temperature
          plot; volume is a stacked panel under the price plot with its own
          baseline. Two scales in one frame invent a correlation the data
          doesn't contain.
        </li>
        <li>
          <span class="font-medium text-foreground">Colour follows the entity.</span>
          Changing a date range never repaints a segment, because a reader who
          learned “Cloud is blue” should not be misled by a filter.
        </li>
        <li>
          <span class="font-medium text-foreground">Every chart has a table twin.</span>
          The Table toggle on each card is the accessible equivalent, and the
          relief channel for the three light-mode hues that sit below 3:1 against
          the surface.
        </li>
        <li>
          <span class="font-medium text-foreground">Status colours stay reserved.</span>
          Candles and telemetry channels wear them because the value genuinely
          means good-to-critical — and they always ship with an icon and a word,
          never colour alone.
        </li>
      </ul>
    </section>

    <section>
      <h2 class="text-lg font-semibold tracking-tight">The palette was validated, not eyeballed</h2>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
        Both modes were run through the lightness band, chroma floor, CVD
        separation, normal-vision floor and surface-contrast checks against this
        app's own surfaces. Dark clears every gate outright; light carries the
        documented sub-3:1 warning on three slots, which is why the table view is
        not optional here. The eight slots are assigned in a fixed order and
        never cycled — a ninth series would fold into “Other” rather than
        generate a hue.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
        The force graph caps at three node classes for the same reason: it's an
        all-pairs form, where any two marks can end up adjacent, and three slots
        is what passes that harder test. Shape carries the class as well, so
        identity never rests on hue alone.
      </p>

      <div class="mt-6 flex flex-col gap-5">
        <div>
          <p class="text-xs font-medium text-muted-foreground">Categorical · fixed order</p>
          <ul class="mt-2 flex flex-wrap gap-2">
            {#each SLOTS as slot (slot.n)}
              <li class="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]">
                <span
                  class="h-3 w-3 rounded-[2px]"
                  style:background="var(--series-{slot.n})"
                  aria-hidden="true"
                ></span>
                {slot.n} · {slot.hue}
              </li>
            {/each}
          </ul>
        </div>

        <div>
          <p class="text-xs font-medium text-muted-foreground">Sequential · one hue, light → dark</p>
          <div class="mt-2 flex h-6 max-w-sm overflow-hidden rounded-md" aria-hidden="true">
            {#each SEQ as step (step)}
              <span class="flex-1" style:background="var(--seq-{step})"></span>
            {/each}
          </div>
        </div>

        <div>
          <p class="text-xs font-medium text-muted-foreground">
            Diverging · two hues, neutral gray midpoint
          </p>
          <div class="mt-2 flex h-6 max-w-sm overflow-hidden rounded-md" aria-hidden="true">
            {#each DIV as step (step)}
              <span class="flex-1" style:background="var(--div-{step})"></span>
            {/each}
          </div>
        </div>

        <div>
          <p class="text-xs font-medium text-muted-foreground">Status · reserved, never themed</p>
          <ul class="mt-2 flex flex-wrap gap-2">
            {#each STATUS as s (s.key)}
              <li class="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]">
                <span
                  class="h-3 w-3 rounded-full"
                  style:background="var(--status-{s.key})"
                  aria-hidden="true"
                ></span>
                {s.label}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-semibold tracking-tight">Stack</h2>
      <dl class="mt-3 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        <div>
          <dt class="font-medium">Svelte 5</dt>
          <dd class="text-muted-foreground">
            Runes throughout — <code class="font-mono text-xs">$state</code>,
            <code class="font-mono text-xs">$derived</code>,
            <code class="font-mono text-xs">$effect</code> — plus
            <code class="font-mono text-xs">Tween</code> from
            <code class="font-mono text-xs">svelte/motion</code> for the morph.
          </dd>
        </div>
        <div>
          <dt class="font-medium">D3 (modules only)</dt>
          <dd class="text-muted-foreground">
            scale, shape, array, force, time, format. No
            <code class="font-mono text-xs">d3-selection</code>: Svelte owns the
            DOM, D3 does the maths.
          </dd>
        </div>
        <div>
          <dt class="font-medium">Rendering</dt>
          <dd class="text-muted-foreground">
            SVG where marks are few and interactive; canvas where hundreds of
            things move every frame.
          </dd>
        </div>
        <div>
          <dt class="font-medium">Everything else</dt>
          <dd class="text-muted-foreground">
            Vite, TypeScript, Tailwind, a forty-line hash router. No chart
            library — every mark here is hand-drawn.
          </dd>
        </div>
      </dl>
    </section>
  </div>

  <aside class="flex flex-col gap-4">
    <div class="panel p-5">
      <h2 class="text-sm font-semibold">Datasets</h2>
      <ul class="mt-3 flex flex-col gap-3">
        {#each DATASETS as meta (meta.id)}
          <li>
            <a class="group flex items-start gap-2 text-sm" href={href(`/d/${meta.id}`)}>
              <span
                class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style:background="var(--series-{meta.accent})"
                aria-hidden="true"
              ></span>
              <span>
                <span class="font-medium group-hover:underline">{meta.name}</span>
                <span class="block text-xs text-muted-foreground">{meta.tagline}</span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </div>

    <div class="panel p-5">
      <h2 class="text-sm font-semibold">Keyboard</h2>
      <ul class="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
        <li>
          <kbd class="rounded border px-1.5 py-0.5 font-mono">Tab</kbd> into any chart to read it.
        </li>
        <li>
          <kbd class="rounded border px-1.5 py-0.5 font-mono">←</kbd>
          <kbd class="rounded border px-1.5 py-0.5 font-mono">→</kbd> step between data points.
        </li>
        <li>
          <kbd class="rounded border px-1.5 py-0.5 font-mono">Esc</kbd> dismisses the readout.
        </li>
      </ul>
      <p class="mt-3 text-xs leading-relaxed text-muted-foreground">
        Keyboard focus shows exactly what hover shows. Tooltips enhance; they
        never gate a value.
      </p>
    </div>
  </aside>
</div>
