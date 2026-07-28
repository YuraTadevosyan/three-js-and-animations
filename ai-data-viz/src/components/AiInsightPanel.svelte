<script lang="ts">
  import type { Insight, InsightSeverity } from '@/lib/stats'
  import { prefersReducedMotion } from '@/lib/ticker'

  /**
   * The analyst panel.
   *
   * Every line it prints came out of `lib/stats.ts` running over the generated
   * series — ordinary least squares, rolling z-scores, a CUSUM changepoint scan,
   * autocorrelation. There is no model call anywhere in this app; the framing is
   * the fiction, the arithmetic is not. That is deliberate: it means each claim
   * can be checked against the chart beside it, and it means the whole thing
   * still works offline on a static host.
   */

  interface Props {
    insights: Insight[]
    /** Bumping this replays the analysis — used by the "Re-run" control. */
    runId?: number
  }

  let { insights, runId = 0 }: Props = $props()

  const SEVERITY: Record<InsightSeverity, { color: string; icon: string; label: string }> = {
    info: { color: 'var(--series-1)', icon: '›', label: 'Note' },
    good: { color: 'var(--status-good)', icon: '✓', label: 'Healthy' },
    warning: { color: 'var(--status-warning)', icon: '!', label: 'Watch' },
    serious: { color: 'var(--status-serious)', icon: '▲', label: 'Serious' },
    critical: { color: 'var(--status-critical)', icon: '✕', label: 'Critical' },
  }

  let shown = $state(0)
  let typed = $state('')
  let done = $state(false)

  $effect(() => {
    // Re-runs whenever the dataset or the run id changes.
    void runId
    const list = insights
    shown = 0
    typed = ''
    done = false

    if (prefersReducedMotion()) {
      shown = list.length
      done = true
      return
    }

    let index = 0
    let char = 0
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      if (index >= list.length) {
        done = true
        return
      }
      const text = list[index].text
      if (char < text.length) {
        // Step several characters per frame — a real per-character crawl reads
        // as slow rather than as thinking.
        char = Math.min(text.length, char + 3)
        typed = text.slice(0, char)
        timer = setTimeout(tick, 12)
      } else {
        index += 1
        shown = index
        char = 0
        typed = ''
        timer = setTimeout(tick, 240)
      }
    }

    timer = setTimeout(tick, 320)
    return () => clearTimeout(timer)
  })

  const pending = $derived(insights[shown])
</script>

<section class="panel flex flex-col overflow-hidden" aria-live="polite" aria-busy={!done}>
  <header class="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
    <div class="flex items-center gap-2">
      <span
        class="grid h-6 w-6 place-items-center rounded-md text-[13px] font-bold"
        style:background="hsl(var(--primary) / 0.16)"
        style:color="var(--series-1)"
        aria-hidden="true">⌁</span
      >
      <h3 class="text-sm font-semibold">AI analyst</h3>
    </div>
    <span class="text-[11px] text-muted-foreground">
      {done ? `${insights.length} findings` : 'analysing…'}
    </span>
  </header>

  <ol class="flex flex-col divide-y">
    {#each insights.slice(0, shown) as insight (insight.id)}
      {@const sev = SEVERITY[insight.severity]}
      <li class="animate-fade-up px-4 py-3 sm:px-5">
        <div class="flex items-center gap-2">
          <!-- Status colour never travels alone: icon and word ride with it. -->
          <span class="text-xs font-bold" style:color={sev.color} aria-hidden="true">{sev.icon}</span>
          <span class="text-[11px] font-semibold uppercase tracking-wider" style:color={sev.color}>
            {sev.label}
          </span>
          <span class="text-[11px] uppercase tracking-wider text-muted-foreground">
            · {insight.kind}
          </span>
        </div>
        <p class="mt-1.5 text-sm leading-relaxed text-card-foreground">{insight.text}</p>
        {#if insight.evidence}
          <p class="mt-1 font-mono text-[11px] text-muted-foreground">{insight.evidence}</p>
        {/if}
      </li>
    {/each}

    {#if !done && pending}
      {@const sev = SEVERITY[pending.severity]}
      <li class="px-4 py-3 sm:px-5">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold" style:color={sev.color} aria-hidden="true">{sev.icon}</span>
          <span class="text-[11px] font-semibold uppercase tracking-wider" style:color={sev.color}>
            {sev.label}
          </span>
        </div>
        <p class="mt-1.5 text-sm leading-relaxed text-card-foreground">
          {typed}<span class="ml-px inline-block animate-caret" aria-hidden="true">▌</span>
        </p>
      </li>
    {/if}
  </ol>

  <p class="border-t px-4 py-2.5 text-[11px] leading-relaxed text-muted-foreground sm:px-5">
    Findings are computed in the browser from the generated series — regression,
    rolling z-scores, CUSUM changepoints and autocorrelation. No model is called.
  </p>
</section>
