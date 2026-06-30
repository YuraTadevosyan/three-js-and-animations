<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  code: string
  filename?: string
}>()

const open = ref(false)
const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.code)
    } else {
      // Fallback for non-secure contexts / older browsers.
      const ta = document.createElement('textarea')
      ta.value = props.code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => (copied.value = false), 1800)
  } catch {
    // clipboard blocked — ignore
  }
}
</script>

<template>
  <section class="border-t border-border/50">
    <header class="flex items-center justify-between gap-3 px-5 py-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        :aria-expanded="open"
        @click="open = !open"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
        </svg>
        <span class="font-mono text-xs">{{ filename ?? 'Source' }}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="transition-transform" :class="open && 'rotate-180'"
        >
          <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        aria-live="polite"
        @click="copy"
      >
        <template v-if="copied">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copied
        </template>
        <template v-else>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </template>
      </button>
    </header>

    <div v-if="open" class="max-h-[50vh] overflow-auto border-t border-border/50 bg-[hsl(230_35%_4%)]">
      <pre class="m-0 p-4 text-[11px] leading-relaxed"><code class="font-mono text-foreground/90">{{ code }}</code></pre>
    </div>
  </section>
</template>
