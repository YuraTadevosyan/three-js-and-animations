<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, createSpring, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './SpringDemo.vue?raw'

// Three springs, same travel, different physics — the duration is derived from the
// spring itself, so stiffer/less-damped settings overshoot and settle differently.
const springs = [
  { label: 'soft', cfg: { stiffness: 55, damping: 9 } },
  { label: 'snappy', cfg: { stiffness: 130, damping: 12 } },
  { label: 'bouncy', cfg: { stiffness: 180, damping: 6 } },
]
const X0 = 40
const X1 = 250
const ROW = 40
const Y0 = 34

const stage = ref<SVGSVGElement | null>(null)
let anims: JSAnimation[] = []

function play() {
  const markers = Array.from(stage.value?.querySelectorAll<SVGCircleElement>('.marker') ?? [])
  if (!markers.length) return
  anims.forEach((a) => a.revert())
  anims = markers.map((m, i) =>
    animate(m, { cx: [X0, X1], ease: createSpring(springs[i].cfg) }),
  )
}

onMounted(play)
onBeforeUnmount(() => anims.forEach((a) => a.revert()))
</script>

<template>
  <DemoCard
    title="Spring physics"
    blurb="createSpring drives each marker — same distance, three stiffness/damping profiles, three different settles."
    :tags="['anime.js', 'createSpring', 'physics']"
    :source="source"
    filename="SpringDemo.vue"
  >
    <template #stage>
      <svg ref="stage" :viewBox="`0 0 300 ${Y0 * 2 + (springs.length - 1) * ROW}`" class="h-full w-full">
        <g v-for="(s, i) in springs" :key="s.label">
          <text x="8" :y="Y0 + i * ROW - 10" fill="hsl(220 12% 58%)" font-size="10" font-family="'JetBrains Mono', monospace">
            {{ s.label }}
          </text>
          <line :x1="X0" :y1="Y0 + i * ROW" :x2="X1" :y2="Y0 + i * ROW" stroke="hsl(230 18% 20%)" stroke-width="2" stroke-linecap="round" />
          <circle class="marker" :cx="X0" :cy="Y0 + i * ROW" r="8" fill="hsl(265 90% 68%)" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
