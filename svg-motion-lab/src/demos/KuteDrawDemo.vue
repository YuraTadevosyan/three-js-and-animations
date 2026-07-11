<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteDrawDemo.vue?raw'

const INFINITY =
  'M60 80 C 60 36, 112 36, 150 80 C 188 124, 240 124, 240 80 C 240 36, 188 36, 150 80 C 112 124, 60 124, 60 80'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const path = stage.value?.querySelector<SVGPathElement>('.draw')
  if (!path) return
  tween?.stop()
  // The `draw` plugin animates stroke-dashoffset over the path's measured length;
  // values are given as a start/end percentage pair. yoyo un-draws on the way back.
  tween = KUTE.fromTo(
    path,
    { draw: '0% 0%' },
    { draw: '0% 100%' },
    { duration: 2000, repeat: 999, yoyo: true, easing: 'easingCubicInOut' },
  )
  running.value ? tween.start() : null
}

function replay() {
  running.value = true
  build()
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
    title="Stroke draw"
    blurb="KUTE's draw plugin measures the path and animates stroke-dashoffset to self-draw the stroke."
    :tags="['KUTE.js', 'draw', 'stroke']"
    :source="source"
    filename="KuteDrawDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 300 160" class="h-full w-full">
        <defs>
          <linearGradient id="kute-draw-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="hsl(265 90% 68%)" />
            <stop offset="1" stop-color="hsl(200 90% 60%)" />
          </linearGradient>
        </defs>
        <path
          class="draw"
          :d="INFINITY"
          fill="none"
          stroke="url(#kute-draw-grad)"
          stroke-width="6"
          stroke-linecap="round"
        />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
      <CtrlButton @click="replay">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
