<script setup lang="ts">
import { computed } from 'vue'
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()
const emit = defineEmits<{ dismiss: [] }>()

const flag = computed(() => state.adjudication.value)

const headline = computed(() => {
  if (flag.value) return flag.value.winner === null ? 'Draw' : 'Out of time'
  const outcome = state.status.value.outcome
  if (outcome === 'checkmate') return 'Checkmate'
  if (outcome === 'stalemate') return 'Stalemate'
  return 'Draw'
})

const glyph = computed(() => {
  if (flag.value) return flag.value.winner === null ? '½' : '⏱'
  return state.status.value.outcome === 'checkmate' ? '♚' : '½'
})

const detail = computed(() => state.resultText.value ?? '')
const won = computed(() => {
  if (flag.value) return flag.value.winner === state.playerSide.value
  return state.status.value.outcome === 'checkmate' && state.status.value.winner === state.playerSide.value
})
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-4 sm:bottom-8">
    <div class="glass pointer-events-auto animate-panel-in flex items-center gap-4 px-5 py-3">
      <div
        class="grid h-10 w-10 place-items-center rounded-full text-lg"
        :class="won ? 'bg-light/15 text-light' : 'bg-dark/15 text-dark'"
      >
        {{ glyph }}
      </div>
      <div>
        <p class="text-sm font-semibold">{{ headline }}</p>
        <p class="text-[11px] text-muted-foreground">{{ detail }}</p>
      </div>
      <div class="flex gap-2">
        <button v-if="state.mode.value === 'play'" class="btn btn-primary text-xs" @click="state.newGame()">
          Play again
        </button>
        <button class="btn btn-ghost btn-icon" aria-label="Dismiss" @click="emit('dismiss')">✕</button>
      </div>
    </div>
  </div>
</template>
