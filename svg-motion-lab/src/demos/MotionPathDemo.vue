<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const TRACK = 'M40 80 C 40 28 100 28 120 80 C 140 132 200 132 200 80 C 200 28 140 28 120 80 C 100 132 40 132 40 80 Z'

const stage = ref<SVGSVGElement | null>(null)
let anim: JSAnimation | null = null
const running = ref(true)

function build() {
  if (!stage.value) return
  const path = stage.value.querySelector<SVGPathElement>('.track')
  const follower = stage.value.querySelector<SVGGElement>('.follower')
  if (!path || !follower) return

  const len = path.getTotalLength()
  const state = { dist: 0 }

  // Drive a scalar along the path with anime, then place the follower with the
  // SVG `transform` attribute (universal support) and rotate it to the tangent.
  anim = animate(state, {
    dist: len,
    duration: 4500,
    loop: true,
    ease: 'linear',
    onUpdate: () => {
      const p = path.getPointAtLength(state.dist % len)
      const ahead = path.getPointAtLength((state.dist + 1) % len)
      const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI
      follower.setAttribute(
        'transform',
        `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${angle.toFixed(2)})`,
      )
    },
  })
}

function toggle() {
  if (!anim) return
  running.value = !running.value
  running.value ? anim.play() : anim.pause()
}

onMounted(build)
onBeforeUnmount(() => anim?.pause())
</script>

<template>
  <DemoCard
    title="Motion path"
    blurb="An element rides an SVG path, auto-rotating to follow the tangent of the curve."
    :tags="['anime.js', 'getPointAtLength', 'tangent']"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 240 160" class="h-full w-full">
        <path
          :d="TRACK"
          class="track"
          fill="none"
          stroke="hsl(230 18% 26%)"
          stroke-width="2"
          stroke-dasharray="2 6"
          stroke-linecap="round"
        />
        <g class="follower" transform="translate(40 80)">
          <circle r="9" fill="hsl(265 90% 66%)" />
          <path d="M0 -4 L7 0 L0 4 Z" fill="hsl(175 84% 60%)" />
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
