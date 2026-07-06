<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieScrubDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const container = ref<HTMLDivElement | null>(null)
const frame = ref(0)
const total = ref(60)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    animationData: bounceData,
  })
  anim.addEventListener('DOMLoaded', () => {
    total.value = Math.round(anim!.totalFrames)
    anim!.goToAndStop(0, true)
  })
})

watch(frame, (f) => anim?.goToAndStop(f, true))

onBeforeUnmount(() => anim?.destroy())
</script>

<template>
  <DemoCard
    title="Lottie scrubber"
    blurb="Drive playback by frame — the slider maps straight to goToAndStop for scrub control."
    :tags="['lottie-web', 'goToAndStop', 'scrub']"
    :source="source"
    filename="LottieScrubDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[70%]" />
    </template>

    <template #controls>
      <input
        v-model.number="frame"
        type="range"
        min="0"
        :max="total"
        class="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
      />
      <span class="shrink-0 font-mono text-xs text-muted-foreground">
        {{ frame }} / {{ total }}
      </span>
    </template>
  </DemoCard>
</template>
