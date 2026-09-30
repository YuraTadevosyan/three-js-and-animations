import { component$, useSignal } from '@builder.io/qwik'
import { ERAS } from '@/timeline/eras'
import { goTo } from '@/timeline/progress'
import { useWorld } from '@/state/world'
import { toggleSound } from '@/state/sound'

/**
 * The year counter and the decade links. Both are driven by --t in CSS:
 * the counter is a registered <integer> fed into a CSS counter, and each
 * link brightens as t approaches its era. The links work as plain anchors
 * without JS; with JS they scroll through the timeline instead of jumping.
 */
export const Rail = component$(() => {
  const world = useWorld()
  const notes = useSignal(true)

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
      <div class="rail-toggles">
        {/* Off until asked for. Turning it on is also what lets each era
            greet you, and the song play. */}
        <button type="button" class={['rail-notes', world.sound && 'on']} aria-pressed={world.sound} onClick$={() => toggleSound(world)}>
          <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
            {world.sound ? (
              <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            ) : (
              <path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            )}
          </svg>
          {world.sound ? 'Sound on' : 'Sound off'}
        </button>
        <button
          type="button"
          class="rail-notes"
          aria-pressed={notes.value}
          onClick$={(_, el) => {
            notes.value = !notes.value
            const stage = el.closest<HTMLElement>('.stage')
            if (stage) stage.dataset.notes = notes.value ? 'on' : 'off'
          }}
        >
          {notes.value ? 'Hide notes' : 'Show notes'}
        </button>
      </div>
    </nav>
  )
})
