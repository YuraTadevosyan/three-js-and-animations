<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createTimeline, svg, type Timeline } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './CountUpDemo.vue?raw'

const TARGET = 87

const stage = ref<SVGSVGElement | null>(null)
let tl: Timeline | null = null

function play() {
  if (!stage.value) return
  tl?.pause()
  const label = stage.value.querySelector<SVGTextElement>('.count')
  const arc = svg.createDrawable(
    Array.from(stage.value.querySelectorAll<SVGGeometryElement>('.arc')),
  )
  const counter = { v: 0 }

  tl = createTimeline()
    .add(
      counter,
      {
        v: TARGET,
        duration: 1600,
        ease: 'out(3)',
        onUpdate: () => {
          if (label) label.textContent = `${Math.round(counter.v)}%`
        },
      },
      0,
    )
    .add(arc, { draw: ['0 0', `0 ${TARGET / 100}`], duration: 1600, ease: 'out(3)' }, 0)
}

onMounted(play)
onBeforeUnmount(() => tl?.pause())
</script>

<template>
  <DemoCard
    title="Count up"
    blurb="A scalar tween drives the label via onUpdate while a drawable arc fills to match."
    :tags="['anime.js', 'onUpdate', 'createDrawable']"
    :source="source"
    filename="CountUpDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full">
        <circle cx="100" cy="100" r="78" fill="none" stroke="hsl(230 18% 18%)" stroke-width="12" />
        <circle
          class="arc"
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="hsl(265 90% 66%)"
          stroke-width="12"
          stroke-linecap="round"
          transform="rotate(-90 100 100)"
        />
        <text
          class="count"
          x="100"
          y="100"
          text-anchor="middle"
          dominant-baseline="central"
          fill="hsl(220 20% 96%)"
          font-size="46"
          font-weight="700"
          font-family="Inter, system-ui, sans-serif"
        >
          0%
        </text>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
