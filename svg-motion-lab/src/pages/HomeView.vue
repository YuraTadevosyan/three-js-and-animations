<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { animate, stagger, svg } from 'animejs'
import { demos } from '@/demos/registry'

const featured = demos.slice(0, 3)
const wordmark = ref<SVGSVGElement | null>(null)

onMounted(() => {
  if (!wordmark.value) return
  const drawables = svg.createDrawable(
    Array.from(wordmark.value.querySelectorAll<SVGGeometryElement>('.hero-stroke')),
  )
  animate(drawables, {
    draw: ['0 0', '0 1'],
    duration: 2200,
    delay: stagger(120),
    ease: 'inOutSine',
  })
})
</script>

<template>
  <div>
    <section class="container pb-8 pt-12 sm:pt-20">
      <div class="mx-auto max-w-3xl text-center">
        <p
          class="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground"
        >
          Vue 3 · anime.js · KUTE.js · Lottie
        </p>
        <h1 class="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
          Vector motion, <span class="text-gradient">drawn in code</span>
        </h1>

        <svg
          ref="wordmark"
          viewBox="0 0 360 80"
          class="mx-auto mt-8 h-16 w-full max-w-md"
          fill="none"
          stroke="hsl(175 84% 55%)"
          stroke-width="3"
          stroke-linecap="round"
        >
          <path class="hero-stroke" d="M20 60 C 20 20 70 20 70 40 C 70 60 30 56 30 70" />
          <path class="hero-stroke" d="M110 22 L110 62 M96 40 L124 40" />
          <path class="hero-stroke" d="M160 22 V62 M160 22 H190 M160 42 H184" />
          <path class="hero-stroke" d="M230 22 C 210 22 210 62 230 62 C 250 62 250 22 230 22 Z" />
          <path class="hero-stroke" d="M290 22 L290 62 L320 62" />
          <path class="hero-stroke" d="M340 22 L340 62" />
        </svg>

        <p class="mx-auto mt-6 max-w-xl text-pretty text-muted-foreground">
          A lab of interactive SVG animation techniques — line drawing, shape morphing,
          grid staggers and motion paths with anime.js, path morphing and transforms with
          KUTE.js, plus runtime-controlled Lottie.
        </p>

        <div class="mt-8 flex items-center justify-center gap-3">
          <RouterLink
            to="/examples"
            class="rounded-xl bg-gradient-to-br from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            Explore examples →
          </RouterLink>
          <RouterLink
            to="/about"
            class="rounded-xl border border-border/70 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            About
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="container pb-20 pt-8">
      <div class="mb-6 flex items-end justify-between">
        <h2 class="text-lg font-semibold tracking-tight">Featured</h2>
        <RouterLink to="/examples" class="text-sm text-primary hover:underline">
          View all {{ demos.length }} →
        </RouterLink>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <component :is="d.component" v-for="d in featured" :key="d.slug" />
      </div>
    </section>
  </div>
</template>
