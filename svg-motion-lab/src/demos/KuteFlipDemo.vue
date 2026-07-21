<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteFlipDemo.vue?raw'

const card = ref<HTMLDivElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  if (!card.value) return
  tween?.stop()
  // Beyond SVG, KUTE also animates the CSS `transform` — here a 3D rotateY on a plain
  // div (the parent supplies perspective). yoyo flips it front-to-back and back again.
  tween = KUTE.fromTo(
    card.value,
    { transform: { rotateY: 0 } },
    { transform: { rotateY: 180 } },
    { duration: 1600, repeat: 999, yoyo: true, easing: 'easingCubicInOut' },
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
    title="CSS 3D flip"
    blurb="KUTE animates CSS transforms too — a rotateY flip on a div, with perspective for real depth."
    :tags="['KUTE.js', 'transform', 'rotateY']"
    :source="source"
    filename="KuteFlipDemo.vue"
  >
    <template #stage>
      <div class="flex h-full w-full items-center justify-center" style="perspective: 700px">
        <div
          ref="card"
          class="flex h-28 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground shadow-lg"
          style="transform-style: preserve-3d"
        >
          KUTE
        </div>
      </div>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
