<script setup lang="ts">
import { computed } from 'vue'
import PieceGlyph from '~/components/PieceGlyph.vue'
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()

/** Sorted heaviest first so the tray reads as a material summary. */
const order = (list: number[]) => [...list].sort((a, b) => b - a)
const whiteTaken = computed(() => order(state.captured.value.white))
const blackTaken = computed(() => order(state.captured.value.black))
const balance = computed(() => state.materialBalance.value)
</script>

<template>
  <div class="glass flex flex-col gap-2 px-3 py-2">
    <div class="flex items-center justify-between gap-4">
      <span class="label">Captured</span>
      <span
        v-if="balance !== 0"
        class="font-mono text-xs font-semibold"
        :class="balance > 0 ? 'text-light' : 'text-dark'"
      >{{ balance > 0 ? '+' : '' }}{{ balance }}</span>
    </div>

    <div class="flex items-center gap-2 text-lg leading-none">
      <span class="w-10 shrink-0 text-[10px] uppercase tracking-widest text-light/70">cyan</span>
      <div class="flex min-h-[1.25rem] flex-wrap gap-0.5">
        <PieceGlyph v-for="(type, index) in whiteTaken" :key="`w${index}`" :type="type" side="black" />
        <span v-if="!whiteTaken.length" class="text-xs text-muted-foreground">—</span>
      </div>
    </div>

    <div class="flex items-center gap-2 text-lg leading-none">
      <span class="w-10 shrink-0 text-[10px] uppercase tracking-widest text-dark/70">mag.</span>
      <div class="flex min-h-[1.25rem] flex-wrap gap-0.5">
        <PieceGlyph v-for="(type, index) in blackTaken" :key="`b${index}`" :type="type" side="white" />
        <span v-if="!blackTaken.length" class="text-xs text-muted-foreground">—</span>
      </div>
    </div>
  </div>
</template>
