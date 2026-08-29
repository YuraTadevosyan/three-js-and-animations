<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useChessWorld } from '~/composables/useChessWorld'

const { attach, detach, ready, worldError } = useChessWorld()
const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (canvas.value) attach(canvas.value)
})

onBeforeUnmount(() => detach())
</script>

<template>
  <div class="absolute inset-0">
    <canvas ref="canvas" class="h-full w-full" aria-label="Interactive 3D chess board" />

    <Transition
      enter-active-class="transition-opacity duration-700"
      leave-active-class="transition-opacity duration-700"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="!ready" class="pointer-events-none absolute inset-0 grid place-items-center bg-background">
        <div class="flex flex-col items-center gap-4">
          <div class="relative h-14 w-14">
            <span class="absolute inset-0 rounded-full border border-light/40 animate-pulse-ring" />
            <span class="absolute inset-2 rounded-full border border-dark/40 animate-pulse-ring" style="animation-delay: .4s" />
          </div>
          <p class="label">Building the arena</p>
        </div>
      </div>
    </Transition>

    <!-- A dead canvas is otherwise indistinguishable from a very dark scene. -->
    <div v-if="worldError" class="absolute inset-0 grid place-items-center bg-background/90 p-6">
      <div class="glass max-w-md p-5">
        <p class="text-sm font-semibold text-danger">The 3D arena could not start</p>
        <p class="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          This needs WebGL 2. If your browser has hardware acceleration disabled, or the tab has lost its
          graphics context, the board cannot render.
        </p>
        <p class="mt-3 break-words font-mono text-[11px] text-warn">{{ worldError }}</p>
      </div>
    </div>
  </div>
</template>
