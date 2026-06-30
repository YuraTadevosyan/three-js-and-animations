<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, stagger, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './PulseLoaderDemo.vue?raw'

const COUNT = 12
const R = 60

const dots = computed(() =>
  Array.from({ length: COUNT }, (_, i) => {
    const a = (i / COUNT) * Math.PI * 2 - Math.PI / 2
    return { cx: 100 + R * Math.cos(a), cy: 100 + R * Math.sin(a) }
  }),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function run() {
  if (!stage.value) return
  anim?.revert()
  const circles = Array.from(stage.value.querySelectorAll<SVGCircleElement>('.dot'))
  // Staggered loop (not alternating) → the highlight chases around the ring.
  anim = animate(circles, {
    r: [3, 7],
    opacity: [0.25, 1],
    delay: stagger(90),
    duration: 700,
    loop: true,
    ease: 'inOutSine',
  })
}

function toggle() {
  if (!anim) return
  running.value = !running.value
  running.value ? anim.play() : anim.pause()
}

onMounted(run)
onBeforeUnmount(() => anim?.revert())
</script>

<template>
  <DemoCard
    title="Pulse loader"
    blurb="One staggered loop sends a highlight chasing around a ring of dots — a pure-SVG spinner."
    :tags="['anime.js', 'stagger', 'loop']"
    :source="source"
    filename="PulseLoaderDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full">
        <circle
          v-for="(d, i) in dots"
          :key="i"
          class="dot"
          :cx="d.cx"
          :cy="d.cy"
          r="3"
          fill="hsl(265 90% 70%)"
          opacity="0.25"
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
