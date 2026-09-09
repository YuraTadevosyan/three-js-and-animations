<script setup lang="ts">
import { computed } from 'vue'
import { useChessWorld } from '~/composables/useChessWorld'
import { previewOutlines, type PieceSet } from '~/world/sets'

const state = useChessWorld()

/**
 * Each option previews its own knight and king, drawn from the very tables the
 * meshes are built from — so a preview cannot end up showing a set that is not
 * what lands on the board. Board units in, SVG units out: y is flipped and the
 * two pieces are pushed apart to either side of the origin.
 */
const KNIGHT = 2
const KING = 6
const VIEW = { width: 1.4, height: 1.16, top: 1.12, half: 0.7 }

function paths(set: PieceSet, type: number, offset: number): string[] {
  return previewOutlines(set, type).map(
    (outline) =>
      `M${outline
        .map(([x, y]) => `${(x + offset + VIEW.half).toFixed(3)} ${(VIEW.top - y).toFixed(3)}`)
        .join('L')}Z`,
  )
}

const previews = computed(() =>
  state.pieceSets.map((set) => ({
    set,
    first: paths(set, KNIGHT, -0.33),
    second: paths(set, KING, 0.34),
  })),
)

const colours = computed(() => ({
  first: state.paletteValues.value.lightArmy,
  second: state.paletteValues.value.darkArmy,
}))
</script>

<template>
  <section class="flex flex-col gap-2">
    <span class="label">Pieces</span>

    <div class="flex flex-col gap-1.5">
      <button
        v-for="preview in previews"
        :key="preview.set.id"
        class="flex items-center gap-3 rounded-md border px-2.5 py-2 text-left transition-colors"
        :class="
          state.pieceSetId.value === preview.set.id
            ? 'border-light/60 bg-light/10'
            : 'border-border/60 bg-muted/20 hover:border-light/40'
        "
        :aria-pressed="state.pieceSetId.value === preview.set.id"
        @click="state.setPieceSet(preview.set.id)"
      >
        <svg
          :viewBox="`0 0 ${VIEW.width} ${VIEW.height}`"
          class="h-12 w-[3.6rem] shrink-0 overflow-visible"
          aria-hidden="true"
        >
          <line
            :x1="0.06" :y1="VIEW.top" :x2="VIEW.width - 0.06" :y2="VIEW.top"
            stroke="currentColor" stroke-width="0.016" stroke-opacity="0.35"
          />
          <path v-for="(d, i) in preview.first" :key="`a${i}`" :d="d" :fill="colours.first" />
          <path v-for="(d, i) in preview.second" :key="`b${i}`" :d="d" :fill="colours.second" />
        </svg>

        <span class="min-w-0">
          <span class="block text-xs font-semibold">{{ preview.set.name }}</span>
          <span class="block text-[11px] leading-snug text-muted-foreground">{{ preview.set.hint }}</span>
        </span>
      </button>
    </div>
  </section>
</template>
