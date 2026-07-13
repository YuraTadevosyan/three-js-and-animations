<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteWaveDemo.vue?raw'

const HUES = ['#9b6cff', '#8f7bff', '#7d89ff', '#6b96ff', '#5aa3fa', '#4fb0f0', '#48bce4', '#45c7d6', '#47d1c6']
const dots = HUES.map((fill, i) => ({ cx: 28 + i * 31, fill }))

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const circles = stage.value?.querySelectorAll<SVGCircleElement>('.dot')
  if (!circles?.length) return
  tween?.stop()
  // allFromTo builds one tween per element. TweenCollection accumulates `offset` into
  // each successive element's delay, which is how you stagger in KUTE — the dots
  // lift in sequence and yoyo back, so the wave keeps rolling.
  tween = KUTE.allFromTo(
    circles,
    { attr: { cy: 112 } },
    { attr: { cy: 48 } },
    {
      duration: 700,
      offset: 90,
      repeat: 999,
      yoyo: true,
      easing: 'easingCubicInOut',
    },
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
    title="Collection stagger"
    blurb="One allFromTo call animates every dot; KUTE's offset option cascades the delay into a rolling wave."
    :tags="['KUTE.js', 'allFromTo', 'offset']"
    :source="source"
    filename="KuteWaveDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 300 160" class="h-full w-full">
        <circle
          v-for="(d, i) in dots"
          :key="i"
          class="dot"
          :cx="d.cx"
          cy="112"
          r="10"
          :fill="d.fill"
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
