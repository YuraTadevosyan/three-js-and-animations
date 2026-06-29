<script setup lang="ts">
import { RouterLink } from 'vue-router'

const techniques = [
  ['createDrawable', 'Stroke-dash line drawing'],
  ['morphTo', 'Path / polygon shape morphing'],
  ['stagger', 'Grid & sequential stagger waves'],
  ['createTimeline', 'Chained, looping sequences'],
  ['onUpdate', 'Scalar tweens (counters, motion paths)'],
  ['lottie-web', 'After Effects vector playback'],
]
</script>

<template>
  <div class="container max-w-3xl py-12 sm:py-16">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">About</h1>
    <p class="mt-4 text-pretty leading-relaxed text-muted-foreground">
      <strong class="text-foreground">SVG Motion Lab</strong> is a small gallery of
      interactive SVG animation techniques, built to explore code-driven vector motion.
      It's part of the
      <a
        href="https://github.com/YuraTadevosyan/three-js-and-animations"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary hover:underline"
      >three-js-and-animations</a>
      portfolio, where each app deliberately uses a different stack.
    </p>

    <h2 class="mt-10 text-lg font-semibold">Stack</h2>
    <ul class="mt-3 space-y-1.5 text-muted-foreground">
      <li>· <strong class="text-foreground">Vue 3</strong> (<code class="font-mono text-sm">&lt;script setup&gt;</code>) + Vite + TypeScript</li>
      <li>· <strong class="text-foreground">vue-router</strong> with hash history (GitHub Pages friendly)</li>
      <li>· <strong class="text-foreground">anime.js v4</strong> — the <code class="font-mono text-sm">svg</code> helpers, staggers and timelines</li>
      <li>· <strong class="text-foreground">lottie-web</strong> — light build, SVG renderer</li>
      <li>· <strong class="text-foreground">Tailwind CSS</strong> with HSL CSS-variable theming</li>
    </ul>

    <h2 class="mt-10 text-lg font-semibold">Techniques on show</h2>
    <div class="mt-3 grid gap-2 sm:grid-cols-2">
      <div
        v-for="[name, desc] in techniques"
        :key="name"
        class="rounded-lg border border-border/60 bg-card/50 px-4 py-3"
      >
        <p class="font-mono text-sm text-foreground">{{ name }}</p>
        <p class="text-sm text-muted-foreground">{{ desc }}</p>
      </div>
    </div>

    <div class="mt-10">
      <RouterLink
        to="/examples"
        class="rounded-xl bg-gradient-to-br from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Browse the examples →
      </RouterLink>
    </div>
  </div>
</template>
