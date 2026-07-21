<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem, AnimationSegment } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieSegLoopDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const segments: { label: string; range: AnimationSegment }[] = [
  { label: 'Drop', range: [0, 30] },
  { label: 'Rise', range: [30, 60] },
  { label: 'Full', range: [0, 60] },
]

const container = ref<HTMLDivElement | null>(null)
const active = ref('Full')
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

// Unlike a one-shot playSegments, keeping loop:true makes the chosen frame range
// repeat forever — so "Drop" endlessly re-drops rather than playing once.
function pick(seg: { label: string; range: AnimationSegment }) {
  active.value = seg.label
  anim?.playSegments(seg.range, true)
}

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Segment loop"
    blurb="With loop:true, playSegments repeats just the chosen frame range forever — pick which slice cycles."
    :tags="['lottie-web', 'playSegments', 'loop']"
    :source="source"
    filename="LottieSegLoopDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[62%]" />
    </template>

    <template #controls>
      <CtrlButton v-for="seg in segments" :key="seg.label" :active="active === seg.label" @click="pick(seg)">
        {{ seg.label }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
