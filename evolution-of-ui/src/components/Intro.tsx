import { component$ } from '@builder.io/qwik'
import { ERAS } from '@/timeline/eras'

export const Intro = component$(() => {
  return (
    <section class="layer layer-intro" aria-labelledby="intro-title">
      <div class="intro-inner">
        <p class="intro-eyebrow">1980 — 2040 · sixty years of interfaces</p>
        <h1 id="intro-title" class="intro-title">
          The Evolution of UI
        </h1>
        <p class="intro-lede">
          One little computer (<b>a note, a photo, a song and three messages</b>) redrawn by every decade it lives
          through. Write something in 1980. It will still be there in 2040.
        </p>
        <ol class="intro-tiles" aria-label="The six eras">
          {ERAS.map((e) => (
            <li key={e.id} class="intro-tile">
              <div class={`shot shot-${e.id}`} aria-hidden="true" />
              <span class="yr">{e.year}</span>
              <span class="nm">{e.name}</span>
            </li>
          ))}
        </ol>
        <p class="intro-cue">
          Scroll to power on
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M12 4v15M6 13l6 6 6-6" />
          </svg>
        </p>
      </div>
    </section>
  )
})
