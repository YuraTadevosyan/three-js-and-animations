<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import pulseData from '@/animations/pulse.json'
import source from './LottiePingPongDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const running = ref(true)
let anim: AnimationItem | null = null
let dir = 1

onMounted(() => {
  if (!container.value) return
  // loop:false is what makes `complete` fire. On each boundary we flip the play
  // direction and resume — turning a one-way clip into an endless ping-pong (the ring
  // expands, then contracts) with no yoyo baked into the JSON.
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    animationData: pulseData,
  })
  anim.addEventListener('complete', () => {
    if (!anim) return
    dir = -dir
    anim.setDirection(dir as 1 | -1)
    anim.play()
  })
})

function toggle() {
  if (!anim) return
  running.value = !running.value
  running.value ? anim.play() : anim.pause()
}

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Ping-pong loop"
    blurb="loop:false makes the complete event fire; flipping setDirection on each boundary yields an endless there-and-back."
    :tags="['lottie-web', 'complete', 'setDirection']"
    :source="source"
    filename="LottiePingPongDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[64%]" />
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
