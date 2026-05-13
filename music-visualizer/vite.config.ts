import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Deployed under https://yuratadevosyan.github.io/three-js-and-animations/music-visualizer/
export const BASE_PATH = '/three-js-and-animations/music-visualizer/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // jsmediatags ships a UMD `dist/jsmediatags.min.js` but its package.json
      // points its `browser` field at a non-existent `dist/jsmediatags.js`.
      jsmediatags: 'jsmediatags/dist/jsmediatags.min.js',
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
          r3f: ['@react-three/fiber', '@react-three/postprocessing'],
        },
      },
    },
  },
  assetsInclude: ['**/*.glsl', '**/*.vs', '**/*.fs', '**/*.vert', '**/*.frag'],
});
