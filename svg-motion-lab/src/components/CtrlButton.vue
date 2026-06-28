<script setup lang="ts">
defineProps<{ active?: boolean }>()
</script>

<template>
  <button
    type="button"
    class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-all active:scale-95"
    :class="
      active
        ? 'border-primary/60 bg-primary/15 text-foreground'
        : 'border-border/70 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
    "
  >
    <slot />
  </button>
</template>
