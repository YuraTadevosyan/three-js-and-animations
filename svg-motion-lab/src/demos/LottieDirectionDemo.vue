<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import spinnerData from '@/animations/spinner.json'
import source from './LottieDirectionDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const dir = ref<1 | -1>(1)
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

// setDirection(-1) plays the same clip backwards — the spinner reverses instantly with
// no separate reverse animation authored.
function set(d: 1 | -1) {
  dir.value = d
  anim?.setDirection(d)
  anim?.play()
}

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Direction"
    blurb="setDirection flips playback sign — the same spinner runs clockwise or counter-clockwise on demand."
    :tags="['lottie-web', 'setDirection', 'playback']"
    :source="source"
    filename="LottieDirectionDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[58%]" />
    </template>

    <template #controls>
      <CtrlButton :active="dir === 1" @click="set(1)">Forward</CtrlButton>
      <CtrlButton :active="dir === -1" @click="set(-1)">Reverse</CtrlButton>
    </template>
  </DemoCard>
</template>
