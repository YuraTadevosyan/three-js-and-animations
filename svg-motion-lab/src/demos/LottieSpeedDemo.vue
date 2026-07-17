<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieSpeedDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const rates = [0.5, 1, 2]
const stage = ref<HTMLDivElement | null>(null)
let anims: AnimationItem[] = []

onMounted(() => {
  const slots = stage.value?.querySelectorAll<HTMLDivElement>('.player')
  if (!slots?.length) return
  // One clip, three independent players — setSpeed multiplies each one's frame rate,
  // so the same bounce runs at half, normal and double time side by side.
  anims = Array.from(slots).map((el, i) => {
    const anim = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: bounceData,
    })
    anim.setSpeed(rates[i])
    return anim
  })
})

onBeforeUnmount(() => anims.forEach((a) => a.destroy()))
</script>

<template>
  <DemoCard
    title="Speed compare"
    blurb="The same clip in three players — setSpeed runs them at 0.5×, 1× and 2× so the tempo difference is obvious."
    :tags="['lottie-web', 'setSpeed', 'multi-instance']"
    :source="source"
    filename="LottieSpeedDemo.vue"
  >
    <template #stage>
      <div ref="stage" class="flex h-full w-full items-center justify-around gap-2">
        <div v-for="r in rates" :key="r" class="flex flex-col items-center gap-1">
          <div class="player h-24 w-24" />
          <span class="font-mono text-xs text-muted-foreground">{{ r }}×</span>
        </div>
      </div>
    </template>
  </DemoCard>
</template>
