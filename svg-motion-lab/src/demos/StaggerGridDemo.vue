<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, stagger, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const COLS = 11
const ROWS = 8
const GAP = 20
const PAD = 14

const dots = computed(() =>
  Array.from({ length: COLS * ROWS }, (_, i) => ({
    cx: PAD + (i % COLS) * GAP,
    cy: PAD + Math.floor(i / COLS) * GAP,
  })),
)

const origin = ['center', 'first', 'last'] as const
type Origin = (typeof origin)[number]
const from = ref<Origin>('center')

const stage = ref<SVGSVGElement | null>(null)
let anim: JSAnimation | null = null

function run() {
  if (!stage.value) return
  anim?.revert()
  const circles = Array.from(stage.value.querySelectorAll<SVGCircleElement>('.dot'))
  anim = animate(circles, {
    r: [2, 7],
    // anime's color parser only accepts comma-form hsl()/rgb()/hex — use hex.
    fill: ['#363b52', '#9b6cff'],
    delay: stagger(70, { grid: [COLS, ROWS], from: from.value }),
    duration: 700,
    loop: true,
    alternate: true,
    ease: 'inOutSine',
  })
}

function setFrom(value: Origin) {
  from.value = value
  run()
}

onMounted(run)
onBeforeUnmount(() => anim?.revert())
</script>

<template>
  <DemoCard
    title="Grid stagger wave"
    blurb="One call animates 88 nodes; the grid stagger ripples delay outward from an origin."
    :tags="['anime.js', 'stagger', 'grid']"
  >
    <template #stage>
      <svg
        ref="stage"
        :viewBox="`0 0 ${PAD * 2 + (COLS - 1) * GAP} ${PAD * 2 + (ROWS - 1) * GAP}`"
        class="h-full w-full"
      >
        <circle
          v-for="(d, i) in dots"
          :key="i"
          class="dot"
          :cx="d.cx"
          :cy="d.cy"
          r="2"
          fill="#363b52"
        />
      </svg>
    </template>

    <template #controls>
      <CtrlButton
        v-for="o in origin"
        :key="o"
        :active="from === o"
        @click="setFrom(o)"
      >
        from: {{ o }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
