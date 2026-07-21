<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieSpeedSliderDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const container = ref<HTMLDivElement | null>(null)
const speed = ref(1)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: bounceData,
  })
})

// setSpeed is a live multiplier on the clip's own frame rate — 0.25× to 3× without
// re-authoring the animation.
watch(speed, (s) => anim?.setSpeed(s))

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Speed dial"
    blurb="setSpeed is a live frame-rate multiplier — drag from a quarter speed up to 3× without touching the clip."
    :tags="['lottie-web', 'setSpeed', 'slider']"
    :source="source"
    filename="LottieSpeedSliderDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[62%]" />
    </template>

    <template #controls>
      <input v-model.number="speed" type="range" min="0.25" max="3" step="0.05" class="h-2 min-w-0 flex-1 cursor-pointer accent-primary" />
      <span class="shrink-0 font-mono text-xs text-muted-foreground">{{ speed.toFixed(2) }}×</span>
    </template>
  </DemoCard>
</template>
