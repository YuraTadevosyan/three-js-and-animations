<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { animate, stagger } from 'animejs'
import { demos } from '@/demos/registry'

const query = ref('')
const grid = ref<HTMLElement | null>(null)

// Technology chips: 'All' + each distinct library, in registry order.
const libs = ['All', ...Array.from(new Set(demos.map((d) => d.lib)))]
const activeLib = ref<string>('All')

function countFor(lib: string) {
  return lib === 'All' ? demos.length : demos.filter((d) => d.lib === lib).length
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return demos.filter((d) => {
    if (activeLib.value !== 'All' && d.lib !== activeLib.value) return false
    if (!q) return true
    return (
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.lib.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q))
    )
  })
})

function playEntrance() {
  if (!grid.value) return
  const items = Array.from(grid.value.querySelectorAll<HTMLElement>('.demo-item'))
  if (!items.length) return
  animate(items, {
    opacity: [0, 1],
    translateY: [18, 0],
    duration: 480,
    delay: stagger(55),
    ease: 'out(3)',
  })
}

onMounted(playEntrance)
watch(filtered, () => nextTick(playEntrance))
</script>

<template>
  <div class="container py-10 sm:py-14">
    <header class="mb-8 flex flex-col gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Examples</h1>
        <p class="mt-2 text-muted-foreground">
          {{ demos.length }} interactive SVG animation techniques — search by name, tag or library.
        </p>
      </div>
      <!-- Technology filter -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="lib in libs"
          :key="lib"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            activeLib === lib
              ? 'border-primary/60 bg-primary/15 text-foreground'
              : 'border-border/70 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'
          "
          @click="activeLib = lib"
        >
          {{ lib }}
          <span class="rounded-full bg-muted/70 px-1.5 text-[11px] font-mono text-muted-foreground">
            {{ countFor(lib) }}
          </span>
        </button>
      </div>

      <div class="relative max-w-md">
        <svg
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" stroke-linecap="round" />
        </svg>
        <input
          v-model="query"
          type="search"
          placeholder="Search by title, tag, or library…"
          class="h-10 w-full rounded-lg border border-border/70 bg-muted/30 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </header>

    <div ref="grid" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="d in filtered" :key="d.slug" class="demo-item">
        <component :is="d.component" />
      </div>
    </div>

    <p v-if="filtered.length === 0" class="py-20 text-center text-muted-foreground">
      No examples match “{{ query }}”.
    </p>
  </div>
</template>
