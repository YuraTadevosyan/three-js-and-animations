<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieProgressDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const frame = ref(0)
const total = ref(60)
const running = ref(true)
let anim: AnimationItem | null = null

const pct = computed(() => (total.value ? (frame.value / total.value) * 100 : 0))

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: orbitData,
  })
  anim.addEventListener('DOMLoaded', () => {
    total.value = Math.round(anim!.totalFrames)
  })
  // enterFrame fires once per rendered frame — read currentFrame to drive a live
  // progress bar without ever scrubbing the animation ourselves.
  anim.addEventListener('enterFrame', () => {
    frame.value = Math.round(anim!.currentFrame)
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
    title="Frame readout"
    blurb="The enterFrame event fires each rendered frame; here it feeds a live progress bar and counter."
    :tags="['lottie-web', 'enterFrame', 'progress']"
    :source="source"
    filename="LottieProgressDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[64%]" />
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
      <div class="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/60">
        <div class="h-full rounded-full bg-gradient-to-r from-primary to-accent" :style="{ width: pct + '%' }" />
      </div>
      <span class="shrink-0 font-mono text-xs text-muted-foreground">{{ frame }} / {{ total }}</span>
    </template>
  </DemoCard>
</template>
