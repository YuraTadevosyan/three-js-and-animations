<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KutePendulumDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const arm = stage.value?.querySelector<SVGGElement>('.arm')
  if (!arm) return
  tween?.stop()
  // svgTransform rotates the arm, but here transformOrigin pins the pivot to the top of
  // the bbox (50% 0%) instead of the centre — so it swings from the hinge like a real
  // pendulum. yoyo + easingCubicInOut eases in at each extreme.
  tween = KUTE.fromTo(
    arm,
    { svgTransform: { rotate: -36 } },
    { svgTransform: { rotate: 36 } },
    { duration: 1300, repeat: 999, yoyo: true, transformOrigin: '50% 0%', easing: 'easingCubicInOut' },
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
    title="Pendulum"
    blurb="svgTransform with a top-edge transformOrigin (50% 0%) swings the arm from its hinge, not its centre."
    :tags="['KUTE.js', 'svgTransform', 'origin']"
    :source="source"
    filename="KutePendulumDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[78%]">
        <circle cx="100" cy="26" r="5" fill="hsl(220 14% 45%)" />
        <g class="arm">
          <line x1="100" y1="26" x2="100" y2="150" stroke="hsl(220 16% 55%)" stroke-width="3" stroke-linecap="round" />
          <circle cx="100" cy="162" r="16" fill="hsl(200 90% 60%)" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
