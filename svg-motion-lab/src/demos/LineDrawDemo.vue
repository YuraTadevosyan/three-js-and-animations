<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { animate, stagger, svg, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const stage = ref<SVGSVGElement | null>(null)
let anim: JSAnimation | null = null

function play() {
  if (!stage.value) return
  anim?.pause()
  const lines = Array.from(stage.value.querySelectorAll<SVGGeometryElement>('.draw-line'))
  const drawables = svg.createDrawable(lines)
  anim = animate(drawables, {
    draw: ['0 0', '0 1'],
    duration: 1500,
    delay: stagger(160),
    ease: 'inOutQuad',
  })
}

onMounted(play)
onBeforeUnmount(() => anim?.pause())
</script>

<template>
  <DemoCard
    title="Line drawing"
    blurb="Self-drawing strokes via stroke-dash interpolation, staggered per path."
    :tags="['anime.js', 'svg.createDrawable', 'stagger']"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 240 160" class="h-full w-full">
        <defs>
          <linearGradient id="ld-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(265 90% 70%)" />
            <stop offset="1" stop-color="hsl(175 84% 55%)" />
          </linearGradient>
        </defs>
        <g
          fill="none"
          stroke="url(#ld-grad)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path class="draw-line" d="M28 118 C 58 28 118 28 130 92 S 198 150 212 56" />
          <path class="draw-line" d="M40 140 L 196 140" />
          <path class="draw-line" d="M150 44 L 182 44" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
