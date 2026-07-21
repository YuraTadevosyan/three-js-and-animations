<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteLoaderDemo.vue?raw'

const N = 8
const dots = computed(() =>
  Array.from({ length: N }, (_, i) => {
    const a = (-90 + i * (360 / N)) * (Math.PI / 180)
    return {
      cx: 100 + Math.cos(a) * 58,
      cy: 100 + Math.sin(a) * 58,
      opacity: 1 - i / N,
    }
  }),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const ring = stage.value?.querySelector<SVGGElement>('.ring')
  if (!ring) return
  tween?.stop()
  // A continuous svgTransform spin — repeat without yoyo, linear easing — turns a ring
  // of graded-opacity dots into a classic loading spinner.
  tween = KUTE.fromTo(
    ring,
    { svgTransform: { rotate: 0 } },
    { svgTransform: { rotate: 360 } },
    { duration: 1400, repeat: 999, easing: 'linear', transformOrigin: '50% 50%' },
  )
  running.value ? tween.start() : null
}

function toggle() {
  if (!tween) return
  running.value = !running.value
  running.value ? tween.resume() : tween.pause()
}

onMounted(build)
onBeforeUnmount(() => tween?.stop())
</script>

<template>
  <DemoCard
    title="Loader spin"
    blurb="A continuous svgTransform rotation (repeat, no yoyo, linear) spins a graded ring of dots."
    :tags="['KUTE.js', 'svgTransform', 'loop']"
    :source="source"
    filename="KuteLoaderDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[64%]">
        <g class="ring">
          <circle
            v-for="(d, i) in dots"
            :key="i"
            :cx="d.cx"
            :cy="d.cy"
            r="10"
            fill="hsl(265 90% 66%)"
            :opacity="d.opacity"
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
