import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { compression } from 'vite-plugin-compression2';
import path from 'node:path';

// Deployed under https://yuratadevosyan.github.io/three-js-and-animations/three-webgl-showcase/
export const BASE_PATH = '/three-js-and-animations/three-webgl-showcase/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    compression({ algorithm: 'brotliCompress', exclude: [/\.(br)$/, /\.(gz)$/] }),
    compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
  ],
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
          r3f: ['@react-three/fiber', '@react-three/drei'],
          tanstack: [
            '@tanstack/react-router',
            '@tanstack/react-query',
          ],
        },
      },
    },
  },
  assetsInclude: ['**/*.glsl', '**/*.vs', '**/*.fs', '**/*.vert', '**/*.frag'],
});
