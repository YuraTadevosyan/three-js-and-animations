<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { animate, stagger, svg } from 'animejs'
import LineDrawDemo from '@/demos/LineDrawDemo.vue'
import MorphDemo from '@/demos/MorphDemo.vue'
import StaggerGridDemo from '@/demos/StaggerGridDemo.vue'
import MotionPathDemo from '@/demos/MotionPathDemo.vue'
import LottieDemo from '@/demos/LottieDemo.vue'

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
  <div class="min-h-dvh">
    <header
      class="sticky top-0 z-20 border-b border-border/50 bg-background/70 backdrop-blur-xl"
    >
      <div class="container flex items-center justify-between py-4">
        <div class="flex items-center gap-2.5">
          <span
            class="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground"
          >
            SL
          </span>
          <span class="font-semibold tracking-tight">SVG Motion Lab</span>
        </div>
        <a
          href="https://github.com/YuraTadevosyan/three-js-and-animations"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-lg border border-border/70 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          GitHub ↗
        </a>
      </div>
    </header>

    <main class="container pb-24 pt-12">
      <section class="mx-auto max-w-3xl text-center">
        <p
          class="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground"
        >
          Vue 3 · anime.js v4 · Lottie
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
          grid staggers and motion paths with anime.js v4, plus runtime-controlled Lottie.
        </p>
      </section>

      <section
        class="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
      >
        <LineDrawDemo />
        <MorphDemo />
        <StaggerGridDemo />
        <MotionPathDemo />
        <LottieDemo />
      </section>
    </main>

    <footer class="border-t border-border/50">
      <div
        class="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row"
      >
        <span>SVG Motion Lab — part of three-js-and-animations</span>
        <span class="font-mono text-xs">Vue 3 + Vite · anime.js v4 · lottie-web</span>
      </div>
    </footer>
  </div>
</template>
