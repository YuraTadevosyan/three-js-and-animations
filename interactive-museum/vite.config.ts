import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@babylonjs')) return 'babylon'
            if (id.includes('solid-js')) return 'solid'
          }
        },
      },
    },
  },
  base: '/three-js-and-animations/interactive-museum',
})
