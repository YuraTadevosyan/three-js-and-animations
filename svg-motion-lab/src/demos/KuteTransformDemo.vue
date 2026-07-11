<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteTransformDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const emblem = stage.value?.querySelector<SVGGElement>('.emblem')
  if (!emblem) return
  tween?.stop()
  // KUTE's SVG-transform plugin uses a single `svgTransform` property whose value is
  // an object of transform functions; it writes one `transform` attribute about a
  // bbox-relative origin. yoyo makes the spin-and-breathe seamless — it eases out to
  // 360°/1.35× then eases back, so there's no snap between loops.
  tween = KUTE.fromTo(
    emblem,
    { svgTransform: { rotate: 0, scale: 1 } },
    { svgTransform: { rotate: 360, scale: 1.35 } },
    {
      duration: 2400,
      repeat: 999,
      yoyo: true,
      transformOrigin: '50% 50%',
      easing: 'easingCubicInOut',
    },
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
    title="SVG transform"
    blurb="Rotate and scale an SVG group about a bbox-relative origin — one svgTransform property, one transform attribute."
    :tags="['KUTE.js', 'svgTransform', 'origin']"
    :source="source"
    filename="KuteTransformDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[62%]">
        <g class="emblem">
          <rect
            x="62" y="62" width="76" height="76" rx="18"
            fill="none" stroke="hsl(265 90% 66%)" stroke-width="6"
          />
          <circle cx="100" cy="100" r="20" fill="hsl(200 90% 60%)" />
          <circle cx="100" cy="52" r="7" fill="hsl(265 90% 72%)" />
          <circle cx="148" cy="100" r="7" fill="hsl(320 85% 66%)" />
          <circle cx="100" cy="148" r="7" fill="hsl(150 80% 55%)" />
          <circle cx="52" cy="100" r="7" fill="hsl(40 95% 60%)" />
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
