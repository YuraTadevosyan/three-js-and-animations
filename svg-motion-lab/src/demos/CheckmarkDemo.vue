<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createTimeline, svg, type Timeline } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const stage = ref<SVGSVGElement | null>(null)
let tl: Timeline | null = null

function play() {
  if (!stage.value) return
  tl?.pause()
  const ring = svg.createDrawable(
    Array.from(stage.value.querySelectorAll<SVGGeometryElement>('.ring')),
  )
  const check = svg.createDrawable(
    Array.from(stage.value.querySelectorAll<SVGGeometryElement>('.check')),
  )
  tl = createTimeline()
    .add(ring, { draw: ['0 0', '0 1'], duration: 600, ease: 'inOutSine' })
    .add(check, { draw: ['0 0', '0 1'], duration: 420, ease: 'outQuad' }, '-=120')
}

onMounted(play)
onBeforeUnmount(() => tl?.pause())
</script>

<template>
  <DemoCard
    title="Success check"
    blurb="A timeline draws the ring, then the checkmark — the classic confirmation beat."
    :tags="['anime.js', 'createTimeline', 'createDrawable']"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full">
        <circle
          class="ring"
          cx="100"
          cy="100"
          r="64"
          fill="none"
          stroke="hsl(175 84% 55%)"
          stroke-width="8"
          stroke-linecap="round"
        />
        <path
          class="check"
          d="M70 102 L92 124 L134 78"
          fill="none"
          stroke="hsl(265 90% 70%)"
          stroke-width="9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
