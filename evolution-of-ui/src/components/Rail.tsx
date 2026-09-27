import { component$ } from '@builder.io/qwik'
import { ERAS } from '@/timeline/eras'
import { goTo } from '@/timeline/progress'

/**
 * The year counter and the decade links. Both are driven by --t in CSS:
 * the counter is a registered <integer> fed into a CSS counter, and each
 * link brightens as t approaches its era. The links work as plain anchors
 * without JS; with JS they scroll through the timeline instead of jumping.
 */
export const Rail = component$(() => {
  return (
    <nav class="rail" aria-label="Decades">
      <div class="rail-counter" aria-hidden="true" />
      <ol>
        {ERAS.map((e) => {
          const snap = e.snap
          return (
            <li key={e.id}>
              <a href={`#y${e.year}`} style={{ '--c': String(snap) }} preventdefault:click onClick$={() => goTo(snap)}>
                <span class="nm">{e.name}</span>
                <span class="yr">{e.year}</span>
                <span class="dot" aria-hidden="true" />
              </a>
            </li>
          )
        })}
      </ol>
      <button
        type="button"
        class="rail-notes"
        aria-pressed="true"
        onClick$={(_, el) => {
          const stage = el.closest<HTMLElement>('.stage')
          if (!stage) return
          const show = stage.dataset.notes === 'off'
          stage.dataset.notes = show ? 'on' : 'off'
          el.setAttribute('aria-pressed', String(show))
          el.textContent = show ? 'Hide notes' : 'Show notes'
        }}
      >
        Hide notes
      </button>
    </nav>
  )
})
