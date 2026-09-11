<script setup lang="ts">
import { computed } from 'vue'
import { useAnalysis } from '~/composables/useAnalysis'
import { useChessWorld } from '~/composables/useChessWorld'
import { QUALITY_MARK } from '~/game/review'

const state = useChessWorld()
const analysis = useAnalysis()

const canReview = computed(() => state.history.value.length >= 2 && !analysis.reviewing.value)
const percent = computed(() => Math.round(analysis.reviewProgress.value * 100))

const sides = computed(() => {
  const result = analysis.review.value
  if (!result) return []
  return [
    { name: 'Cyan', tone: 'text-light', stats: result.white },
    { name: 'Magenta', tone: 'text-dark', stats: result.black },
  ]
})

const turning = computed(() => analysis.review.value?.turningPoint ?? null)

/** Half a move number, the way a scoresheet cites one: 23. or 23… */
function cite(ply: number, color: number): string {
  return `${Math.floor(ply / 2) + 1}${color === 0 ? '.' : '…'}`
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="label">Review</span>
      <button
        v-if="state.browsingPly.value !== null"
        class="text-[11px] text-light underline-offset-2 hover:underline"
        @click="state.exitBrowse()"
      >Back to the game</button>
    </div>

    <div v-if="analysis.reviewing.value" class="flex flex-col gap-1.5">
      <div class="h-1 overflow-hidden rounded-full bg-muted">
        <div class="h-full bg-light transition-[width] duration-200" :style="{ width: `${percent}%` }" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[11px] text-muted-foreground">Searching every position — {{ percent }}%</span>
        <button class="text-[11px] text-muted-foreground hover:text-foreground" @click="analysis.cancelReview()">
          Cancel
        </button>
      </div>
    </div>

    <button
      v-else-if="!analysis.review.value"
      class="btn text-xs"
      :disabled="!canReview"
      @click="state.startReview()"
    >Review the game</button>

    <template v-else>
      <table class="w-full border-collapse text-[11px]">
        <thead>
          <tr class="text-muted-foreground">
            <th class="pb-1 text-left font-normal">Side</th>
            <th class="pb-1 text-right font-normal">Accuracy</th>
            <th class="pb-1 text-right font-normal" title="Average centipawns thrown away per move">ACPL</th>
            <th class="pb-1 text-right font-normal" title="Inaccuracies / mistakes / blunders">?! ? ??</th>
          </tr>
        </thead>
        <tbody class="font-mono">
          <tr v-for="side in sides" :key="side.name">
            <td class="py-0.5" :class="side.tone">{{ side.name }}</td>
            <td class="py-0.5 text-right tabular-nums">{{ side.stats.accuracy.toFixed(1) }}%</td>
            <td class="py-0.5 text-right tabular-nums">{{ side.stats.acpl }}</td>
            <td class="py-0.5 text-right tabular-nums">
              <span>{{ side.stats.inaccuracies }}</span>
              <span class="text-warn"> {{ side.stats.mistakes }}</span>
              <span class="text-danger"> {{ side.stats.blunders }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <button
        v-if="turning"
        class="rounded-md border border-border/60 bg-muted/20 px-2.5 py-2 text-left transition-colors hover:border-light/40"
        @click="state.reviewSeek(turning.ply + 1)"
      >
        <span class="label">Where it turned</span>
        <span class="mt-0.5 block font-mono text-xs">
          {{ cite(turning.ply, turning.color) }} {{ turning.san }}{{ QUALITY_MARK[turning.quality] }}
          <span v-if="turning.best" class="text-muted-foreground"> — {{ turning.best }} instead</span>
        </span>
        <span class="mt-0.5 block text-[11px] text-muted-foreground">
          {{ (turning.before / 100).toFixed(1) }} → {{ (turning.after / 100).toFixed(1) }},
          {{ turning.loss }} centipawns
        </span>
      </button>

      <p class="text-[11px] leading-relaxed text-muted-foreground">
        Every position searched to depth {{ analysis.review.value.depth }} in
        {{ analysis.review.value.budgetMs }}ms. Click any move to stand the board on it.
      </p>

      <button class="btn text-xs" @click="analysis.clearReview()">Clear</button>
    </template>
  </section>
</template>
