<script setup lang="ts">
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()
const emit = defineEmits<{ close: [] }>()

const CAMERAS = [
  { key: 'follow', name: 'Follow', hint: 'Swings to each move, then settles back' },
  { key: 'cinema', name: 'Cinema', hint: 'Follow, plus a slow drift between moves' },
  { key: 'orbit', name: 'Manual', hint: 'The camera only moves when you drag it' },
] as const
</script>

<template>
  <div class="absolute inset-0 z-40 bg-background/60 backdrop-blur-sm" @click.self="emit('close')">
    <div class="glass animate-panel-in absolute right-3 top-16 w-[min(20rem,92vw)] p-4 sm:right-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold">Settings</h2>
        <button class="btn btn-ghost btn-icon" aria-label="Close" @click="emit('close')">✕</button>
      </div>

      <section class="mt-4 flex flex-col gap-2">
        <span class="label">Camera</span>
        <div class="flex flex-col gap-1">
          <button
            v-for="option in CAMERAS"
            :key="option.key"
            class="btn flex-col items-start gap-0.5 py-2 text-left"
            :class="state.cameraMode.value === option.key ? 'btn-primary' : ''"
            @click="state.setCameraMode(option.key)"
          >
            <span class="text-xs font-semibold">{{ option.name }}</span>
            <span class="text-[11px] font-normal text-muted-foreground">{{ option.hint }}</span>
          </button>
        </div>
      </section>

      <section class="mt-4 flex items-center justify-between">
        <div>
          <span class="label">Sound</span>
          <p class="text-[11px] text-muted-foreground">Synthesised, no audio files</p>
        </div>
        <button
          class="btn text-xs"
          :class="state.soundOn.value ? 'btn-primary' : ''"
          @click="state.setSound(!state.soundOn.value)"
        >{{ state.soundOn.value ? 'On' : 'Off' }}</button>
      </section>

      <section class="mt-4 flex items-center justify-between">
        <div>
          <span class="label">Quality</span>
          <p class="text-[11px] text-muted-foreground">Lower it if the frame rate dips</p>
        </div>
        <div class="seg">
          <button
            v-for="level in (['high', 'low'] as const)"
            :key="level"
            class="seg-item"
            :data-active="state.quality.value === level"
            @click="state.setQuality(level)"
          >{{ level }}</button>
        </div>
      </section>

      <div class="rule my-4" />

      <p class="text-[11px] leading-relaxed text-muted-foreground">
        Drag to orbit, scroll or pinch to zoom, tap a piece to select it. Everything you see is generated at
        runtime — no models, textures or audio files are loaded.
      </p>
    </div>
  </div>
</template>
