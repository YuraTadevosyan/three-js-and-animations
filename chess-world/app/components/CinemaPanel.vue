<script setup lang="ts">
import { computed } from 'vue'
import MoveList from '~/components/MoveList.vue'
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()

const progress = computed(() =>
  state.cinemaLength.value ? (state.cinemaPly.value / state.cinemaLength.value) * 100 : 0,
)

const SPEEDS = [0.5, 1, 1.75, 3]

function onScrub(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  state.cinemaSeek(value)
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-4">
    <section class="flex flex-col gap-2">
      <span class="label">Famous games</span>
      <div class="flex max-h-44 flex-col gap-1 overflow-y-auto pr-1">
        <button
          v-for="fixture in state.cinemaGames"
          :key="fixture.id"
          class="rounded-md border px-3 py-2 text-left transition-colors"
          :class="
            state.cinemaId.value === fixture.id
              ? 'border-light/60 bg-light/10'
              : 'border-border/60 bg-muted/20 hover:border-light/40 hover:bg-muted/40'
          "
          @click="state.loadCinema(fixture.id)"
        >
          <span class="block text-xs font-semibold">{{ fixture.title }}</span>
          <span class="block text-[11px] text-muted-foreground">
            {{ fixture.white }} — {{ fixture.black }}, {{ fixture.year }}
          </span>
        </button>
      </div>
    </section>

    <p class="text-[11px] leading-relaxed text-muted-foreground">{{ state.cinemaGame.value.blurb }}</p>

    <section class="flex flex-col gap-2">
      <div class="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>{{ state.cinemaPly.value }} / {{ state.cinemaLength.value }}</span>
        <span>{{ state.cinemaGame.value.event }}</span>
      </div>
      <input
        type="range"
        class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-light"
        :style="{
          background: `linear-gradient(to right, hsl(var(--light)) ${progress}%, hsl(var(--muted)) ${progress}%)`,
        }"
        min="0"
        :max="state.cinemaLength.value"
        :value="state.cinemaPly.value"
        aria-label="Move position"
        @input="onScrub"
      >
      <div class="grid grid-cols-4 gap-1.5">
        <button class="btn" title="Restart" @click="state.cinemaSeek(0)">⏮</button>
        <button class="btn" title="Previous move" @click="state.cinemaSeek(state.cinemaPly.value - 1)">◀</button>
        <button
          class="btn btn-primary"
          :title="state.cinemaPlaying.value ? 'Pause' : 'Play'"
          @click="state.cinemaPlaying.value ? state.cinemaPause() : state.cinemaPlay()"
        >{{ state.cinemaPlaying.value ? '❚❚' : '▶' }}</button>
        <button
          class="btn"
          title="Next move"
          :disabled="state.animating.value"
          @click="state.cinemaStep()"
        >▶❚</button>
      </div>
      <div class="seg w-full">
        <button
          v-for="speed in SPEEDS"
          :key="speed"
          class="seg-item flex-1"
          :data-active="state.cinemaSpeed.value === speed"
          @click="state.setCinemaSpeed(speed)"
        >{{ speed }}×</button>
      </div>
    </section>

    <Transition
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0"
    >
      <p
        v-if="state.cinemaNote.value"
        class="rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-[11px] leading-relaxed text-warn"
      >
        {{ state.cinemaNote.value }}
      </p>
    </Transition>

    <div class="rule" />

    <MoveList seekable class="min-h-[8rem]" />
  </div>
</template>
