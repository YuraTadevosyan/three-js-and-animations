<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteCounterDemo.vue?raw'

const el = ref<HTMLSpanElement | null>(null)
let tween: KuteTween | null = null

function play() {
  if (!el.value) return
  tween?.stop()
  // KUTE's textWrite plugin exposes a `number` property that rewrites the element's
  // text each frame — an eased integer count with no manual onUpdate.
  tween = KUTE.fromTo(
    el.value,
    { number: 0 },
    { number: 2026 },
    { duration: 2000, easing: 'easingQuarticOut' },
  )
  tween.start()
}

onMounted(play)
onBeforeUnmount(() => tween?.stop())
</script>

<template>
  <DemoCard
    title="Number counter"
    blurb="The textWrite plugin's number property rewrites the element text each frame — an eased count, no onUpdate."
    :tags="['KUTE.js', 'number', 'textWrite']"
    :source="source"
    filename="KuteCounterDemo.vue"
  >
    <template #stage>
      <div class="flex h-full w-full items-center justify-center">
        <span ref="el" class="text-gradient font-mono text-6xl font-extrabold tabular-nums">0</span>
      </div>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
