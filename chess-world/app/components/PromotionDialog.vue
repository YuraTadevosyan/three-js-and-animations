<script setup lang="ts">
import PieceGlyph from '~/components/PieceGlyph.vue'
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()
const CHOICES = [5, 4, 3, 2] as const
const NAMES: Record<number, string> = { 5: 'Queen', 4: 'Rook', 3: 'Bishop', 2: 'Knight' }
</script>

<template>
  <div
    class="absolute inset-0 z-40 grid place-items-center bg-background/70 backdrop-blur-sm"
    @click.self="state.cancelPromotion()"
  >
    <div class="glass animate-panel-in w-[min(22rem,90vw)] p-5">
      <h2 class="text-sm font-semibold">Promote the pawn</h2>
      <p class="mt-1 text-[11px] text-muted-foreground">It reaches the last rank — choose what it becomes.</p>
      <div class="mt-4 grid grid-cols-4 gap-2">
        <button
          v-for="type in CHOICES"
          :key="type"
          class="btn flex-col gap-1 py-3"
          @click="state.choosePromotion(type)"
        >
          <PieceGlyph :type="type" :side="state.turn.value === 0 ? 'white' : 'black'" class="text-2xl leading-none" />
          <span class="text-[10px] uppercase tracking-wider text-muted-foreground">{{ NAMES[type] }}</span>
        </button>
      </div>
      <button class="btn btn-ghost mt-3 w-full text-xs" @click="state.cancelPromotion()">Cancel</button>
    </div>
  </div>
</template>
