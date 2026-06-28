<script setup lang="ts">
defineProps<{
  title: string
  blurb: string
  tags: string[]
}>()
</script>

<template>
  <article
    class="glass group flex flex-col overflow-hidden rounded-[var(--radius)] border border-border/70 shadow-2xl shadow-black/40 transition-colors hover:border-primary/40"
  >
    <div class="flex items-start justify-between gap-4 p-5 pb-3">
      <div>
        <h3 class="text-lg font-semibold tracking-tight">{{ title }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ blurb }}</p>
      </div>
    </div>

    <!-- Stage -->
    <div
      class="relative mx-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-[hsl(230_35%_4%)]"
    >
      <slot name="stage" />
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-2 px-5 py-4">
      <slot name="controls" />
    </div>

    <div class="mt-auto flex flex-wrap gap-1.5 border-t border-border/50 px-5 py-3">
      <span
        v-for="tag in tags"
        :key="tag"
        class="rounded-full bg-muted/60 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
      >
        {{ tag }}
      </span>
    </div>
  </article>
</template>
