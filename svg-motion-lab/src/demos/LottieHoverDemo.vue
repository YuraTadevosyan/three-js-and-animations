<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieHoverDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const container = ref<HTMLDivElement | null>(null)
const hovering = ref(false)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    animationData: orbitData,
  })
})

function enter() {
  hovering.value = true
  anim?.setDirection(1)
  anim?.play()
}
function leave() {
  hovering.value = false
  anim?.setDirection(-1)
  anim?.play()
}

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Hover to play"
    blurb="Pointer-driven playback — hovering runs it forward, leaving reverses it via setDirection."
    :tags="['lottie-web', 'setDirection', 'interactive']"
    :source="source"
    filename="LottieHoverDemo.vue"
  >
    <template #stage>
      <div
        ref="container"
        class="h-full w-full max-w-[70%]"
        @mouseenter="enter"
        @mouseleave="leave"
      />
      <div
        class="pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-xs text-muted-foreground"
      >
        {{ hovering ? '▶ forward' : 'hover the animation' }}
      </div>
    </template>

    <template #controls>
      <span class="text-xs text-muted-foreground">Move your pointer over the animation.</span>
    </template>
  </DemoCard>
</template>
