<script setup lang="ts">
import { computed } from 'vue'
import CapturedTray from '~/components/CapturedTray.vue'
import ClockPanel from '~/components/ClockPanel.vue'
import MoveList from '~/components/MoveList.vue'
import ReviewPanel from '~/components/ReviewPanel.vue'
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()

const DIFFICULTY_LABELS = {
  novice: { name: 'Novice', hint: 'Shallow, and happy to blunder' },
  club: { name: 'Club', hint: 'Looks a few moves ahead' },
  master: { name: 'Master', hint: 'Full budget, no mercy' },
} as const

const evaluation = computed(() => {
  const line = state.engineLine.value
  if (!line) return null
  if (line.mateIn !== null) return line.mateIn > 0 ? `mate in ${line.mateIn}` : `mated in ${-line.mateIn}`
  const pawns = line.score / 100
  return `${pawns >= 0 ? '+' : ''}${pawns.toFixed(2)}`
})
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-4">
    <section class="flex flex-col gap-2">
      <span class="label">You play</span>
      <div class="seg w-full">
        <button
          class="seg-item flex-1"
          :data-active="state.playerSide.value === 0"
          @click="state.setPlayerSide(0)"
        >Cyan</button>
        <button
          class="seg-item flex-1"
          :data-active="state.playerSide.value === 1"
          @click="state.setPlayerSide(1)"
        >Magenta</button>
        <button
          class="seg-item flex-1"
          :data-active="state.opponent.value === 'human'"
          title="Both sides played on this device"
          @click="state.setOpponent(state.opponent.value === 'human' ? 'engine' : 'human')"
        >Hotseat</button>
      </div>
    </section>

    <section v-if="state.opponent.value === 'engine'" class="flex flex-col gap-2">
      <span class="label">Opponent</span>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="(meta, key) in DIFFICULTY_LABELS"
          :key="key"
          class="btn flex-col items-start gap-0 px-2.5 py-2 text-left"
          :class="state.difficulty.value === key ? 'btn-primary' : ''"
          :title="meta.hint"
          @click="state.setDifficulty(key)"
        >
          <span class="text-xs font-semibold">{{ meta.name }}</span>
        </button>
      </div>
      <p class="text-[11px] leading-relaxed text-muted-foreground">
        {{ DIFFICULTY_LABELS[state.difficulty.value].hint }}
      </p>
    </section>

    <ClockPanel />

    <section class="grid grid-cols-3 gap-1.5">
      <button class="btn" @click="state.newGame()">New</button>
      <button
        class="btn"
        :disabled="!state.history.value.length || state.thinking.value || state.browsingPly.value !== null"
        @click="state.undo()"
      >Undo</button>
      <button class="btn" :disabled="!state.interactive.value" @click="state.requestHint()">Hint</button>
    </section>

    <section
      v-if="state.opponent.value === 'engine'"
      class="rounded-md border border-border/60 bg-muted/20 px-3 py-2"
    >
      <div class="flex items-center justify-between">
        <span class="label">Engine</span>
        <span v-if="state.thinking.value" class="flex items-center gap-1.5 text-[11px] text-light">
          <span class="h-1.5 w-1.5 animate-ping rounded-full bg-light" />
          thinking
        </span>
      </div>
      <dl v-if="state.engineLine.value" class="mt-1.5 grid grid-cols-3 gap-1 font-mono text-[11px]">
        <div>
          <dt class="text-muted-foreground">depth</dt>
          <dd>{{ state.engineLine.value.depth }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">eval</dt>
          <dd :class="state.engineLine.value.score >= 0 ? 'text-warn' : 'text-accent'">{{ evaluation }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">nodes</dt>
          <dd>{{ state.engineLine.value.nodes.toLocaleString() }}</dd>
        </div>
      </dl>
      <p v-if="state.engineLine.value?.pv.length" class="mt-1.5 truncate font-mono text-[11px] text-muted-foreground">
        {{ state.engineLine.value.pv.slice(0, 6).join(' ') }}
      </p>
      <p v-else-if="!state.engineLine.value" class="mt-1.5 text-[11px] text-muted-foreground">
        Its line appears here once it has moved.
      </p>
    </section>

    <div class="rule" />

    <ReviewPanel />

    <div class="rule" />

    <MoveList class="min-h-[8rem]" />
    <CapturedTray />
  </div>
</template>
