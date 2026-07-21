<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './PendulumDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function build() {
  const arm = stage.value?.querySelector<SVGGElement>('.arm')
  if (!arm) return
  anim?.revert()
  // anime as a ticker: we tween a plain angle and write the SVG rotate() ourselves,
  // pivoting the whole arm about the fixed hinge at (100,24). inOutSine + alternate is
  // exactly the ease-in/ease-out of a real pendulum at the top of each swing.
  const state = { a: -34 }
  anim = animate(state, {
    a: 34,
    duration: 1300,
    loop: true,
    alternate: true,
    ease: 'inOutSine',
    onUpdate: () => arm.setAttribute('transform', `rotate(${state.a.toFixed(2)} 100 24)`),
  })
}

function toggle() {
  if (!anim) return
  running.value = !running.value
  running.value ? anim.play() : anim.pause()
}

onMounted(build)
onBeforeUnmount(() => anim?.revert())
</script>

<template>
  <DemoCard
    title="Pendulum"
    blurb="A plain angle tween drives an SVG rotate() about a fixed hinge; inOutSine gives a natural swing."
    :tags="['anime.js', 'onUpdate', 'inOutSine']"
    :source="source"
    filename="PendulumDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[78%]">
        <circle cx="100" cy="24" r="5" fill="hsl(220 14% 45%)" />
        <g class="arm">
          <line x1="100" y1="24" x2="100" y2="150" stroke="hsl(220 16% 55%)" stroke-width="3" stroke-linecap="round" />
          <circle cx="100" cy="162" r="16" fill="hsl(265 90% 66%)" />
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
