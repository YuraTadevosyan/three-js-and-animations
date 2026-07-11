import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
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
            if (id.includes('lottie')) return 'lottie'
            if (id.includes('animejs')) return 'anime'
            if (id.includes('kute.js') || id.includes('svg-path-commander') || id.includes('@thednp'))
              return 'kute'
            if (id.includes('/vue/') || id.includes('@vue') || id.includes('vue-router'))
              return 'vue-vendor'
          }
        },
      },
    },
  },
  base: '/three-js-and-animations/svg-motion-lab',
})
