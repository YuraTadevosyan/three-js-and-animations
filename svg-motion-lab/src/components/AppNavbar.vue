<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const links = [
  { to: '/', label: 'Home' },
  { to: '/examples', label: 'Examples' },
  { to: '/about', label: 'About' },
]

const open = ref(false)
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl"
  >
    <div class="container flex h-16 items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2.5 font-semibold tracking-tight">
        <span
          class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground"
        >
          SL
        </span>
        <span>SVG Motion Lab</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          active-class="!text-foreground"
          exact-active-class="!text-foreground"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-1">
        <a
          href="https://github.com/YuraTadevosyan/three-js-and-animations"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden rounded-lg border border-border/70 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:inline-block"
        >
          GitHub ↗
        </a>
        <button
          type="button"
          class="rounded-lg border border-border/70 p-2 text-muted-foreground md:hidden"
          aria-label="Toggle menu"
          :aria-expanded="open"
          @click="open = !open"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!open" d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" />
            <path v-else d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <nav
      v-if="open"
      class="container flex flex-col gap-1 border-t border-border/50 py-3 md:hidden"
    >
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        active-class="!text-foreground"
        exact-active-class="!text-foreground"
        @click="open = false"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
  </header>
</template>
