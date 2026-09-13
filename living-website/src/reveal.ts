import { animate, inView, stagger } from 'motion'

/**
 * Scroll-triggered entrances.
 *
 * This is Motion's half of the split: one-shot transitions with a beginning
 * and an end. Continuous motion — breath, gaze, wind, growth — belongs to the
 * heartbeat, because two independent animation loops writing the same element
 * drift apart within seconds.
 */
export function setupReveals() {
  const root = document.documentElement
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    root.classList.remove('js-reveal')
    return
  }

  inView(
    '[data-reveal]',
    (element) => {
      const items = element.querySelectorAll('[data-reveal-item]')

      void animate(
        element,
        { opacity: [0, 1], transform: ['translateY(26px)', 'translateY(0px)'] },
        { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      )

      if (items.length) {
        void animate(
          items,
          { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
          { duration: 0.6, delay: stagger(0.07, { startDelay: 0.12 }), ease: [0.22, 1, 0.36, 1] },
        )
      }
    },
    { margin: '-10% 0px -10% 0px' },
  )
}
