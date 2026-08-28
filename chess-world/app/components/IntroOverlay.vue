<script setup lang="ts">
const emit = defineEmits<{ start: [] }>()

const MOVES = [
  { glyph: '♞', name: 'Knights', text: 'crouch, somersault over the corner of their L, and land hard enough to shake the camera' },
  { glyph: '♛', name: 'Queens', text: 'do not slide anywhere — they come apart into a column of light and reassemble on the far square' },
  { glyph: '♜', name: 'Rooks', text: 'rock back, then charge behind a shockwave' },
  { glyph: '♝', name: 'Bishops', text: 'spin up and streak down the diagonal on a beam' },
  { glyph: '♚', name: 'A captured piece', text: 'is torn apart into a few hundred sparks, and a mated king topples over' },
]
</script>

<template>
  <div class="absolute inset-0 z-50 grid place-items-center bg-background/85 backdrop-blur-md">
    <div class="glass animate-panel-in w-[min(34rem,92vw)] p-6 sm:p-8">
      <p class="label">A chess game where every move is choreographed</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Interactive Chess World</h1>

      <ul class="mt-5 flex flex-col gap-2.5">
        <li v-for="item in MOVES" :key="item.name" class="flex items-start gap-3">
          <span class="mt-0.5 w-5 shrink-0 text-center text-lg leading-none text-light text-glow-light">
            {{ item.glyph }}
          </span>
          <p class="text-[13px] leading-relaxed text-muted-foreground">
            <span class="font-medium text-foreground">{{ item.name }}</span> {{ item.text }}.
          </p>
        </li>
      </ul>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button class="btn btn-primary flex-1 py-2.5 text-sm" @click="emit('start')">Enter the arena</button>
        <p class="text-[11px] leading-relaxed text-muted-foreground sm:max-w-[14rem]">
          Play a full game against the engine, or watch a famous one replayed in Cinema.
        </p>
      </div>
    </div>
  </div>
</template>
