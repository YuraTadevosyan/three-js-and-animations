<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './BurstDemo.vue?raw'

const N = 16
const R = 78
const rays = Array.from({ length: N }, (_, i) => i)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function build() {
  const dots = Array.from(stage.value?.querySelectorAll<SVGCircleElement>('.spark') ?? [])
  if (!dots.length) return
  anim?.revert()
  // A single looping progress tween emits every dot outward on a phase offset, so the
  // burst keeps radiating. Each dot's radius/opacity is derived from its own fraction
  // of the cycle — anime just supplies the clock.
  anim = animate(
    { t: 0 },
    {
      t: 1,
      duration: 1600,
      loop: true,
      ease: 'linear',
      onUpdate: (self: JSAnimation) => {
        const p = self.iterationProgress
        dots.forEach((dot, i) => {
          const frac = (p + i / N) % 1
          const eased = 1 - (1 - frac) * (1 - frac)
          const ang = (i / N) * Math.PI * 2
          dot.setAttribute('cx', (100 + Math.cos(ang) * eased * R).toFixed(2))
          dot.setAttribute('cy', (100 + Math.sin(ang) * eased * R).toFixed(2))
          dot.setAttribute('r', (6 * (1 - frac) + 1).toFixed(2))
          dot.setAttribute('opacity', (1 - frac).toFixed(2))
        })
      },
    },
  )
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
    title="Radial burst"
    blurb="A looping progress tween radiates every spark outward on its own phase — a continuous particle emitter."
    :tags="['anime.js', 'onUpdate', 'loop']"
    :source="source"
    filename="BurstDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[78%]">
        <circle cx="100" cy="100" r="6" fill="hsl(265 90% 72%)" />
        <circle v-for="i in rays" :key="i" class="spark" cx="100" cy="100" r="4" fill="hsl(200 90% 62%)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
