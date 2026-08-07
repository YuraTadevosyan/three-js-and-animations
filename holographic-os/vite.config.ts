import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
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
            if (id.includes('ogl')) return 'ogl'
            if (id.includes('interactjs') || id.includes('@interactjs')) return 'interact'
            if (id.includes('preact')) return 'preact'
          }
        },
      },
    },
  },
  base: '/three-js-and-animations/holographic-os',
})
