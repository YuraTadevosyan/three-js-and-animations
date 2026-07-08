<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './EasingLabDemo.vue?raw'

const easings = ['linear', 'inOutQuad', 'outExpo', 'outBack', 'outElastic', 'outBounce']
const X0 = 104
const X1 = 288
const ROW = 24
const Y0 = 20

const stage = ref<SVGSVGElement | null>(null)
let anims: JSAnimation[] = []

function play() {
  if (!stage.value) return
  anims.forEach((a) => a.revert())
  const markers = Array.from(stage.value.querySelectorAll<SVGCircleElement>('.marker'))
  anims = markers.map((m, i) =>
    animate(m, {
      cx: [X0, X1],
      duration: 1500,
      loop: true,
      alternate: true,
      ease: easings[i],
    }),
  )
}

onMounted(play)
onBeforeUnmount(() => anims.forEach((a) => a.revert()))
</script>

<template>
  <DemoCard
    title="Easing lab"
    blurb="The same tween under six different easings, side by side — watch how each curve accelerates."
    :tags="['anime.js', 'easings', 'compare']"
    :source="source"
    filename="EasingLabDemo.vue"
  >
    <template #stage>
      <svg ref="stage" :viewBox="`0 0 300 ${Y0 * 2 + (easings.length - 1) * ROW}`" class="h-full w-full">
        <g v-for="(e, i) in easings" :key="e">
          <text
            x="8"
            :y="Y0 + i * ROW + 3.5"
            fill="hsl(220 12% 58%)"
            font-size="10"
            font-family="'JetBrains Mono', monospace"
          >
            {{ e }}
          </text>
          <line
            :x1="X0" :y1="Y0 + i * ROW" :x2="X1" :y2="Y0 + i * ROW"
            stroke="hsl(230 18% 20%)" stroke-width="2" stroke-linecap="round"
          />
          <circle class="marker" :cx="X0" :cy="Y0 + i * ROW" r="5" fill="hsl(265 90% 68%)" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
