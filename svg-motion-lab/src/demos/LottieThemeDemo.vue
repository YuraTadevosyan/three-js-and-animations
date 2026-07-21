<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieThemeDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

// Normalised RGBA fills to recolour the ball with.
const themes = [
  { name: 'violet', rgba: [0.608, 0.424, 1, 1] },
  { name: 'cyan', rgba: [0.239, 0.694, 0.949, 1] },
  { name: 'amber', rgba: [0.98, 0.7, 0.25, 1] },
]

const stage = ref<HTMLDivElement | null>(null)
let anims: AnimationItem[] = []

onMounted(() => {
  const slots = stage.value?.querySelectorAll<HTMLDivElement>('.player')
  if (!slots?.length) return
  // Same source clip, retinted at load time: deep-clone the JSON and overwrite the
  // ball's fill colour array before handing each copy to its own player.
  anims = Array.from(slots).map((el, i) => {
    const data = JSON.parse(JSON.stringify(bounceData))
    data.layers[0].shapes[0].it[1].c.k = themes[i].rgba
    return lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: data,
    })
  })
})

onBeforeUnmount(() => anims.forEach((a) => a.destroy()))
</script>

<template>
  <DemoCard
    title="Retint at runtime"
    blurb="One clip, three palettes — deep-clone the animationData and rewrite the fill colour array before loading."
    :tags="['lottie-web', 'animationData', 'theming']"
    :source="source"
    filename="LottieThemeDemo.vue"
  >
    <template #stage>
      <div ref="stage" class="flex h-full w-full items-center justify-around gap-2">
        <div v-for="t in themes" :key="t.name" class="flex flex-col items-center gap-1">
          <div class="player h-24 w-24" />
          <span class="font-mono text-xs text-muted-foreground">{{ t.name }}</span>
        </div>
      </div>
    </template>
  </DemoCard>
</template>
