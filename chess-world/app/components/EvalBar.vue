<script setup lang="ts">
import { computed } from 'vue'
import { useAnalysis } from '~/composables/useAnalysis'
import { useChessWorld } from '~/composables/useChessWorld'

const analysis = useAnalysis()
const state = useChessWorld()

/**
 * Centipawns are unbounded; a bar is not. This is the usual logistic squash —
 * four hundred centipawns is about three quarters of the bar — so an extra
 * queen at the end of a won game does not look different from an extra rook.
 */
const share = computed(() => {
  const value = analysis.liveEval.value
  if (!value) return 0.5
  if (value.mateIn !== null) return value.mateIn > 0 ? 1 : 0
  const probability = 1 / (1 + 10 ** (-value.cp / 400))
  return Math.max(0.02, Math.min(0.98, probability))
})

const label = computed(() => {
  const value = analysis.liveEval.value
  if (!value) return '—'
  if (value.mateIn !== null) return `M${Math.abs(value.mateIn)}`
  const pawns = value.cp / 100
  if (Math.abs(pawns) < 0.05) return '0.0'
  return `${pawns > 0 ? '+' : '−'}${Math.abs(pawns).toFixed(1)}`
})

const leading = computed(() => (analysis.liveEval.value?.cp ?? 0) >= 0)
const visible = computed(() => analysis.evalEnabled.value && state.ready.value)
</script>

<template>
  <div
    v-if="visible"
    class="pointer-events-none absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 sm:flex lg:left-5"
    :title="`Evaluation — depth ${analysis.liveEval.value?.depth ?? 0}`"
  >
    <span
      class="font-mono text-[10px] tabular-nums"
      :class="leading ? 'text-light' : 'text-dark'"
    >{{ label }}</span>
    <div class="relative h-[min(46vh,20rem)] w-2 overflow-hidden rounded-full bg-dark/70 ring-1 ring-border/60">
      <div
        class="absolute inset-x-0 bottom-0 bg-light transition-[height] duration-700 ease-out"
        :style="{ height: `${share * 100}%` }"
      />
      <!-- Level pegging, so the eye has something to measure against. -->
      <div class="absolute inset-x-0 top-1/2 h-px bg-background/70" />
    </div>
  </div>
</template>
