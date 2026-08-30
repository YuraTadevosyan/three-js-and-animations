<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ColourPanel from '~/components/ColourPanel.vue'
import { useChessWorld } from '~/composables/useChessWorld'

const state = useChessWorld()
const emit = defineEmits<{ close: [] }>()

// Diagnostics are live only while this panel is open.
const showDiagnostics = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  state.refreshStats()
  timer = setInterval(() => state.refreshStats(), 500)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const CAMERAS = [
  { key: 'follow', name: 'Follow', hint: 'Swings to each move, then settles back' },
  { key: 'cinema', name: 'Cinema', hint: 'Follow, plus a slow drift between moves' },
  { key: 'orbit', name: 'Manual', hint: 'The camera only moves when you drag it' },
] as const
</script>

<template>
  <div class="absolute inset-0 z-40 bg-background/60 backdrop-blur-sm" @click.self="emit('close')">
    <div
      class="glass animate-panel-in absolute right-3 top-16 flex max-h-[calc(100vh-5.5rem)] w-[min(20rem,92vw)]
        flex-col overflow-y-auto p-4 sm:right-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold">Settings</h2>
        <button class="btn btn-ghost btn-icon" aria-label="Close" @click="emit('close')">✕</button>
      </div>

      <div class="mt-4">
        <ColourPanel />
      </div>

      <div class="rule my-4" />

      <section class="flex flex-col gap-2">
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

      <section class="mt-4 flex items-center justify-between">
        <div>
          <span class="label">Post-processing</span>
          <p class="text-[11px] text-muted-foreground">Bloom, vignette and grading — added only once the scene is confirmed drawing</p>
        </div>
        <button
          class="btn text-xs"
          :class="state.postProcessing.value ? 'btn-primary' : ''"
          @click="state.setPostProcessing(!state.postProcessing.value)"
        >{{ state.postProcessing.value ? 'On' : 'Off' }}</button>
      </section>

      <div class="rule my-4" />

      <p class="text-[11px] leading-relaxed text-muted-foreground">
        Drag a piece to move it, or click it and click a highlighted square. Drag the board to orbit, scroll
        or pinch to zoom. Everything you see is generated at runtime — no models, textures or audio files
        are loaded.
      </p>

      <button
        class="mt-3 flex w-full items-center justify-between text-left"
        @click="showDiagnostics = !showDiagnostics"
      >
        <span class="label">Diagnostics</span>
        <span class="text-muted-foreground">{{ showDiagnostics ? '▲' : '▼' }}</span>
      </button>

      <div v-if="showDiagnostics" class="mt-2 rounded-md border border-border/60 bg-muted/20 p-3">
        <dl class="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
          <dt class="text-muted-foreground">frames per second</dt>
          <dd :class="(state.stats.value?.fps ?? 0) < 5 ? 'text-danger' : ''">{{ state.stats.value?.fps ?? '—' }}</dd>
          <dt class="text-muted-foreground">update ticks</dt>
          <dd>{{ state.stats.value?.frames ?? '—' }}</dd>
          <dt class="text-muted-foreground">frames rendered</dt>
          <dd :class="(state.stats.value?.renders ?? 0) === 0 ? 'text-danger' : ''">
            {{ state.stats.value?.renders ?? '—' }}
          </dd>
          <dt class="text-muted-foreground">live particles</dt>
          <dd>{{ state.stats.value?.particles ?? '—' }}</dd>
          <dt class="text-muted-foreground">effects</dt>
          <dd>{{ state.stats.value?.effectsEnabled === false ? 'disabled' : 'on' }}</dd>
          <dt class="text-muted-foreground">post-processing</dt>
          <dd :class="state.stats.value?.postProcessing === 'unavailable' ? 'text-warn' : ''">
            {{ state.stats.value?.postProcessing ?? '—' }}
          </dd>
        </dl>
        <dl class="mt-1 font-mono text-[11px]">
          <dt class="text-muted-foreground">canvas</dt>
          <dd>{{ state.stats.value?.canvas ?? '—' }}</dd>
        </dl>

        <p v-if="state.frameError.value" class="mt-2 break-words font-mono text-[11px] text-danger">
          {{ state.frameError.value }}
        </p>
        <p v-else-if="(state.stats.value?.frames ?? 0) === 0" class="mt-2 text-[11px] text-warn">
          The update loop is not running at all.
        </p>
        <p v-else-if="(state.stats.value?.renders ?? 0) === 0" class="mt-2 text-[11px] text-warn">
          Updating but never rendering — the scene is not reaching the screen.
        </p>
        <p v-else class="mt-2 text-[11px] text-muted-foreground">
          No frame errors.
        </p>
      </div>
    </div>
  </div>
</template>
