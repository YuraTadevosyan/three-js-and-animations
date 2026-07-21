<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import spinnerData from '@/animations/spinner.json'
import source from './LottieSubframeDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const smooth = ref(true)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: spinnerData,
  })
})

// setSubframe(true) lets the renderer interpolate between integer frames for buttery
// motion; false snaps to whole frames, so a slow spin visibly steps.
function toggle() {
  smooth.value = !smooth.value
  anim?.setSubframe(smooth.value)
}

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Subframe smoothing"
    blurb="setSubframe interpolates between integer frames; turn it off and the spin snaps frame-to-frame."
    :tags="['lottie-web', 'setSubframe', 'render']"
    :source="source"
    filename="LottieSubframeDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[58%]" />
    </template>

    <template #controls>
      <CtrlButton :active="smooth" @click="toggle">
        {{ smooth ? 'Subframe: on' : 'Subframe: off' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
