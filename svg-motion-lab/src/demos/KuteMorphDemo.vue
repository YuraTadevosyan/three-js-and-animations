<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteMorphDemo.vue?raw'

// Both shapes are authored as 4 cubic segments with the same winding and matching
// anchor points, so KUTE morphs them one-to-one — no segment splitting, no rotation
// guessing, just a clean circle ⇄ square interpolation.
const CIRCLE =
  'M168 100 C 168 137.56 137.56 168 100 168 C 62.44 168 32 137.56 32 100 C 32 62.44 62.44 32 100 32 C 137.56 32 168 62.44 168 100 Z'
const SQUARE =
  'M168 100 C 168 168 168 168 100 168 C 32 168 32 168 32 100 C 32 32 32 32 100 32 C 168 32 168 32 168 100 Z'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const path = stage.value?.querySelector<SVGPathElement>('.morph')
  if (!path) return
  tween?.stop()
  path.setAttribute('d', CIRCLE)
  // `path` is the cubic-morph property; yoyo replays the interpolation in reverse
  // so circle → square → circle loops seamlessly.
  tween = KUTE.fromTo(
    path,
    { path: CIRCLE },
    { path: SQUARE },
    { duration: 1500, repeat: 999, yoyo: true, easing: 'easingCubicInOut' },
  )
  running.value ? tween.start() : null
}

function toggle() {
  if (!tween) return
  running.value = !running.value
  running.value ? tween.resume() : tween.pause()
}

onMounted(build)
onBeforeUnmount(() => tween?.stop())
</script>

<template>
  <DemoCard
    title="Path morph"
    blurb="KUTE's cubic-morph plugin interpolates one path outline into another — here a clean circle ⇄ square."
    :tags="['KUTE.js', 'path', 'morph']"
    :source="source"
    filename="KuteMorphDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[68%]">
        <defs>
          <linearGradient id="kute-morph-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(265 90% 66%)" />
            <stop offset="1" stop-color="hsl(200 90% 60%)" />
          </linearGradient>
        </defs>
        <path class="morph" :d="CIRCLE" fill="url(#kute-morph-grad)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
