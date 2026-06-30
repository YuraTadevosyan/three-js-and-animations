<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, stagger, type JSAnimation, type Target } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './EqualizerDemo.vue?raw'

const BARS = 13
const BASE = 160 // baseline y
const W = 12
const GAP = 8

const bars = computed(() =>
  Array.from({ length: BARS }, (_, i) => ({
    x: 16 + i * (W + GAP) + W / 2,
    peak: 28 + ((i * 37) % 90), // varied target height per bar
  })),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function run() {
  if (!stage.value) return
  anim?.revert()
  const rects = Array.from(stage.value.querySelectorAll<SVGRectElement>('.bar'))
  // Each <rect> sits in a flipped <g>, so animating `height` grows it upward.
  // A single function value tweens from the current height (6) to each bar's peak.
  anim = animate(rects, {
    height: (el: Target) => Number((el as SVGRectElement).dataset.peak),
    duration: 620,
    delay: stagger(70, { from: 'center' }),
    loop: true,
    alternate: true,
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
    title="Equalizer"
    blurb="A center-out stagger animates each bar's height attribute on an alternating loop."
    :tags="['anime.js', 'attributes', 'stagger']"
    :source="source"
    filename="EqualizerDemo.vue"
  >
    <template #stage>
      <svg
        ref="stage"
        :viewBox="`0 0 ${16 * 2 + BARS * (W + GAP) - GAP} 180`"
        class="h-full w-full"
      >
        <defs>
          <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="hsl(175 84% 55%)" />
            <stop offset="1" stop-color="hsl(265 90% 66%)" />
          </linearGradient>
        </defs>
        <!-- flip each bar so height grows up from the baseline -->
        <g
          v-for="(b, i) in bars"
          :key="i"
          :transform="`translate(${b.x} ${BASE}) scale(1 -1)`"
        >
          <rect
            class="bar"
            :data-peak="b.peak"
            :x="-W / 2"
            y="0"
            :width="W"
            height="6"
            rx="5"
            fill="url(#eq-grad)"
          />
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
