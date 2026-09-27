/**
 * Base Vite config. `adapters/static/vite.config.ts` extends this for the
 * static-site (SSG) build that ends up on GitHub Pages.
 */
import { defineConfig, type Plugin, type UserConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { LAKE_SVG } from './src/lib/landscape'

const BASE = '/three-js-and-animations/evolution-of-ui/'

/**
 * lake.svg is generated, not drawn: the same seeded function renders it here
 * at build time and again in the browser for the eras that need pixels.
 * Emitting it as one cached file keeps five copies of it out of the HTML.
 */
function lakeSvg(): Plugin {
  let ssr = false
  return {
    name: 'evolution-of-ui:lake-svg',
    configResolved(config) {
      ssr = !!config.build.ssr
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== `${BASE}lake.svg`) return next()
        res.setHeader('Content-Type', 'image/svg+xml')
        res.end(LAKE_SVG)
      })
    },
    generateBundle() {
      if (!ssr) this.emitFile({ type: 'asset', fileName: 'lake.svg', source: LAKE_SVG })
    },
  }
}

export default defineConfig((): UserConfig => {
  return {
    // Qwik City reads its basePathname from here, so every route, asset and
    // build chunk is emitted under the gh-pages subpath.
    base: BASE,
    plugins: [qwikCity({ trailingSlash: true }), qwikVite(), tsconfigPaths({ root: '.' }), lakeSvg()],
    server: {
      port: 5187,
      headers: { 'Cache-Control': 'public, max-age=0' },
    },
    preview: {
      port: 5187,
      headers: { 'Cache-Control': 'public, max-age=600' },
    },
  }
})
