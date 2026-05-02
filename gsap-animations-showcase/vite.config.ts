import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
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
            if (id.includes('gsap')) return 'gsap'
            if (
              id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('scheduler')
            )
              return 'react-vendor'
          }
        },
      },
    },
  },
  base: '/three-js-and-animations/gsap-animations-showcase',
})
