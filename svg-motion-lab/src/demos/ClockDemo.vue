<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './ClockDemo.vue?raw'

const ticks = computed(() =>
  Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180
    const major = i % 3 === 0
    const r1 = major ? 70 : 78
    return {
      x1: 100 + r1 * Math.sin(a),
      y1: 100 - r1 * Math.cos(a),
      x2: 100 + 86 * Math.sin(a),
      y2: 100 - 86 * Math.cos(a),
      w: major ? 3 : 1.5,
    }
  }),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function build() {
  if (!stage.value) return
  anim?.pause()
  const hour = stage.value.querySelector<SVGLineElement>('.hand-hour')
  const minute = stage.value.querySelector<SVGLineElement>('.hand-min')
  const second = stage.value.querySelector<SVGLineElement>('.hand-sec')
  if (!hour || !minute || !second) return

  // A 1s linear loop is just a per-frame ticker; the hands read the real clock,
  // so the second hand sweeps smoothly (sub-second precision via milliseconds).
  anim = animate(
    { t: 0 },
    {
      t: 1,
      duration: 1000,
      loop: true,
      ease: 'linear',
      onUpdate: () => {
        const now = new Date()
        const s = now.getSeconds() + now.getMilliseconds() / 1000
        const m = now.getMinutes() + s / 60
        const h = (now.getHours() % 12) + m / 60
        second.setAttribute('transform', `rotate(${s * 6} 100 100)`)
        minute.setAttribute('transform', `rotate(${m * 6} 100 100)`)
        hour.setAttribute('transform', `rotate(${h * 30} 100 100)`)
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
onBeforeUnmount(() => anim?.pause())
</script>

<template>
  <DemoCard
    title="Live clock"
    blurb="A real-time analog clock — one anime loop ticks per frame and the hands read the system clock."
    :tags="['anime.js', 'onUpdate', 'transform']"
    :source="source"
    filename="ClockDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[78%]">
        <circle cx="100" cy="100" r="94" fill="none" stroke="hsl(230 18% 20%)" stroke-width="2" />
        <line
          v-for="(t, i) in ticks"
          :key="i"
          :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
          stroke="hsl(220 14% 45%)" :stroke-width="t.w" stroke-linecap="round"
        />
        <line class="hand-hour" x1="100" y1="112" x2="100" y2="56" stroke="hsl(220 20% 92%)" stroke-width="5" stroke-linecap="round" />
        <line class="hand-min" x1="100" y1="114" x2="100" y2="36" stroke="hsl(220 20% 92%)" stroke-width="3.5" stroke-linecap="round" />
        <line class="hand-sec" x1="100" y1="118" x2="100" y2="28" stroke="hsl(265 90% 66%)" stroke-width="2" stroke-linecap="round" />
        <circle cx="100" cy="100" r="4.5" fill="hsl(265 90% 66%)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
