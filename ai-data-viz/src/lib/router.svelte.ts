/**
 * A hash router in about forty lines.
 *
 * Hash routing rather than history routing because the app is served from a
 * GitHub Pages subpath with no server-side rewrite — a deep link like
 * `/ai-data-viz/d/climate` would 404, `#/d/climate` never does.
 */

export interface Route {
  /** 'home' | 'about' | 'dataset' */
  name: 'home' | 'about' | 'dataset' | 'notfound'
  /** Dataset id, when name === 'dataset'. */
  id?: string
}

function parse(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'home' }
  if (parts[0] === 'about') return { name: 'about' }
  if (parts[0] === 'd' && parts[1]) return { name: 'dataset', id: parts[1] }
  return { name: 'notfound' }
}

class Router {
  route = $state<Route>(parse(location.hash))

  constructor() {
    addEventListener('hashchange', () => {
      this.route = parse(location.hash)
      // A hash change is a navigation, so it should behave like one.
      scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    })
  }

  go(path: string) {
    location.hash = path.startsWith('#') ? path : `#${path}`
  }

  /** True when `path` is the current route — for nav `aria-current`. */
  isActive(path: string): boolean {
    const target = parse(path.startsWith('#') ? path : `#${path}`)
    if (target.name !== this.route.name) return false
    return target.id === this.route.id
  }
}

export const router = new Router()

export function href(path: string): string {
  return `#${path}`
}
