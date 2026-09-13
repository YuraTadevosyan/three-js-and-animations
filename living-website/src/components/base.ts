import { LitElement } from 'lit'
import { organism } from '@/organism'
import type { OrganismEvents } from '@/organism/bus'
import type { OrganismState } from '@/organism/state'

/**
 * Base class for every organ on the page.
 *
 * Two deliberate departures from stock Lit:
 *
 * 1. Light DOM. Shadow DOM would wall each element off from the global
 *    Tailwind sheet, and the entire colour system here lives in CSS custom
 *    properties on :root. Rendering into the element itself keeps one design
 *    system instead of nine copies of it.
 *
 * 2. Organs tick only while they're on screen. This is the islands idea moved
 *    down a level: the garden stops growing frames when it's scrolled out of
 *    view, so an idle tab costs one shader draw rather than nine systems.
 */
export class Organ extends LitElement {
  /** Set on subclasses that must keep running off-screen (fixed backgrounds). */
  protected alwaysTick = false

  /** True while any part of the element intersects the viewport. */
  protected onScreen = true

  #teardown: (() => void)[] = []
  #observer?: IntersectionObserver

  protected createRenderRoot() {
    return this
  }

  connectedCallback(): void {
    super.connectedCallback()
    organism.registerOrgan()

    if (!this.alwaysTick) {
      this.onScreen = false
      this.#observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) this.onScreen = entry.isIntersecting
        },
        // A generous margin so an organ is already running by the time it
        // scrolls into view — nothing should visibly "start" as you reach it.
        { rootMargin: '240px 0px' },
      )
      this.#observer.observe(this)
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    organism.unregisterOrgan()
    this.#observer?.disconnect()
    for (const fn of this.#teardown) fn()
    this.#teardown = []
  }

  /** Per-frame work, gated on visibility and torn down automatically. */
  protected tick(fn: (dt: number, state: OrganismState) => void) {
    this.#teardown.push(
      organism.subscribe((dt, state) => {
        if (this.onScreen || this.alwaysTick) fn(dt, state)
      }),
    )
  }

  /** Subscribe to a discrete organism event, torn down automatically. */
  protected listen<K extends keyof OrganismEvents>(
    event: K,
    fn: (payload: OrganismEvents[K]) => void,
  ) {
    this.#teardown.push(organism.on(event, fn))
  }

  /** Register any other cleanup to run on disconnect. */
  protected cleanup(fn: () => void) {
    this.#teardown.push(fn)
  }

  /** Light-DOM query helper — `this` is the render root. */
  protected $<T extends Element = HTMLElement>(selector: string): T | null {
    return this.querySelector<T>(selector)
  }
}

export { organism }
