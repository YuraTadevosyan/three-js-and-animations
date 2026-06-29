<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="container flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p class="font-mono text-6xl font-extrabold text-gradient">404</p>
    <p class="mt-4 text-muted-foreground">That page wandered off the motion path.</p>
    <RouterLink
      to="/"
      class="mt-8 rounded-xl border border-border/70 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      ← Back home
    </RouterLink>
  </div>
</template>
