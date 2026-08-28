<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 1 = pawn … 6 = king. */
    type: number
    side?: 'white' | 'black'
  }>(),
  { side: 'white' },
)

const GLYPHS = ['', '♟', '♞', '♝', '♜', '♛', '♚']
const NAMES = ['', 'Pawn', 'Knight', 'Bishop', 'Rook', 'Queen', 'King']

const glyph = computed(() => GLYPHS[props.type] ?? '')
const name = computed(() => NAMES[props.type] ?? '')
</script>

<template>
  <span
    :class="side === 'white' ? 'text-light text-glow-light' : 'text-dark text-glow-dark'"
    :title="name"
    aria-hidden="true"
  >{{ glyph }}</span>
</template>
