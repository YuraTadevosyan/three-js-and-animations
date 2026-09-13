/**
 * The only entry point.
 *
 * Astro ships this page as static HTML with the custom-element tags already
 * in it; importing the modules below defines those elements, which upgrades
 * the markup in place. Nothing is client-rendered — if this bundle never
 * arrives, the page is still readable, navigable and correctly coloured.
 */
import { organism } from '@/organism'

import './components/living-sky'
import './components/living-eyes'
import './components/living-button'
import './components/living-title'
import './components/organ-card'
import './components/cursor-aura'
import './components/garden-bed'
import './components/sky-controls'
import './components/vitals-panel'
import './components/palette-strip'
import './components/pulse-badge'

import { setupNotices } from './notices'
import { setupReveals } from './reveal'

organism.boot()
setupReveals()
setupNotices()

// Tells the failsafe in the layout that the bundle made it.
document.documentElement.dataset.awake = '1'

declare global {
  interface Window {
    /** Exposed deliberately: the point of the page is that its state is legible. */
    organism: typeof organism
  }
}
window.organism = organism
