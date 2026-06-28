<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { animate, svg, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const shapes = [
  { key: 'blob', label: 'Blob' },
  { key: 'star', label: 'Star' },
  { key: 'heart', label: 'Heart' },
] as const

const paths: Record<string, string> = {
  blob: 'M100 30 C 142 30 170 62 170 100 C 170 140 140 170 100 170 C 60 170 30 138 30 100 C 30 62 58 30 100 30 Z',
  star: 'M100 28 L118 76 L170 78 L128 110 L144 158 L100 130 L56 158 L72 110 L30 78 L82 76 Z',
  heart:
    'M100 166 C 38 122 28 80 54 58 C 78 38 100 60 100 80 C 100 60 122 38 146 58 C 172 80 162 122 100 166 Z',
}

const source = ref<SVGPathElement | null>(null)
const targets = ref<Record<string, SVGPathElement | null>>({})
const active = ref<(typeof shapes)[number]['key']>('blob')
let anim: JSAnimation | null = null

function morph(key: (typeof shapes)[number]['key']) {
  const target = targets.value[key]
  if (!source.value || !target || key === active.value) return
  active.value = key
  anim?.pause()
  anim = animate(source.value, {
    d: svg.morphTo(target),
    duration: 900,
    ease: 'inOut(3)',
  })
}

onBeforeUnmount(() => anim?.pause())
</script>

<template>
  <DemoCard
    title="Shape morphing"
    blurb="Interpolate one path's outline into another, even across different point counts."
    :tags="['anime.js', 'svg.morphTo', 'path d']"
  >
    <template #stage>
      <svg viewBox="0 0 200 200" class="h-full w-full">
        <defs>
          <linearGradient id="mo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(265 90% 66%)" />
            <stop offset="1" stop-color="hsl(175 84% 55%)" />
          </linearGradient>
        </defs>
        <!-- hidden morph targets -->
        <path
          v-for="s in shapes"
          :key="s.key"
          :ref="(el) => (targets[s.key] = el as unknown as SVGPathElement | null)"
          :d="paths[s.key]"
          class="hidden"
        />
        <path ref="source" :d="paths.blob" fill="url(#mo-grad)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton
        v-for="s in shapes"
        :key="s.key"
        :active="active === s.key"
        @click="morph(s.key)"
      >
        {{ s.label }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
