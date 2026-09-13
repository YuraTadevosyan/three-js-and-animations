// @ts-check
import { defineConfig } from 'astro/config'
import path from 'node:path'

// https://astro.build/config
export default defineConfig({
  site: 'https://yuratadevosyan.github.io',
  base: '/three-js-and-animations/living-website',
  trailingSlash: 'ignore',
  build: { format: 'file' },
  devToolbar: { enabled: false },
  vite: {
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('pixi.js')) return 'pixi'
            if (id.includes('/lit') || id.includes('@lit')) return 'lit'
            if (id.includes('motion')) return 'motion'
          },
        },
      },
    },
  },
})
