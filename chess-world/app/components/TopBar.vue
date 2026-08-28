<script setup lang="ts">
import { computed } from 'vue'
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()
const emit = defineEmits<{ settings: []; about: [] }>()

const turnLabel = computed(() => (state.turn.value === 0 ? 'Cyan' : 'Magenta'))
const statusLine = computed(() => {
  if (state.status.value.over) return state.resultText.value ?? 'Game over'
  if (state.mode.value === 'cinema') {
    return `${state.cinemaGame.value.white} vs ${state.cinemaGame.value.black}, ${state.cinemaGame.value.year}`
  }
  if (state.thinking.value) return 'Engine is thinking…'
  if (state.status.value.inCheck) return `${turnLabel.value} is in check`
  return `${turnLabel.value} to move`
})
</script>

<template>
  <header class="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-4">
    <div class="glass pointer-events-auto flex items-center gap-3 px-3 py-2 sm:px-4">
      <div class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-light/10 text-lg text-light text-glow-light">
        ♞
      </div>
      <div class="min-w-0">
        <h1 class="truncate text-sm font-semibold tracking-tight sm:text-base">Interactive Chess World</h1>
        <p class="truncate text-[11px] text-muted-foreground sm:text-xs">
          <span
            class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
            :class="state.turn.value === 0 ? 'bg-light' : 'bg-dark'"
          />
          {{ statusLine }}
        </p>
      </div>
    </div>

    <div class="pointer-events-auto flex items-center gap-2">
      <div class="seg glass">
        <button
          v-for="option in (['play', 'cinema'] as const)"
          :key="option"
          class="seg-item"
          :data-active="state.mode.value === option"
          @click="state.setMode(option)"
        >
          {{ option }}
        </button>
      </div>

      <button class="btn btn-icon glass" title="Settings" aria-label="Settings" @click="emit('settings')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <button class="btn btn-icon glass" title="About" aria-label="About" @click="emit('about')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </header>
</template>
