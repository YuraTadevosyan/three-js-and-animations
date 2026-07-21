<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteEasingDemo.vue?raw'

// KUTE's extra build ships CubicBezier easings — no elastic/bounce, but a full set of
// in/out curves. Same travel under six of them, side by side.
const easings = [
  'linear',
  'easingCubicInOut',
  'easingQuarticOut',
  'easingExponentialOut',
  'easingCircularInOut',
  'easingBackInOut',
]
const X0 = 96
const X1 = 288
const ROW = 24
const Y0 = 18

const stage = ref<SVGSVGElement | null>(null)
let tweens: KuteTween[] = []

function play() {
  const markers = Array.from(stage.value?.querySelectorAll<SVGCircleElement>('.marker') ?? [])
  if (!markers.length) return
  tweens.forEach((t) => t.stop())
  tweens = markers.map((m, i) =>
    KUTE.fromTo(
      m,
      { attr: { cx: X0 } },
      { attr: { cx: X1 } },
      { duration: 1400, repeat: 999, yoyo: true, easing: easings[i] },
    ).start(),
  )
}

onMounted(play)
onBeforeUnmount(() => tweens.forEach((t) => t.stop()))
</script>

<template>
  <DemoCard
    title="Easing lab"
    blurb="KUTE's CubicBezier easing set — the same tween under six curves, so you can compare how each moves."
    :tags="['KUTE.js', 'easing', 'attr']"
    :source="source"
    filename="KuteEasingDemo.vue"
  >
    <template #stage>
      <svg ref="stage" :viewBox="`0 0 300 ${Y0 * 2 + (easings.length - 1) * ROW}`" class="h-full w-full">
        <g v-for="(e, i) in easings" :key="e">
          <text x="8" :y="Y0 + i * ROW + 3.5" fill="hsl(220 12% 58%)" font-size="9" font-family="'JetBrains Mono', monospace">
            {{ e.replace('easing', '') }}
          </text>
          <line :x1="X0" :y1="Y0 + i * ROW" :x2="X1" :y2="Y0 + i * ROW" stroke="hsl(230 18% 20%)" stroke-width="2" stroke-linecap="round" />
          <circle class="marker" :cx="X0" :cy="Y0 + i * ROW" r="5" fill="hsl(200 90% 62%)" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
