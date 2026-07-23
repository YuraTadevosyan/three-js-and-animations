import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Deployed under https://yuratadevosyan.github.io/three-js-and-animations/infinite-universe/
export const BASE_PATH = '/three-js-and-animations/infinite-universe/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: [
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/postprocessing',
          ],
          gsap: ['gsap'],
        },
      },
    },
  },
});
