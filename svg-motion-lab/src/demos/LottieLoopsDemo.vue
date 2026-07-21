<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieLoopsDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const loops = ref(0)
const running = ref(true)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: orbitData,
  })
  // loopComplete fires once each time the playhead wraps — distinct from `complete`,
  // which only fires for non-looping clips.
  anim.addEventListener('loopComplete', () => {
    loops.value += 1
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
    title="Loop counter"
    blurb="The loopComplete event fires each time the playhead wraps — here it tallies completed cycles."
    :tags="['lottie-web', 'loopComplete', 'events']"
    :source="source"
    filename="LottieLoopsDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[62%]" />
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
      <span class="font-mono text-xs text-muted-foreground">loops: {{ loops }}</span>
    </template>
  </DemoCard>
</template>
