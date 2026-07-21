<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieDragDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const container = ref<HTMLDivElement | null>(null)
const total = ref(60)
const dragging = ref(false)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    animationData: bounceData,
  })
  anim.addEventListener('DOMLoaded', () => {
    total.value = Math.round(anim!.totalFrames)
    anim!.goToAndStop(0, true)
  })
})

// Map the pointer's x within the stage straight onto the timeline: dragging left↔right
// scrubs the animation frame-by-frame, no slider widget needed.
function scrub(e: PointerEvent) {
  if (!dragging.value || !container.value || !anim) return
  const rect = container.value.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  anim.goToAndStop(ratio * total.value, true)
}

function start(e: PointerEvent) {
  dragging.value = true
  ;(e.target as Element).setPointerCapture?.(e.pointerId)
  scrub(e)
}
function end() {
  dragging.value = false
}

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Drag to scrub"
    blurb="The pointer's x-position maps straight to goToAndStop — drag across the stage to scrub the timeline."
    :tags="['lottie-web', 'goToAndStop', 'pointer']"
    :source="source"
    filename="LottieDragDemo.vue"
  >
    <template #stage>
      <div
        ref="container"
        class="h-full w-full max-w-[62%] cursor-ew-resize touch-none select-none"
        @pointerdown="start"
        @pointermove="scrub"
        @pointerup="end"
        @pointerleave="end"
      />
    </template>

    <template #controls>
      <span class="font-mono text-xs text-muted-foreground">drag the animation ↔</span>
    </template>
  </DemoCard>
</template>
