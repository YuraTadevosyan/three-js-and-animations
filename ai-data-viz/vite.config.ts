import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('d3-force')) return 'd3-force'
            if (id.includes('d3-')) return 'd3'
            if (id.includes('svelte')) return 'svelte'
          }
        },
      },
    },
  },
  base: '/three-js-and-animations/ai-data-viz',
})
