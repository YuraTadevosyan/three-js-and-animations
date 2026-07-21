<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import pulseData from '@/animations/pulse.json'
import source from './LottieReplayDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const done = ref(false)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    animationData: pulseData,
  })
  // With loop:false the `complete` event marks the end of a one-shot; we surface a
  // Replay affordance instead of looping automatically.
  anim.addEventListener('complete', () => {
    done.value = true
  })
})

function replay() {
  done.value = false
  anim?.goToAndPlay(0, true)
}

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Play once"
    blurb="A one-shot clip: complete fires at the end, and goToAndPlay(0) restarts it on demand."
    :tags="['lottie-web', 'complete', 'goToAndPlay']"
    :source="source"
    filename="LottieReplayDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[62%]" />
    </template>

    <template #controls>
      <CtrlButton :active="!done" @click="replay">
        {{ done ? 'Replay' : 'Playing…' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
