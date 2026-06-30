<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
let anim: AnimationItem | null = null

const playing = ref(true)
const speed = ref(1)
const speeds = [0.5, 1, 2]

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: orbitData,
  })
})

function toggle() {
  if (!anim) return
  playing.value = !playing.value
  playing.value ? anim.play() : anim.pause()
}

function setSpeed(value: number) {
  speed.value = value
  anim?.setSpeed(value)
}

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Lottie playback"
    blurb="A designer-authored After Effects animation rendered to live SVG with runtime controls."
    :tags="['lottie-web', 'animationData', 'svg renderer']"
    :source="source"
    filename="LottieDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[78%]" />
    </template>

    <template #controls>
      <CtrlButton :active="playing" @click="toggle">
        {{ playing ? 'Pause' : 'Play' }}
      </CtrlButton>
      <span class="mx-1 text-xs text-muted-foreground">speed</span>
      <CtrlButton
        v-for="s in speeds"
        :key="s"
        :active="speed === s"
        @click="setSpeed(s)"
      >
        {{ s }}×
      </CtrlButton>
    </template>
  </DemoCard>
</template>
