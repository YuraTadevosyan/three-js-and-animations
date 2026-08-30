<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChessWorld } from '~/composables/useChessWorld'
import type { PaletteValues } from '~/world/theme'

const state = useChessWorld()
const showCustom = ref(false)

const FIELDS: { key: keyof PaletteValues; label: string; hint: string }[] = [
  { key: 'lightArmy', label: 'First army', hint: 'Glow, sparks and rim light of the side that moves first' },
  { key: 'darkArmy', label: 'Second army', hint: 'The opposing side' },
  { key: 'lightSquare', label: 'Light squares', hint: '' },
  { key: 'darkSquare', label: 'Dark squares', hint: '' },
  { key: 'accent', label: 'Board glow', hint: 'Grid lines, rim and the light under the board' },
  { key: 'background', label: 'Background', hint: '' },
]

const values = computed(() => state.paletteValues.value)

function onColour(key: keyof PaletteValues, event: Event): void {
  state.setPaletteColor(key, (event.target as HTMLInputElement).value)
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="label">Colours</span>
      <button
        v-if="state.paletteId.value !== state.palettes[0]!.id"
        class="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        @click="state.resetPalette()"
      >Reset</button>
    </div>

    <div class="grid grid-cols-2 gap-1.5">
      <button
        v-for="preset in state.palettes"
        :key="preset.id"
        class="rounded-md border px-2 py-1.5 text-left transition-colors"
        :class="
          state.paletteId.value === preset.id
            ? 'border-light/60 bg-light/10'
            : 'border-border/60 bg-muted/20 hover:border-light/40'
        "
        @click="state.setPalette(preset.id)"
      >
        <span class="flex items-center gap-1.5">
          <span
            class="h-3.5 w-3.5 rounded-full"
            :style="{ background: preset.lightArmy, boxShadow: `0 0 8px ${preset.lightArmy}` }"
          />
          <span
            class="h-3.5 w-3.5 rounded-full"
            :style="{ background: preset.darkArmy, boxShadow: `0 0 8px ${preset.darkArmy}` }"
          />
          <span class="ml-auto flex h-3.5 w-7 overflow-hidden rounded-sm border border-white/10">
            <span class="h-full w-1/2" :style="{ background: preset.lightSquare }" />
            <span class="h-full w-1/2" :style="{ background: preset.darkSquare }" />
          </span>
        </span>
        <span class="mt-1 block text-[11px] font-medium">{{ preset.name }}</span>
      </button>
    </div>

    <button
      class="mt-1 flex items-center justify-between text-left"
      :aria-expanded="showCustom"
      @click="showCustom = !showCustom"
    >
      <span class="label">
        Custom<span v-if="state.paletteId.value === 'custom'" class="ml-1.5 text-light">• in use</span>
      </span>
      <span class="text-muted-foreground">{{ showCustom ? '▲' : '▼' }}</span>
    </button>

    <div v-if="showCustom" class="flex flex-col gap-1.5 rounded-md border border-border/60 bg-muted/20 p-2.5">
      <label
        v-for="field in FIELDS"
        :key="field.key"
        class="flex items-center gap-2.5"
        :title="field.hint"
      >
        <input
          type="color"
          class="h-7 w-7 shrink-0 cursor-pointer rounded border border-border/70 bg-transparent p-0"
          :value="values[field.key]"
          :aria-label="field.label"
          @input="onColour(field.key, $event)"
        >
        <span class="min-w-0 flex-1 truncate text-xs">{{ field.label }}</span>
        <span class="font-mono text-[10px] uppercase text-muted-foreground">{{ values[field.key] }}</span>
      </label>
      <p class="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
        Piece bodies, sparks, fog and the board frame are all derived from these six, so the arena stays
        coherent whatever you pick.
      </p>
    </div>
  </section>
</template>
