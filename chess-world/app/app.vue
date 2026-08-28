<script setup lang="ts">
import { ref, watch } from 'vue'
import BoardCanvas from '~/components/BoardCanvas.vue'
import CinemaPanel from '~/components/CinemaPanel.vue'
import IntroOverlay from '~/components/IntroOverlay.vue'
import PlayPanel from '~/components/PlayPanel.vue'
import PromotionDialog from '~/components/PromotionDialog.vue'
import ResultCard from '~/components/ResultCard.vue'
import SettingsSheet from '~/components/SettingsSheet.vue'
import TopBar from '~/components/TopBar.vue'
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()
const started = ref(false)
const settingsOpen = ref(false)
const aboutOpen = ref(false)
const panelOpen = ref(false)
const resultDismissed = ref(false)

function start(): void {
  started.value = true
  state.setSound(state.soundOn.value)
}

watch(
  () => state.status.value.over,
  (over) => {
    if (over) resultDismissed.value = false
  },
)

watch(
  () => state.mode.value,
  () => {
    resultDismissed.value = false
  },
)
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-background">
    <BoardCanvas />

    <TopBar @settings="settingsOpen = true" @about="aboutOpen = true" />

    <!-- Side panel: a rail on desktop, a sheet on phones. -->
    <aside
      class="glass absolute z-20 flex flex-col overflow-hidden transition-transform duration-300
        inset-x-3 bottom-3 max-h-[62vh] p-4
        lg:inset-x-auto lg:right-4 lg:top-[4.75rem] lg:bottom-4 lg:w-[20.5rem] lg:max-h-none"
      :class="panelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.25rem)] lg:translate-y-0'"
    >
      <button
        class="mb-3 flex items-center justify-between lg:hidden"
        :aria-expanded="panelOpen"
        @click="panelOpen = !panelOpen"
      >
        <span class="label">{{ state.mode.value === 'play' ? 'Game' : 'Cinema' }}</span>
        <span class="text-muted-foreground">{{ panelOpen ? '▼' : '▲' }}</span>
      </button>

      <PlayPanel v-if="state.mode.value === 'play'" />
      <CinemaPanel v-else />
    </aside>

    <ResultCard
      v-if="state.status.value.over && !resultDismissed"
      @dismiss="resultDismissed = true"
    />

    <PromotionDialog v-if="state.promotionPrompt.value" />
    <SettingsSheet v-if="settingsOpen" @close="settingsOpen = false" />

    <!-- About -->
    <div
      v-if="aboutOpen"
      class="absolute inset-0 z-40 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
      @click.self="aboutOpen = false"
    >
      <div class="glass animate-panel-in w-[min(32rem,92vw)] p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold">About this build</h2>
            <p class="mt-1 text-[11px] text-muted-foreground">Nuxt 4 · PlayCanvas 2 · a chess engine with no library</p>
          </div>
          <button class="btn btn-ghost btn-icon" aria-label="Close" @click="aboutOpen = false">✕</button>
        </div>

        <div class="mt-4 flex flex-col gap-3 text-[13px] leading-relaxed text-muted-foreground">
          <p>
            The rules are hand-written: 0x88 board, legal move generation, SAN, and an alpha-beta search with a
            transposition table, killer moves and quiescence — verified against the standard perft positions and
            run in a worker so the board never stutters while the engine thinks.
          </p>
          <p>
            Nothing is loaded from disk. Every piece is a surface of revolution generated at boot, the knight's
            head is an extruded silhouette, the sparks are one dynamic mesh of camera-facing quads, and the
            sounds are oscillators.
          </p>
          <p>
            Drag to orbit · scroll or pinch to zoom · click a piece, then a highlighted square.
          </p>
        </div>
      </div>
    </div>

    <IntroOverlay v-if="!started" @start="start" />

    <!-- Toast -->
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-2"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.toast.value"
        class="glass pointer-events-none absolute bottom-[6.5rem] left-1/2 z-30 -translate-x-1/2 px-4 py-2 text-xs lg:bottom-6"
      >
        {{ state.toast.value }}
      </div>
    </Transition>
  </div>
</template>
