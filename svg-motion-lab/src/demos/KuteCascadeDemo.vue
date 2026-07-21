<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteCascadeDemo.vue?raw'

const COLS = 6
const ROWS = 4
const cells = computed(() =>
  Array.from({ length: COLS * ROWS }, (_, i) => ({
    x: 16 + (i % COLS) * 34,
    y: 16 + Math.floor(i / COLS) * 34,
  })),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const rects = stage.value?.querySelectorAll<SVGRectElement>('.tile')
  if (!rects?.length) return
  tween?.stop()
  // allFromTo builds one tween per tile; the offset option pushes each successive tile's
  // start later, so opacity ripples across the grid in reading order, then yoyos back.
  tween = KUTE.allFromTo(
    rects,
    { attr: { opacity: 0.08 } },
    { attr: { opacity: 1 } },
    { duration: 420, offset: 45, repeat: 999, yoyo: true, easing: 'easingCubicInOut' },
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
    title="Fade cascade"
    blurb="One allFromTo call fades a grid of tiles; the offset option ripples the reveal across in reading order."
    :tags="['KUTE.js', 'allFromTo', 'offset']"
    :source="source"
    filename="KuteCascadeDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 220 150" class="h-full w-full">
        <rect
          v-for="(c, i) in cells"
          :key="i"
          class="tile"
          :x="c.x"
          :y="c.y"
          width="26"
          height="26"
          rx="6"
          fill="hsl(265 90% 66%)"
          opacity="0.08"
        />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
