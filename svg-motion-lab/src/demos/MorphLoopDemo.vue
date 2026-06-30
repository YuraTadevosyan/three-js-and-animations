<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createTimeline, svg, type Timeline } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import demoSource from './MorphLoopDemo.vue?raw'

// All same tag (<path>) so morphTo can interpolate `d` between them.
const shapes = [
  'M100 28 C 140 28 172 60 172 100 C 172 140 140 172 100 172 C 60 172 28 140 28 100 C 28 60 60 28 100 28 Z',
  'M40 40 H160 V160 H40 Z',
  'M100 26 L170 150 L30 150 Z',
  'M100 28 L120 78 L172 78 L130 110 L146 162 L100 132 L54 162 L70 110 L28 78 L80 78 Z',
]

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tl: Timeline | null = null

function build() {
  if (!stage.value) return
  const source = stage.value.querySelector<SVGPathElement>('.source')
  const targets = Array.from(stage.value.querySelectorAll<SVGPathElement>('.target'))
  if (!source || targets.length === 0) return

  tl = createTimeline({ loop: true })
  targets.forEach((target) => {
    tl!.add(source, { d: svg.morphTo(target), duration: 700, ease: 'inOut(3)' }, '+=500')
  })
}

function toggle() {
  if (!tl) return
  running.value = !running.value
  running.value ? tl.play() : tl.pause()
}

onMounted(build)
onBeforeUnmount(() => tl?.pause())
</script>

<template>
  <DemoCard
    title="Morph loop"
    blurb="A timeline chains morphTo across four shapes and loops forever — hands-free shape-shifting."
    :tags="['anime.js', 'timeline', 'morphTo']"
    :source="demoSource"
    filename="MorphLoopDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full">
        <defs>
          <linearGradient id="ml-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(265 90% 66%)" />
            <stop offset="1" stop-color="hsl(175 84% 55%)" />
          </linearGradient>
        </defs>
        <path
          v-for="(d, i) in shapes"
          :key="i"
          class="target"
          :d="d"
          style="display: none"
        />
        <path class="source" :d="shapes[0]" fill="url(#ml-grad)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
