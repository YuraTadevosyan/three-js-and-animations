<script setup lang="ts">
import { computed } from 'vue'
import { useChessWorld } from '~/composables/useChessWorld'
import { LOW_MS, URGENT_MS, formatClock } from '~/game/clock'

const state = useChessWorld()

const running = computed(() => state.timeControl.value.base > 0)

const sides = computed(() =>
  ([0, 1] as const).map((color) => {
    const ms = state.clockTimes.value[color]
    return {
      color,
      name: color === 0 ? 'Cyan' : 'Magenta',
      time: formatClock(ms),
      active: state.clockActive.value === color && !state.clockPaused.value,
      low: ms < LOW_MS && ms > 0,
      urgent: ms < URGENT_MS,
      out: ms <= 0,
    }
  }),
)

const started = computed(() => state.history.value.length > 0)
</script>

<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="label">Time</span>
      <button
        v-if="running && started && !state.gameOver.value"
        class="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        @click="state.setClockPaused(!state.clockPaused.value)"
      >{{ state.clockPaused.value ? 'Resume' : 'Pause' }}</button>
    </div>

    <div class="seg w-full">
      <button
        v-for="control in state.timeControls"
        :key="control.id"
        class="seg-item flex-1"
        :title="`${control.name} — ${control.short}`"
        :data-active="state.timeControlId.value === control.id"
        @click="state.setTimeControl(control.id)"
      >{{ control.short }}</button>
    </div>

    <div v-if="running" class="grid grid-cols-2 gap-1.5">
      <div
        v-for="side in sides"
        :key="side.color"
        class="rounded-md border px-2.5 py-1.5 transition-colors"
        :class="[
          side.active ? 'border-light/60 bg-light/10' : 'border-border/60 bg-muted/20',
          side.active && side.urgent ? 'animate-pulse-ring' : '',
        ]"
      >
        <span class="flex items-center gap-1.5">
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="side.color === 0 ? 'bg-light' : 'bg-dark'"
          />
          <span class="text-[11px] text-muted-foreground">{{ side.name }}</span>
        </span>
        <span
          class="mt-0.5 block font-mono text-lg leading-tight tabular-nums"
          :class="side.out ? 'text-danger' : side.urgent ? 'text-danger' : side.low ? 'text-warn' : ''"
        >{{ side.time }}</span>
      </div>
    </div>

    <p v-if="running && !started" class="text-[11px] text-muted-foreground">
      The clock starts on the first move.
    </p>
    <p v-else-if="state.clockPaused.value" class="text-[11px] text-warn">Paused</p>
  </section>
</template>
