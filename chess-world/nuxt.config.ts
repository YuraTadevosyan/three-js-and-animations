// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // The world is a WebGL canvas driven by pointer input — there is nothing to
  // render on a server, so the whole app ships as a prerendered SPA shell.
  ssr: false,
  devtools: { enabled: false },

  app: {
    baseURL: '/three-js-and-animations/chess-world/',
    // GitHub Pages runs Jekyll, which refuses to serve any path segment that
    // starts with an underscore. A root-level `.nojekyll` is not an option
    // here (each app deploys into its own subfolder of one shared branch), so
    // the build output must simply not use Nuxt's default `_nuxt/` directory.
    buildAssetsDir: 'assets/',
    head: {
      htmlAttrs: { lang: 'en', class: 'dark' },
      title: 'Interactive Chess World',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'A chess game where every move is choreographed — knights leap, rooks charge, queens teleport, captured pieces burst into particles, and the camera follows all of it.',
        },
        { name: 'theme-color', content: '#05070f' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/three-js-and-animations/chess-world/favicon.svg' }],
    },
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  nitro: {
    // Emits 404.html alongside index.html so deep links fall back to the SPA.
    preset: 'github-pages',
  },

  vite: {
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules') && id.includes('playcanvas')) return 'playcanvas'
          },
        },
      },
    },
    worker: { format: 'es' },
  },
})
