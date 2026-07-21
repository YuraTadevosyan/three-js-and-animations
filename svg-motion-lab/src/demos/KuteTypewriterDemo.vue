<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteTypewriterDemo.vue?raw'

const PHRASE = 'Vector motion, written in code.'
const el = ref<HTMLSpanElement | null>(null)
let tween: KuteTween | null = null

function play() {
  if (!el.value) return
  tween?.stop()
  el.value.textContent = ''
  // The `text` property tweens one string into another; textChars:'alpha' scrambles
  // through random letters before each character locks in.
  tween = KUTE.fromTo(
    el.value,
    { text: '' },
    { text: PHRASE },
    { duration: 2200, textChars: 'alpha', easing: 'linear' },
  )
  tween.start()
}

onMounted(play)
onBeforeUnmount(() => tween?.stop())
</script>

<template>
  <DemoCard
    title="Typewriter"
    blurb="KUTE's text property scrambles one string into another — a decode-to-reveal typing effect."
    :tags="['KUTE.js', 'text', 'textWrite']"
    :source="source"
    filename="KuteTypewriterDemo.vue"
  >
    <template #stage>
      <div class="flex h-full w-full items-center justify-center px-4">
        <span ref="el" class="text-center font-mono text-xl font-semibold text-foreground" />
        <span class="ml-0.5 inline-block h-6 w-[3px] animate-pulse bg-primary" />
      </div>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
